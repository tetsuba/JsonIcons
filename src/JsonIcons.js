const R = require('ramda');
const svgson = require('svgson');
const fs = require('fs');

/* Is iconList completed
 *
 * Compares the iconList array with the iconFileNames array
 *
 * @param {array} svgList
 * @param {number} eof
 * @return {boolean}
 * */
const isListCompleted =
    (iconList, eof) => R.equals(R.keys(iconList).length, eof);

/* Update icon list with new icon
 *
 * @param {number} eof
 * @param {object} path
 * @param {func} completed
 * @return {function}
 * */
const updateIconList = (eof, path, completed) => {
    let iconList = {};

    /* Update icon list with new icon. If completed then call "completed" function to create icons JSON file
     *
     * @param {object} icon
     * @return {void}
     * */
    return (icon) => {
        // merge new icon to icon list
        iconList = R.merge(iconList, icon);
        const isCompleted = isListCompleted(iconList, eof);

        isCompleted
            ? completed(iconList, path)
            : null
    }
}

/* Read icon file
 *
 * @param {object} path
 * @param {func} updateList
 * @return {function}
 * */
const readIconFile =
    (path, updateIconList) =>

        /* Read icon file and call "outputJSON" function
         *
         * @param {string} iconFileName
         * @return {void}
         * */
        (iconFileName) => {
            const outputJSON = outputJSONData(iconFileName, updateIconList);
            const filePath = path.input + iconFileName;

            // Node file system to read an icon file and return a callback function with the icon data
            fs.readFile(filePath, 'utf8', outputJSON);
        }

/* Output JSON data
 *
 * @param {string} fileName
 * @param {func} updateList
 * @return {function}
 * */
const outputJSONData =
    (fileName, updateList) => {
        const getPath = getIconPath(fileName, updateList);
        const options = { svgo: true, pathsKey: 'myPaths' };

        /* Reads the icon data and calls "getPath" function to find the icon drawing path
         *
         * @param {object} error
         * @param {object} icon
         * @return {void}
         * */
        return (error, icon) => {
            if (error) { throw error; }

            // Reads the icon data using "svgson" and returns a callback function with JSON data
            svgson(icon, options, getPath);
        };
    }

/* Save icon drawing path to iconList
 *
 * @param {string} fileName
 * @param {func} save
 * @return {function}
 * */
const saveIconPath = (iconFileName, updateList) => {
    const hasPath = R.has('d');
    const key = R.replace('.svg', '', iconFileName)

    /* If the icon has a drawing path then call "updateList" function to update the iconList
     *
     * @param {object} child
     * @return {void}
     * */
    return (child) => {
        hasPath(child.attrs)
            ?  updateList(R.zipObj([key], [child.attrs.d]))
            : null;
    };
}

/* Get icon path
 *
 * @param {string} fileName
 * @param {func} cb
 * @return {function}
 * */
const getIconPath = (fileName, cb) => {
    const save = saveIconPath(fileName, cb);

    /* If the icon has "myPaths" then call the "save" function to save to the iconList
     *
     * @param {object} icon
     * @return {void}
     * */
    return ({myPaths}) => {
        R.isEmpty(myPaths)
            ? console.log('SVG path not found!')
            : R.forEach(save, myPaths.childs)
    };
}


/* Read icon files from a directory
 *
 * @param {object} path
 * @param {func} completed
 * @return {func}
 * */
const readIconFiles =
    (path, completed) =>

        /* Loop through "iconFileNames" and call the function "readFile" for each icon
         *
         * @param {object} err
         * @param {array} iconFileNames
         * @return {void}
         * */
        (err, iconFileNames) => {
            if (err) { throw err; }
            const updateList = updateIconList(R.length(iconFileNames), path, completed);
            const readFile = readIconFile(path, updateList)
            R.forEach(readFile, iconFileNames)
        }

/* Read icons directory
 *
 * @param {func} completed
 * @return {func}
 * */
const getIconFileNamesFromDirectory =
    (completed) =>

        /* Read the icons directory and call the "readFiles" function to read all icon files
         *
         * @param {object} path
         * @return {void}
         * */
        (path) => {
            const readFiles = readIconFiles(path, completed);

            // The node file system to read a directory and to return a callback with an array of file names
            fs.readdir(path.input, readFiles);
        };

/* Save JSON data to file
 *
 * @param {object} icons
 * @param {object} path
 * */
const saveToFile = (icons, path) => {
    const filePath = path.output + 'icons.json';

    // Node file system to write a file and return a callback
    fs.writeFile(filePath, icons, (err) => {
        if (err) throw err;
        console.log('CREATED: ', filePath);
    });
}

/* Retrieve icon.json and update inputs and outputs with full paths
 *
 * @param {string} basePath
 * @param {string} directory
 * @return {array}
 * */
const updateIconListWithFullPath = (basePath, directory) => {
    const iconList = require(basePath + directory);

    return R.forEach(
        (src) => {
            src.input = basePath + src.input;
            src.output = basePath + src.output;
            return src;
        },
        R.values(iconList)
    )
}

/*
 * @param {array} iconList
 * @param {func} completed
 * */
const createJSONIcons = (iconList, completed) => {
    const getIconFileNames = getIconFileNamesFromDirectory(completed);
    R.forEach(getIconFileNames, iconList);
};

module.exports = {
    createJSONIcons,
    saveToFile,
    updateIconListWithFullPath,
};