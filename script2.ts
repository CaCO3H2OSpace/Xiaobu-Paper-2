import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = content.split('\n');

// Find the start of the auto collect tag block
const startIndex = lines.findIndex(line => line.includes('自动收纳标签 (选填)'));
if (startIndex !== -1) {
  // We want to remove the `<div>` that wraps this label.
  // Looking at the grep output, line 941 is `<div>`, line 942 is `<label...`
  // And it ends before `<div className="flex gap-3">`
  const endIndex = lines.findIndex((line, i) => i > startIndex && line.includes('<div className="flex gap-3">'));
  if (endIndex !== -1) {
    lines.splice(startIndex - 1, endIndex - startIndex + 1);
  }
}

fs.writeFileSync('src/App.tsx', lines.join('\n'));
