#!/usr/bin/env node
/**
 * analyze.js — Quick codebase analysis script for researchers.
 *
 * Usage:
 *   node scripts/analyze.js              # Full report
 *   node scripts/analyze.js deps         # List external dependencies
 *   node scripts/analyze.js largest      # Top 20 largest files
 *   node scripts/analyze.js dirs         # Line counts by directory
 */

import { readdirSync, statSync, readFileSync } from 'fs'
import { join, extname, relative } from 'path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const SRC = join(ROOT, 'src')

function walk(dir, exts = ['.ts', '.tsx']) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) results.push(...walk(full, exts))
    else if (exts.includes(extname(entry.name))) results.push(full)
  }
  return results
}

function countLines(file) {
  try {
    return readFileSync(file, 'utf8').split('\n').length
  } catch {
    return 0
  }
}

function extractImports(file) {
  try {
    const text = readFileSync(file, 'utf8')
    const matches = text.match(/^import[^'"]*from\s+'([^']+)'/gm) || []
    return matches.map(m => m.match(/from\s+'([^']+)'/)[1])
  } catch {
    return []
  }
}

const cmd = process.argv[2] || 'all'
const files = walk(SRC)

if (cmd === 'deps' || cmd === 'all') {
  const deps = new Set()
  for (const f of files) {
    for (const imp of extractImports(f)) {
      if (!imp.startsWith('.') && !imp.startsWith('src/')) {
        // Strip sub-path to get package name
        const pkg = imp.startsWith('@') ? imp.split('/').slice(0, 2).join('/') : imp.split('/')[0]
        deps.add(pkg)
      }
    }
  }
  const sorted = [...deps].sort()
  if (cmd === 'deps') {
    console.log(`\nExternal dependencies (${sorted.length}):\n`)
    sorted.forEach(d => console.log(' ', d))
  } else {
    console.log(`External dependencies: ${sorted.length}`)
  }
}

if (cmd === 'largest' || cmd === 'all') {
  const sized = files.map(f => ({ file: relative(ROOT, f), lines: countLines(f) }))
  sized.sort((a, b) => b.lines - a.lines)
  console.log('\nTop 20 largest files:\n')
  sized.slice(0, 20).forEach(({ file, lines }) =>
    console.log(`  ${String(lines).padStart(6)}  ${file}`)
  )
}

if (cmd === 'dirs' || cmd === 'all') {
  const dirTotals = {}
  for (const f of files) {
    const rel = relative(SRC, f)
    const topDir = rel.includes('/') ? rel.split('/')[0] : '(root)'
    dirTotals[topDir] = (dirTotals[topDir] || 0) + countLines(f)
  }
  const sorted = Object.entries(dirTotals).sort((a, b) => b[1] - a[1])
  console.log('\nLines by top-level directory:\n')
  sorted.forEach(([dir, lines]) =>
    console.log(`  ${String(lines).padStart(8)}  src/${dir}`)
  )
}

if (cmd === 'all') {
  const total = files.reduce((s, f) => s + countLines(f), 0)
  console.log(`\nTotal: ${files.length} files, ${total.toLocaleString()} lines\n`)
}
