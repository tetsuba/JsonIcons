const R = require('ramda');
const svgson = require('svgson');
const fs = require('fs');

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
        // merge new icon to icon list
        iconList = R.merge(iconList, icon);
        const isCompleted = isListCompleted(iconList, eof);

        isCompleted
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
    (path, updateIconList) =>
        (iconFileName) => {
            const convertToJson = convertIconToJson(iconFileName, updateIconList);
            const filePath = path.input + iconFileName;

            // Node file system to read file
            fs.readFile(filePath, 'utf8', convertToJson);
        }

/*
 *
 * @param {string} fileName
 * @param {func} updateList
 * */
const convertIconToJson =
    (fileName, updateList) => {
        const getPath = getIconPath(fileName, updateList);
        const options = { svgo: true, pathsKey: 'myPaths' };

        /* Convert svg to JSON using svgson
         *
         * @param {object} error
         * @param {object} icon
         * */
        return (error, icon) => {
            if (error) { throw error; }
            svgson(icon, options, getPath);
        };
    }

/*
 * @param {string} fileName
 * @param {func} save
 * */
const saveIconPath = (iconFileName, updateList) => {
    const hasPath = R.has('d');
    const key = R.replace('.svg', '', iconFileName)

    /* If child has attribute "d" then update iconList
     *
     * @param {object} child
     * */
    return (child) => {
        if (hasPath(child.attrs)) {
            updateList(
                R.zipObj([key], [child.attrs.d]),
            );
        }
    };
}


/*
 * @param {string} fileName
 * @param {func} cb
 * */
const getIconPath = (fileName, cb) => {
    const save = saveIconPath(fileName, cb);

    /* Get icon path and save to iconList
     *
     * @param {object} icon
     * */
    return ({myPaths}) => {
        R.isEmpty(myPaths)
            ? console.log('SVG path not found!')
            : R.forEach(save, myPaths.childs)
    };
}


/* Create an iconList with iconFileName
 *
 * @param {object} err
 * @param {array} fileNames
 * @param {object} path
 * @param {func} cb
 * */
const createIconList =
    (path, completed) =>
        (err, iconFileName) => {
            if (err) { throw err; }
            const updateList = updateIconList(R.length(iconFileName), path, completed);
            const readFile = readIconFile(path, updateList)
            R.forEach(readFile, iconFileName)
        }

/* Read directory and return a list of icon file names
 *
 * @param {func} completed
 * @param {object} path
 * */
const getIconFileNamesFromDirectory =
    (completed) =>
        (path) => {
            const createList = createIconList(path, completed);

            // Node file system to read directory
            fs.readdir(path.input, createList);
        };

/* Create JSON file with iconList
 *
 * @param {object} icons
 * @param {object} path
 * */
const saveToFile = (icons, path) => {
    const filePath = path.output + 'icons.json';

    // Node file system to write file
    fs.writeFile(filePath, icons, (err) => {
        if (err) throw err;
        console.log('CREATED: ', filePath);
    });
}

/*
 *
 * @param {array} iconList
 * @param {func} completed
 * */
const createJSONIcons = (iconList, completed) => {
    const getIconFileNames = getIconFileNamesFromDirectory(completed);
    R.forEach(getIconFileNames, iconList);
};

/* Update icons list to include full path
 *
 * @param {string} basePath
 * @param {string} directory
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

module.exports = {
    createJSONIcons,
    saveToFile,
    updateIconListWithFullPath,
};