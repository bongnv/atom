const fs = require('fs');
const CSON = require('season');
const [filePath] = process.argv.slice(2);
console.log('Processing', filePath);
const data = CSON.readFileSync(filePath);
fs.writeFileSync(filePath.replace('.cson', '.json'), JSON.stringify(data));
