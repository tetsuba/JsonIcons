#!/usr/bin/env node

const createJSONIcons = require('./src/JsonIcons').createJSONIcons;
const saveToFile = require('./src/JsonIcons').saveToFile;
const updateIconListWithFullPath = require('./src/JsonIcons').updateIconListWithFullPath;

const JSONFilePath = process.argv.slice(2)[0];
const BasePath = process.cwd();
const iconList = updateIconListWithFullPath(BasePath, JSONFilePath)

/* Create JSON file with icon data
 *
 * @param {object} iconList
 * @param {func}
 * */
createJSONIcons(

    iconList,

    /* Callback function
     *
     * @param {object} iconList
     * @param {string} path
     * */
    (iconList, path) => {
        const icons = JSON.stringify(iconList);
        saveToFile(icons, path);
    }
);
