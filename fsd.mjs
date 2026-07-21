import fs from 'node:fs'
import path from 'node:path'

const LAYERS = ['shared', 'entities', 'features', 'widgets', 'pages', 'app']
const SLICED = new Set(['entities', 'features', 'widgets'])
const LAYER_RE =
  /^(.*\/src)\/(app|pages|widgets|features|entities|shared)(?:\/(.*))?$/

function classify(absPath) {
  const match = absPath.split(path.sep).join('/').match(LAYER_RE)
  if (!match) return null
  return {
    srcRoot: match[1],
    layer: match[2],
    rank: LAYERS.indexOf(match[2]),
    rest: match[3] ?? '',
  }
}

function hasIndex(dir) {
  return (
    fs.existsSync(path.join(dir, 'index.ts')) ||
    fs.existsSync(path.join(dir, 'index.tsx'))
  )
}

function sliceDepth(srcRoot, layer, restSegments) {
  for (let depth = 1; depth <= restSegments.length; depth++) {
    const candidate = path.join(srcRoot, layer, ...restSegments.slice(0, depth))
    if (hasIndex(candidate)) return depth
  }
  return -1
}

const boundaries = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce FSD layer direction, slice isolation, and public-API imports',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename()
    if (!filename || /\.gen\.(ts|tsx)$/.test(filename)) return {}
    const importerAbs = path.resolve(filename)
    const importer = classify(importerAbs)
    if (!importer) return {}

    const importerDir = path.dirname(importerAbs)
    const importerDirInfo = classify(importerDir)
    let importerSliceAbs = null
    if (SLICED.has(importer.layer) && importerDirInfo) {
      const segments = importerDirInfo.rest
        ? importerDirInfo.rest.split('/')
        : []
      const depth = sliceDepth(importer.srcRoot, importer.layer, segments)
      if (depth !== -1) {
        importerSliceAbs = path.join(
          importer.srcRoot,
          importer.layer,
          ...segments.slice(0, depth),
        )
      }
    }

    function check(node, specifier) {
      let targetAbs
      let aliasUsed
      if (specifier.startsWith('@/')) {
        targetAbs = path.join(importer.srcRoot, specifier.slice(2))
        aliasUsed = true
      } else if (specifier.startsWith('.')) {
        targetAbs = path.resolve(importerDir, specifier)
        aliasUsed = false
      } else {
        return
      }
      const target = classify(targetAbs)
      if (!target || target.srcRoot !== importer.srcRoot) return

      if (target.rank > importer.rank) {
        context.report({
          node,
          message: `FSD: "${importer.layer}" must not import from higher layer "${target.layer}".`,
        })
        return
      }

      if (target.rank === importer.rank) {
        if (target.layer === 'shared' || target.layer === 'app') return
        if (target.layer === 'pages') {
          context.report({
            node,
            message:
              'FSD: pages must not import each other; compose in a layout route or lift shared code down.',
          })
          return
        }
        const insideOwnSlice =
          importerSliceAbs !== null &&
          (targetAbs === importerSliceAbs ||
            targetAbs.startsWith(importerSliceAbs + path.sep))
        if (insideOwnSlice) {
          if (aliasUsed) {
            context.report({
              node,
              message:
                'FSD: use a relative path for imports within the same slice.',
            })
          }
          return
        }
        context.report({
          node,
          message: `FSD: cross-import between "${importer.layer}" slices; sink the shared code to a lower layer or wire the slices on a higher one.`,
        })
        return
      }

      if (!aliasUsed) {
        context.report({
          node,
          message: `FSD: import lower layer "${target.layer}" via its alias path, not a relative path.`,
        })
        return
      }

      if (SLICED.has(target.layer)) {
        const segments = target.rest ? target.rest.split('/') : []
        const depth = sliceDepth(target.srcRoot, target.layer, segments)
        if (depth !== -1 && segments.length > depth) {
          context.report({
            node,
            message: `FSD: import the slice public API ("@/${target.layer}/${segments.slice(0, depth).join('/')}"), not its internals.`,
          })
        }
      }
    }

    return {
      ImportDeclaration(node) {
        check(node, node.source.value)
      },
      ExportNamedDeclaration(node) {
        if (node.source) check(node, node.source.value)
      },
      ExportAllDeclaration(node) {
        check(node, node.source.value)
      },
    }
  },
}

export default {
  meta: { name: 'fsd' },
  rules: { boundaries },
}
