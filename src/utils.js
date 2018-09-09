const svgson = require('svgson');

const getSvgPath = function(svgCode) {
    const options = { svgo: true, pathsKey: 'myPaths' }
    return new Promise((resolve, reject) => {
        svgson(svgCode, options, (icon) => {
            resolve(icon.myPaths.childs[1].attrs.d)
        })
    })
}

module.exports = {
    getSvgPath,
}
