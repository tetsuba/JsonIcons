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
    const fileNames = fs.readdirSync(src)
    const filePaths = fs.readdirSync(src).map((fileName) => src + fileName)
    const key = Object.keys(data)[0]
    const values = Object.values(data)[0]
    const newData = {
        ...data,
        [key]: {
            ...values,
            svgFileNames: fileNames,
            svgFilePaths: filePaths,
        }
    }
    const string = JSON.stringify(newData)
    this.push(string)
    done()
}

const readSVG = function(chunk, encoding, done) {
    const data = JSON.parse(chunk.toString())
    const list = Object.values(data)[0].svgFilePaths
    const options = { svgo: true, pathsKey: 'myPaths' };


    list.forEach((fileName) => {
        fs.readFile(fileName, 'utf8', (err, icon) => {
            if (err) throw err;
            // console.log(data);

            svgson(icon, options, (result) => {
                console.log(result.myPaths.childs)
            });
        });
    })

    // done()
}


const getJSON = (src) => {
    const readStream = fs.createReadStream(src);
    readStream
        .pipe(through(readJSON))
        .pipe(through(getSVGList))
        .pipe(through(readSVG))
}



const json = getJSON('icons/icons.json')

// https://github.com/jeresig/node-stream-playground



