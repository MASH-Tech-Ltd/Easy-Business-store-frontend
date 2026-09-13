const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip client components
  if (content.includes('"use client"') || content.includes("'use client'")) {
    return;
  }
  
  // Check if it has fetch that uses NEXT_PUBLIC_API_URL/storefront
  if (content.includes('fetch(') && content.includes('NEXT_PUBLIC_API_URL') && content.includes('storefront')) {
    // Replace fetch with storefrontFetch
    content = content.replace(/fetch\(/g, 'storefrontFetch(');
    
    // Calculate relative path to src/utils/storefrontFetch
    const relativeDepth = file.split('/').length - 3; // ./src/app/page.tsx -> depth 1 -> ../utils
    let utilsPath = '';
    if (relativeDepth === 0) utilsPath = './utils/storefrontFetch';
    else if (relativeDepth === 1) utilsPath = '../utils/storefrontFetch';
    else if (relativeDepth === 2) utilsPath = '../../utils/storefrontFetch';
    else if (relativeDepth === 3) utilsPath = '../../../utils/storefrontFetch';
    else if (relativeDepth === 4) utilsPath = '../../../../utils/storefrontFetch';
    else utilsPath = '@/utils/storefrontFetch'; // Fallback
    
    // If project uses @/ path aliases, use that instead. Let's just use relative to be safe.
    // Wait, tsconfig might have @/* mapped to src/*. It's standard Next.js.
    // Let's check tsconfig.json. Actually, using relative path is safer without knowing.
    
    // Add import at the top
    const importStatement = `import { storefrontFetch } from "${utilsPath}";\n`;
    content = importStatement + content;
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
