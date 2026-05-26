const fs = require('fs');

// 1. Extract from f1-data.js
const f1Data = fs.readFileSync('./data/f1-data.js', 'utf8');
let f1DataExtract = f1Data.replace('// Export for use in HTML pages', '');
f1DataExtract = f1DataExtract.replace(/if\s*\(typeof module !== 'undefined' && module\.exports\)\s*\{\s*module\.exports = \{.*?\};\s*\}/g, '');
f1DataExtract += `
fs.writeFileSync('./data/f1-data.json', JSON.stringify({ ALL_DRIVERS, teams, tracks, machines, raceEvents }, null, 2));
`;
eval(f1DataExtract);

// 2. Extract from f1-faq.js
const f1Faq = fs.readFileSync('./data/f1-faq.js', 'utf8');
let f1FaqExtract = f1Faq;
f1FaqExtract += `
fs.writeFileSync('./data/f1-faq.json', JSON.stringify({ faqCategories, faqs }, null, 2));
`;
eval(f1FaqExtract);

// 3. Extract from drivers.js
const driversJs = fs.readFileSync('./js/drivers.js', 'utf8');
const flagsMatch = driversJs.match(/const NATIONALITY_FLAGS = (\{[\s\S]*?\});/);
const activeMatch = driversJs.match(/const ACTIVE_2026_DRIVERS = (\{[\s\S]*?\});\s*\/\//);
const imagesMatch = driversJs.match(/const DRIVER_IMAGES = (\{[\s\S]*?\});\s*document\.addEventListener/);

if (flagsMatch) {
    eval('var flags = ' + flagsMatch[1]);
    fs.writeFileSync('./data/nationality_flags.json', JSON.stringify(flags, null, 2));
}

if (activeMatch) {
    eval('var active = ' + activeMatch[1]);
    fs.writeFileSync('./data/active_2026_drivers.json', JSON.stringify(active, null, 2));
}

if (imagesMatch) {
    eval('var images = ' + imagesMatch[1]);
    fs.writeFileSync('./data/driver_images.json', JSON.stringify(images, null, 2));
}
