const fs = require('fs');
const path = require('path');

const themesDir = 'g:/MERN TEST/MASH-TECH-LTD/ELECTRONICS_MULTITENET_WEB/electronics-tenant-app/src/themes';
const checkouts = [
  {
    file: 'design-01/CheckoutClient.tsx',
    regex: /<div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">\s*<Check size=\{12\} strokeWidth=\{3\} \/>\s*<\/div>/,
    replace: `<div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">
                    +{totalPrice > 0 ? deliveryCharge.toLocaleString() : 0} {t("bdt")}
                  </span>
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>`
  },
  {
    file: 'design-02/CheckoutClient.tsx',
    regex: /<div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">\s*<div className="w-3 h-3 bg-primary rounded-full" \/>\s*<\/div>/,
    replace: `<div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">
                    +{totalPrice > 0 ? deliveryCharge.toLocaleString() : 0} {t("bdt")}
                  </span>
                  <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                  </div>
                </div>`
  },
  {
    file: 'design-03/CheckoutClient.tsx',
    regex: /<div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">\s*<div className="w-2\.5 h-2\.5 bg-primary rounded-full" \/>\s*<\/div>/,
    replace: `<div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">
                    +{totalPrice > 0 ? deliveryCharge.toLocaleString() : 0} {t("bdt")}
                  </span>
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                  </div>
                </div>`
  },
  {
    file: 'design-04/CheckoutClient.tsx',
    regex: /<div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-primary">\s*<Check size=\{14\} strokeWidth=\{3\} \/>\s*<\/div>/,
    replace: `<div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">
                    +{totalPrice > 0 ? deliveryCharge.toLocaleString() : 0} {t("bdt")}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-primary shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>`
  }
];

checkouts.forEach(({ file, regex, replace }) => {
  const fullPath = path.join(themesDir, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(regex, replace);
    fs.writeFileSync(fullPath, content);
  }
});
console.log('done');
