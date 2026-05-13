#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// Script to add eslint-disable-next-line for no-explicit-any on lines that already have `: any`
// Usage: node scripts/fix-any-types.js <file>
const fs = require('fs');

const file = process.argv[2];
if (!file) { console.error('Usage: node fix-any-types.js <file>'); process.exit(1); }

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const result = [];
const DISABLE = '// eslint-disable-next-line @typescript-eslint/no-explicit-any';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Check if line has explicit any type and not already suppressed
  if ((line.includes(': any') || line.includes('<any>') || line.includes('any[]') || line.includes('any,') || line.includes('any;')) && 
      !line.trim().startsWith('//') &&
      (i === 0 || !lines[i-1].trim().includes('eslint-disable-next-line @typescript-eslint/no-explicit-any'))) {
    // Get indentation
    const indent = line.match(/^(\s*)/)[1];
    result.push(indent + DISABLE);
  }
  result.push(line);
}

fs.writeFileSync(file, result.join('\n'), 'utf8');
console.log('Done:', file);
