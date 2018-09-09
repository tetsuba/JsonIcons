const fs = require('fs')
const through = require('through2')

const {
    getConfig,
    createDirectories,
    getSVGList,
    getSVGPath,
    saveToFile
} = require('../pipeList')


const updatePaths = function(chunk, encoding, done) {
    const data = JSON.parse(chunk.toString())
    Object
        .keys(data)
        .forEach((key) => {
            data[key].input = __dirname + data[key].input
            data[key].output = __dirname + data[key].output
            data[key]['root'] = __dirname
        })
    done(null, JSON.stringify(data))
}



const rs = fs.createReadStream(__dirname + '/mockIcons.json')
    .pipe(through(updatePaths))
    // .pipe(through(getConfig))
    // .pipe(through(getSVGList))
    // .pipe(through(getSVGPath))
    // .pipe(through(createDirectories))
    // .pipe(through(saveToFile))
    // .on('finish', function() {
    //     console.log('COMPLETED')
    // })
const DIR1 = {
    dir1: {
        input: __dirname + '/dir1/input/',
        output: __dirname + '/dir1/output/',
        root: __dirname,
    }
}

const DIR2 = {
    dir2: {
        input: __dirname + '/dir2/input/',
        output: __dirname + '/dir2/output/',
        root: __dirname,
    }
}

const DIR3 = {
    dir3: {
        input: __dirname + '/dir3/input/',
        output: __dirname + '/dir3/output/',
        root: __dirname,
    }
}


describe('@pipeList', () => {

    describe('getConfig()', () => {

        test('to split the config and pipe out three smaller configs', () => {
            let configs = []
            const expected = [DIR1, DIR2, DIR3]
            rs.pipe(through(getConfig))
                .pipe(through(
                    function (chunk, encoding, done) {
                        configs.push(JSON.parse(chunk.toString()))
                        done()
                    }
                ))

            rs.on('finish', () => {
                expect(configs).toEqual(expected);
                expect(configs.length).toEqual(3);
            })
        })
    })


    describe('getSVGList()', () => {

        test('to pipe out 3 configs with svg names and file paths', () => {
            const configs = []
            const expected = [
                {
                    ...DIR1.dir1,
                    brand: 'dir1',
                    svg: {
                        'arrow-down2': {filePath: __dirname + '/dir1/input/arrow-down2.svg'},
                        'arrow-left2': {filePath: __dirname + '/dir1/input/arrow-left2.svg'},
                        'arrow-right2': {filePath: __dirname + '/dir1/input/arrow-right2.svg'},
                        'arrow-up2': {filePath: __dirname + '/dir1/input/arrow-up2.svg'}
                    }
                },
                {
                    ...DIR2.dir2,
                    brand: 'dir2',
                    svg: {
                        'arrow-down2': {filePath: __dirname + '/dir2/input/arrow-down2.svg'},
                        'arrow-left2': {filePath: __dirname + '/dir2/input/arrow-left2.svg'},
                        'arrow-right2': {filePath: __dirname + '/dir2/input/arrow-right2.svg'},
                        'arrow-up2': {filePath: __dirname + '/dir2/input/arrow-up2.svg'}
                    }
                },
                {
                    ...DIR3.dir3,
                    brand: 'dir3',
                    svg: {
                        'arrow-down2': {filePath: __dirname + '/dir3/input/arrow-down2.svg'},
                        'arrow-left2': {filePath: __dirname + '/dir3/input/arrow-left2.svg'},
                        'arrow-right2': {filePath: __dirname + '/dir3/input/arrow-right2.svg'},
                        'arrow-up2': {filePath: __dirname + '/dir3/input/arrow-up2.svg'}
                    }
                },

            ]

            rs
                .pipe(through(getConfig))
                .pipe(through(getSVGList))
                .pipe(through(
                    function (chunk, encoding, done) {
                        configs.push(JSON.parse(chunk.toString()))
                        done()
                    }
                ))

            rs.on('finish', () => {
                expect(configs).toEqual(expected);
                expect(configs.length).toEqual(3);
            })
        })

    })

    describe('getSVGPath()', () => {})
    describe('createDirectories()', () => {})
    describe('saveToFile()', () => {})
})
