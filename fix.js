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
        '`${process.env.NEXT_PUBLIC_API_URL}/orders/create-order`',
        '`/api/checkout`'
      );
      replaceInFile(
        fullPath,
        '`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?search=${encodeURIComponent(query)}&limit=10`',
        '`/api/search?tenantSlug=${tenantSlug}&query=${encodeURIComponent(query)}&limit=10`'
      );
    }
  }
}

walk('./src');
