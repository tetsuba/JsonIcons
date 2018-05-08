
# JSONIcons

Create JSON file(s) from specified icon files.

### Installation
```javascript
npm i JSONIcons --save
```


## Setup

#### 1. Update package.json file with a new script
```json
  "scripts": {
    "icons": "JSONIcons /icons/icons.json"
  },
```


#### 2. Create icons.json file 

Create a config file to find inputs (icons) and determine the outputs (location of where the JSON file is saved). 

```json
{
  "iconFolder1": {
    "input": "/icons/iconFolder1/",
    "output": "/public/iconFolder1/"
  },
  "iconFolder2": {
    "input": "/icons/iconFolder2/",
    "output": "/public/iconFolder2/"
  }
}
```




#### Example of icon inputs and JSON outputs 
```
App
│   README.md
│   index.js
│
└───icons
│   │   icons.json
│   │
│   └───iconFolder1
│   │   │   icon1.svg
│   │   │   icon2.svg
│   │   │   ...
|   │
│   └───iconFolder2
│       │   icon1.svg
│       │   icon2.svg
│       │   ...
│   
└───public
│   │
│   └───iconFolder1
│   │   │   icons.json // file created by JSONIcons
|   │
│   └───iconFolder2
│       │   icons.json // file created by JSONIcons
```