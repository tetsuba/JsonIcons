const array = ['burton', 'dorothyperkins', 'evans', 'missselfridge', 'topman', 'topshop', 'wallis']

array.forEach((brand) => {
    axios.get('./' + brand + '/icons.json')
        .then(function (response) {
            loadIcons(response.data, '.' + brand + '-icons-list')
        })
        .catch(function (error) {
            console.log(error);
        });
})

function loadIcons(icons, className) {
    let ele = document.querySelector(className);

    R.forEach(
        (iconName) => {
            let block = document.createElement('div');
            block.setAttribute('class', 'icon-block');

            let body = document.createElement('div');
            body.setAttribute('class', 'icon-body');

            let footer = document.createElement('div');
            footer.setAttribute('class', 'icon-footer')
            let text = document.createTextNode(iconName);
            footer.appendChild(text)

            let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
            svg.setAttribute('viewBox', '0 0 32 32')
            svg.setAttribute('class', 'icon-' + iconName)

            let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', icons[iconName])
            svg.appendChild(path);
            body.appendChild(svg);
            block.appendChild(body);
            block.appendChild(footer);
            ele.appendChild(block);
        },
        R.keys(icons)
    )

}