const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'g:/MERN TEST/MASH-TECH-LTD/ELECTRONICS_MULTITENET_WEB/electronics-tenant-app/src/themes/design-01/CheckoutClient.tsx',
  'g:/MERN TEST/MASH-TECH-LTD/ELECTRONICS_MULTITENET_WEB/electronics-tenant-app/src/themes/design-02/CheckoutClient.tsx',
  'g:/MERN TEST/MASH-TECH-LTD/ELECTRONICS_MULTITENET_WEB/electronics-tenant-app/src/themes/design-04/CheckoutClient.tsx',
  'g:/MERN TEST/MASH-TECH-LTD/ELECTRONICS_MULTITENET_WEB/electronics-tenant-app/src/themes/design-05/components/ui/CheckoutClient05.tsx'
];

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We will replace `+{totalPrice > 0 ? deliveryCharge.toLocaleString() : 0}`
    // with `{shippingZoneName ? \`\${shippingZoneName} \` : ''}+{totalPrice > 0 ? deliveryCharge.toLocaleString() : 0}`
    
    content = content.replace(
      /\+\{totalPrice > 0 \? deliveryCharge\.toLocaleString\(\) : 0\}/g,
      `{shippingZoneName ? \`\${shippingZoneName} \` : ''}+{totalPrice > 0 ? deliveryCharge.toLocaleString() : 0}`
    );

    fs.writeFileSync(filePath, content);
  }
});
console.log('done');
