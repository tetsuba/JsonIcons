const minimist = require('minimist');
const R = require('ramda');
const createJSONIcons = require('./src/JsonIcons').createJSONIcons;
const saveToFile = require('./src/JsonIcons').saveToFile;
const argv = minimist(process.argv.slice(2));
const iconList = R.values(require(argv.src));
const PATH = require('path');
const SrcPath =  PATH.resolve(__dirname, ''); // to update

createJSONIcons(iconList, SrcPath, (obj, path) => {
    const icons = JSON.stringify(obj);
    saveToFile(icons, path, SrcPath);
});
