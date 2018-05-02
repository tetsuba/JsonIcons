const R = require('ramda');
const svgson = require('svgson');
const SVGO = require('svgo');
const fs = require('fs');
const PATH = require('path');

const config = require('./svgo.config');
const svgo = new SVGO(config);

const SvgoOptions = {
    svgo: true,
    // title: 'icon',
    pathsKey: 'myPaths',
    // customAttrs: {
    //     foo: true,
    // },
}

const getPath = (dir, fileName) =>
    PATH.resolve(__dirname, `${dir}/${fileName}`);

const isListCompleted = (svgList, fileNames) => R.equals(R.keys(svgList).length, fileNames.length)

const FileNames = (err, fileNames, completed) => {
    let svgList = {};
    if (err) { throw err; }
    fileNames.forEach((fileName) => {
        readSvgFile(fileName, (svg) => {
            svgList = R.merge(svgList, svg);

            isListCompleted(svgList, fileNames)
                ? completed(svgList)
                : null
        });
    })
}

const optimiseSvgCode = (err, data, fileName, cb) => {
    if (err) { throw err; }
    const convertToJson = convertSvgToJson(fileName, cb);
    convertToJson(data)
    // svgo.optimize(data).then(convertToJson);
}

const readSvgFile = (fileName, cb) => {
    fs.readFile(
        getPath('svg', fileName),
        'utf8',
        (error, result) => {
            optimiseSvgCode(error, result, fileName, cb)
        }
    );
}

const convertSvgToJson =
    (fileName, cb) =>
    (svg) => {
        const getPath = getSvgPath(fileName, cb);
        svgson(svg, SvgoOptions, getPath)
    };

const savePath =
    (fileName, save) =>
    (child) => {
        const hasPath = R.has('d');
        if (hasPath(child.attrs)) {
            const key = R.replace('.svg', '', fileName)
            save({[key]: child.attrs.d});
        }
    };

const getSvgPath =
    (fileName, cb) =>
    ({myPaths}) => {
        const save = savePath(fileName, cb);

        console.log('getSvgPath', myPaths)

        R.isEmpty(myPaths)
            ? console.log('SVG path not found!')
            : R.forEach(save, myPaths.childs)
    };

const createJSONIcons = (cb) => {
    fs.readdir(getPath('svg', ''), (err, fileNames) =>
        FileNames(err, fileNames, cb));
}

createJSONIcons((obj) => {
    const icons = JSON.stringify(obj);
    saveToFile(icons);
});

const saveToFile = (icons) => {
    fs.writeFile('icons.json', icons, (err) => {
        if (err) throw err;
        console.log('JSON file created!');
    });
}
