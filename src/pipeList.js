const fs = require('fs')
const { exec } = require('child_process')
const { getSvgPath } = require('./utils')


/* Get config where to get icons and where to save json file
 *
 * */
const getConfig = function(chunk, encoding, done) {
    const data = JSON.parse(chunk.toString())
    Object.entries(data).forEach(([key, value]) => {
        this.push(JSON.stringify({[key]: value}))
    })
    done()
}

/* Get a list of svg file paths
 *
 * */
const getSVGList = function(chunk, encoding, done) {
    const data = JSON.parse(chunk.toString())
    const src = `${Object.values(data)[0].input}`
    const key = Object.keys(data)[0]
    const values = Object.values(data)[0]

    const svgFiles = fs.readdirSync(src)
        .reduce((acc, fileName) => {
            const key = fileName.replace('.svg', '')
            return {
                ...acc,
                [key]: {
                    filePath: src + fileName,
                }
            }
        }, {})

    this.push(JSON.stringify({
        ...values,
        brand: key,
        svg: svgFiles,
    }))
    done()
}


/* Get svg paths from svg files
 *
 * */
const getSVGPath = function(chunk, encoding, done) {
    const data = JSON.parse(chunk.toString())
    const files = Object.entries(data.svg)
    const promises = []

    files.forEach(([key, value]) => {
        const svgCode = fs.readFileSync(value.filePath, 'utf8')
        promises.push(getSvgPath(svgCode))
    })

    Promise.all(promises).then((...args) => {
        const svg = files
            .reduce(
                (acc, [key, value], i) => ({
                    ...acc,
                    [key]: args[0][i]
                })
                , {})

        this.push(JSON.stringify({
            ...data,
            svg: svg
        }))
        done()

    })
}

/* Create directories if they do not exist
 *
 * */
const createDirectories = function(chunk, encoding, done) {
    const data = JSON.parse(chunk.toString())

    exec(`mkdir -p ${data.output}` , (err, strdout, stderr) => {
        if(err) console.log("Folder creation err:" + err)
        this.push(chunk)
        done()
    })
}

/* Save data to file
 *
 * */
const saveToFile = function(chunk, encoding, done) {
    const data = JSON.parse(chunk.toString())
    const path = data.output + 'icons.json';
    const string = JSON.stringify(data.svg, null, 4)

    fs.writeFile(path, string, (err) => {
        if (err) throw err;
        console.log('CREATED: ', path);
        done()
    });
}

module.exports = {
    getConfig,
    createDirectories,
    getSVGList,
    getSVGPath,
    saveToFile,
}