const fs = require('fs')
const { exec } = require('child_process')
const through = require('through2')
const { DIR1, DIR2, DIR3, SVG_PATH, getSvgFilePath } = require('./mockData')

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



const outputArray = [
    __dirname + '/dir1/output',
    __dirname + '/dir2/output',
    __dirname + '/dir3/output',
]


describe('@pipeList', () => {

    beforeAll(() => {
        outputArray.forEach(path => {
            exec(`rm -rf ${path}` , (err, strdout, stderr) => {
                if(err) console.log("Folder creation err:" + err)
            })
        })
    })

    describe('getConfig()', () => {
        test('to split the config and pipe out three smaller configs', () => {
            let configs = []
            const expected = [DIR1, DIR2, DIR3]

            const rs = fs.createReadStream(__dirname + '/mockIcons.json')
                .pipe(through(updatePaths))
                .pipe(through(getConfig))
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

        test('', () => {
            const rs = fs.createReadStream(__dirname + '/mockIcons.jso')

            rs.on('error', (err) => console.log('error ' + err) );
        })
    })


    describe('getSVGList()', () => {
        test('to pipe out 3 configs with svg names and file paths', () => {
            const configs = []
            const expected = [
                {
                    ...DIR1.dir1,
                    brand: 'dir1',
                    svg: getSvgFilePath(1)
                },
                {
                    ...DIR2.dir2,
                    brand: 'dir2',
                    svg: getSvgFilePath(2)
                },
                {
                    ...DIR3.dir3,
                    brand: 'dir3',
                    svg: getSvgFilePath(3)
                },

            ]

            const rs = fs.createReadStream(__dirname + '/mockIcons.json')
                .pipe(through(updatePaths))
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

    describe('getSVGPath()', () => {
        test('to pipe out 3 configs with svg names and paths', () => {
            const configs = []
            const expected = [
                {
                    ...DIR1.dir1,
                    brand: 'dir1',
                    svg: SVG_PATH
                },
                {
                    ...DIR2.dir2,
                    brand: 'dir2',
                    svg: SVG_PATH
                },
                {
                    ...DIR3.dir3,
                    brand: 'dir3',
                    svg: SVG_PATH
                },

            ]

            const rs = fs.createReadStream(__dirname + '/mockIcons.json')
                .pipe(through(updatePaths))
                .pipe(through(getConfig))
                .pipe(through(getSVGList))
                .pipe(through(getSVGPath))
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

    describe('createDirectories()', () => {
        test('should create an output directory in dir1, dir2 and dir3', () => {
            var piped = 0
            const rs = fs.createReadStream(__dirname + '/mockIcons.json')
                .pipe(through(updatePaths))
                .pipe(through(getConfig))
                .pipe(through(getSVGList))
                .pipe(through(getSVGPath))
                .pipe(through(createDirectories))
                .pipe(through(
                    function (chunk, encoding, done) {
                        const data = JSON.parse(chunk.toString())
                        if (fs.existsSync(data.output)) piped += 1
                        done()
                    }
                ))

            rs.on('finish', () => {
                expect(piped).toEqual(3)
            })
        })
    })
    describe('saveToFile()', () => {
        const rs = fs.createReadStream(__dirname + '/mockIcons.json')
            .pipe(through(updatePaths))
            .pipe(through(getConfig))
            .pipe(through(getSVGList))
            .pipe(through(getSVGPath))
            .pipe(through(createDirectories))
            .pipe(through(saveToFile))

        rs.on('finish', () => {
            expect(fs.existsSync(DIR1.dir1.output + 'icons.json')).toBeTruthy()
            expect(fs.existsSync(DIR2.dir2.output + 'icons.json')).toBeTruthy()
            expect(fs.existsSync(DIR3.dir3.output + 'icons.json')).toBeTruthy()
        })
    })
})
