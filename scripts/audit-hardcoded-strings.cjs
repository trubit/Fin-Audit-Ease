const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.tsx')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('src');
const hardcodedInFiles = [];

// Regular expression to match raw text inside JSX tags like <span>Some Text</span> or <button>Some Text</button>
// Ignoring pure whitespace, numeric, single punctuation, or expressions { ... }
const jsxTextRegex = />\s*([A-Za-z][A-Za-z0-9 ,.?!:;'-]{3,})\s*</g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Skip test files
  if (file.includes('__tests__') || file.includes('.test.')) continue;

  const lines = content.split('\n');
  const fileIssues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ignore lines that are comments or imports
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*') || line.trim().startsWith('import ')) {
      continue;
    }
    
    let match;
    while ((match = jsxTextRegex.exec(line)) !== null) {
      const text = match[1].trim();
      // Filter out technical, component names, CSS, icons, or already localized expressions
      if (
        !text.includes('{') &&
        !text.includes('}') &&
        !text.startsWith('http') &&
        !text.startsWith('var(') &&
        !['React', 'Fragment', 'SVG', 'HTML'].includes(text)
      ) {
        fileIssues.push({ line: i + 1, text });
      }
    }
  }

  if (fileIssues.length > 0) {
    hardcodedInFiles.push({ file, issues: fileIssues });
  }
}

console.log('Files with potential hardcoded JSX text:', hardcodedInFiles.length);
let totalStrings = 0;
for (const item of hardcodedInFiles) {
  totalStrings += item.issues.length;
  console.log(`\n--- ${item.file} (${item.issues.length} items) ---`);
  for (const iss of item.issues.slice(0, 10)) {
    console.log(`  Line ${iss.line}: "${iss.text}"`);
  }
  if (item.issues.length > 10) {
    console.log(`  ... and ${item.issues.length - 10} more`);
  }
}
console.log('\nTotal potential hardcoded strings found:', totalStrings);
