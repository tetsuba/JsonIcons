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

fs.createReadStream(path)
    .pipe(through(getConfig))
    .pipe(through(getSVGList))
    .pipe(through(getSVGPath))
    .pipe(through(createDirectories))
    .pipe(through(saveToFile))
    .on('finish', function() {
        console.log('COMPLETED')
    })
