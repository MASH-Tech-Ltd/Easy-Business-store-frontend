const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, searchStr, replacement) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(searchStr)) {
    fs.writeFileSync(filePath, content.split(searchStr).join(replacement));
    console.log('Updated', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      replaceInFile(
        fullPath,
        'tenantId: storeInfo?._id,',
        ''
      );
    }
  }
}

walk('./src/themes');
