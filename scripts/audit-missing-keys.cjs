const fs = require('fs');
const path = require('path');

const en = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));

function flatten(obj, prefix = '') {
  let res = {};
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    const key = prefix ? prefix + '.' + k : k;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(res, flatten(val, key));
    } else {
      res[key] = String(val);
    }
  }
  return res;
}
const enFlat = flatten(en);

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.tsx') || (file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.d.ts'))) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('src');
// Match t('key', ...) or t("key", ...)
const tRegex = /\bt\(\s*['"]([a-zA-Z0-9_.-]+)['"]/g;
const missingKeys = new Map();
const foundKeys = new Set();

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    const key = match[1];
    foundKeys.add(key);
    if (!(key in enFlat)) {
      if (!missingKeys.has(key)) missingKeys.set(key, []);
      missingKeys.get(key).push(f);
    }
  }
}

console.log('Total unique keys referenced in code via t():', foundKeys.size);
console.log('Total unique missing keys referenced in code:', missingKeys.size);
for (const [key, occ] of missingKeys.entries()) {
  console.log('MISSING KEY:', key, 'used in:', occ);
}
