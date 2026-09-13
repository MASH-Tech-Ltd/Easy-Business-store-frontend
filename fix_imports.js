const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'g:/MERN TEST/MASH-TECH-LTD/ELECTRONICS_MULTITENET_WEB/electronics-tenant-app/src/themes/design-01/CheckoutClient.tsx',
  'g:/MERN TEST/MASH-TECH-LTD/ELECTRONICS_MULTITENET_WEB/electronics-tenant-app/src/themes/design-02/CheckoutClient.tsx'
];

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('import { computeShipping }')) {
      content = content.replace(
        'import { bdLocations } from "@/data/locations";',
        'import { bdLocations } from "@/data/locations";\nimport { computeShipping } from "@/utils/shipping";'
      );
      fs.writeFileSync(filePath, content);
    }
  }
});
console.log('done');
