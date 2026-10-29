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
// Match t('key', 'default text'...) or t('key')
const tRegex = /\bt\(\s*['"]([a-zA-Z0-9_.-]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/g;
const missingWithDefaults = new Map();

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    const key = match[1];
    const defaultVal = match[2] || '';
    if (!(key in enFlat)) {
      if (!missingWithDefaults.has(key) || (!missingWithDefaults.get(key).defaultVal && defaultVal)) {
        missingWithDefaults.set(key, { defaultVal, file: f });
      }
    }
  }
}

console.log('MISSING KEYS WITH DEFAULTS:');
for (const [k, v] of missingWithDefaults.entries()) {
  console.log(JSON.stringify({ key: k, default: v.defaultVal, file: v.file }));
}
