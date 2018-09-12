#!/usr/bin/env node

const path = process.argv[2] // ./icons/icons.json
const fs = require('fs')
const through = require('through2')

const {
    getConfig,
    createDirectories,
    getSVGList,
    getSVGPath,
    saveToFile
} =  require('./src/pipeList')

if (fs.existsSync(path)) {
    fs.createReadStream(path)
        .pipe(through(getConfig))
        .pipe(through(getSVGList))
        .pipe(through(getSVGPath))
        .pipe(through(createDirectories))
        .pipe(through(saveToFile))
        .pipe(through(fs.writeFile))
        .on('finish', function() {
            console.log('COMPLETED')
        })
} else {
    process.stdout.write("Incorrect file path: " + path + " \n");
    process.stdout.write("Please try again. \n");
}

