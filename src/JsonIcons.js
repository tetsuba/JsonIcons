const R = require('ramda');
const svgson = require('svgson');
const fs = require('fs');
const PATH = require('path');


/* Is icon list completed
 *
 * When iconList is equal to the number of icons retrieved from input directory then completed
 *
 * @param {array} svgList
 * @param {number} eof
 * */
const isListCompleted =
    (iconList, eof) => R.equals(R.keys(iconList).length, eof);

/* Update icon list with new icon
 *
 * @param {number} eof
 * @param {object} path
 * @param {func} completed
 * */
const updateIconList = (eof, path, completed) => {
    let iconList = {};

    /*
     * @param {object} icon
     * */
    return (icon) => {
        iconList = R.merge(iconList, icon);

        isListCompleted(iconList, eof)
            ? completed(iconList, path)
            : null
    }
}

/*
 *
 * @param {object} path
 * @param {func} updateList
 * @param {string} fileName
 * */
const readIconFile =
    (path, SrcPath, updateList) =>
        (iconName) => {
            const convertToJson = convertSvgToJson(iconName, updateList);
            const filePath = PATH.resolve(SrcPath, path.input + iconName);
            fs.readFile(filePath, 'utf8', convertToJson);
        }

/*
 *
 * @param {string} fileName
 * @param {func} updateList
 * @param {object} error
 * @param {object} svg
 * */
const convertSvgToJson =
    (fileName, updateList) =>
        (error, svg) => {
            if (error) { throw error; }
            const getPath = getSvgPath(fileName, updateList);
            svgson(
                svg,
                { svgo: true, pathsKey: 'myPaths' },
                getPath
            )
        };

/*
 *
 * @param {string} fileName
 * @param {func} save
 * @param {object} child
 * */
const savePath =
    (fileName, updateList) =>
        (child) => {
            const hasPath = R.has('d');
            if (hasPath(child.attrs)) {
                const key = R.replace('.svg', '', fileName)
                updateList({[key]: child.attrs.d});
            }
        };

/*
 *
 * @param {string} fileName
 * @param {func} cb
 * @param {object} svg
 * */
const getSvgPath =
    (fileName, cb) =>
        ({myPaths}) => {
            const save = savePath(fileName, cb);
            R.isEmpty(myPaths)
                ? console.log('SVG path not found!')
                : R.forEach(save, myPaths.childs)
        };

/*
 *
 * @param {object} err
 * @param {array} fileNames
 * @param {object} path
 * @param {func} cb
 * */
const createIconList =
    (path, SrcPath, completed) =>
        (err, fileNames) => {
            console.log(fileNames)
            if (err) { throw err; }
            const updateList = updateIconList(R.length(fileNames), path, completed);
            const readFile = readIconFile(path, SrcPath, updateList)
            R.forEach(readFile, fileNames)
        }

/* Read directory and return a list of file names
 *
 * @param {func} completed
 * @param {object} path
 * */
const getIconNamesFromDirectory =
    (SrcPath, completed) =>
        (path) => {
            const createList = createIconList(path, SrcPath, completed);
            const dirPath = PATH.resolve(SrcPath, path.input);
            fs.readdir(dirPath, createList);
        };

/* Create JSON file with icon data
 *
 * @param {object} icons
 * @param {object} path
 * */
const saveToFile = (icons, path, SrcPath) => {
    const filePath = PATH.resolve(SrcPath, `${path.output}/icons.json`);
    fs.writeFile(filePath, icons, (err) => {
        if (err) throw err;
        console.log('JSON file created!');
    });
}

/*
 *
 * @param {array} iconList
 * @param {func} completed
 * */
const createJSONIcons = (iconList, SrcPath, completed) => {
    const getIconNames = getIconNamesFromDirectory(SrcPath, completed);
    R.forEach(getIconNames, iconList);
};

module.exports = {
    createJSONIcons,
    saveToFile
};