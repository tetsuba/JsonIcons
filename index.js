#!/usr/bin/env node

// const BasePath = process.cwd();

const fs = require('fs')
const through = require('through2')
const svgson = require('svgson');


const readJSON = function(chunk, encoding, done) {
    const data = JSON.parse(chunk.toString())
    Object.entries(data).forEach(([key, value]) => {
        const string = JSON.stringify({[key]: value})
        this.push(string)
    })
    done()
}

const getSVGList = function(chunk, encoding, done) {
    const data = JSON.parse(chunk.toString())
    const src = `.${Object.values(data)[0].input}`
    const svgFiles = fs
        .readdirSync(src)
        .reduce((acc, fileName) => {
            return {
                ...acc,
                [fileName.replace('.svg', '')]: {
                    fileName: fileName,
                    filePath: src + fileName,
                    svgPath: ''
                }
            }
        }, {})

    const key = Object.keys(data)[0]
    const values = Object.values(data)[0]
    const newData = {
        ...data,
        [key]: {
            ...values,
            svgFiles: svgFiles,
        }
    }
    const string = JSON.stringify(newData)
    this.push(string)
    done()
}

const getSvgPath = function(svgCode) {
    const options = { svgo: true, pathsKey: 'myPaths' }
    return new Promise((resolve, reject) => {
        svgson(svgCode, options, (icon) => {
            resolve(icon.myPaths.childs[1].attrs.d)
        })
    })
}

const readSVG = function(chunk, encoding, done) {
    const data = JSON.parse(chunk.toString())
    const svgFiles = Object.values(data)[0].svgFiles

    const brandKey = Object.keys(data)[0]
    const brandValue = Object.values(data)[0]
    const files = Object.entries(svgFiles)
    const promises = []

    files.forEach(([key, value]) => {
        const svgCode = fs.readFileSync(value.filePath, 'utf8')
        promises.push(getSvgPath(svgCode))
    })

    Promise.all(promises).then((...args) => {


        const files = Object
            .entries(svgFiles)
            .reduce((acc, [key, value], index) => {
                return {
                    ...acc,
                    [key]: args[0][index]
                }
            }, {})


        const newData = {
            ...data,
            [brandKey]: {
                ...brandValue,
                svgFiles: files
            }
        }

        const string = JSON.stringify(newData)
        this.push(string)
        done()

    })
}



const createJSON = function(chunk, encoding, done) {
    const data = JSON.parse(chunk.toString())
    const brandKey = Object.keys(data)[0]
    const path = data[brandKey].output + 'icons.json';
    const string = JSON.stringify(data[brandKey].svgFiles, null, 4)


    // Node file system to write a file and return a callback
    fs.writeFile(path, string, (err) => {
        if (err) throw err;
        console.log('CREATED: ', path);
        done()
    });
}


const getJSON = (src) => {
    const readStream = fs.createReadStream(src);
    readStream
        .pipe(through(readJSON))
        .pipe(through(getSVGList))
        .pipe(through(readSVG))
        .pipe(through(createJSON))
}





const json = getJSON('icons/icons.json')

// https://github.com/jeresig/node-stream-playground



