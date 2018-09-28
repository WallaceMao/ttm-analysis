'use strict'

const path = require('path')
const fs = require('fs')
const csvParser = require('csv-parse/lib/sync')

const generateJSON = async (filePath) => {
    const extName = path.extname(filePath)
    switch(extName){
        case '.csv':
            return parseCsv(filePath)
        case '.json':
        default:
            return parseJson(filePath)
    }
}

const parseCsv = async (filePath) => {
    const content = fs.readFileSync(filePath, 'UTF-8')
    const array = csvParser(content)
    const flatArray = []
    array.forEach((ar) => {
        flatArray.push(parseInt(ar[0]))
    })
    return flatArray
}

const parseJson = async (filePath) => {
    const content = fs.readFileSync(filePath, 'UTF-8')
    return JSON.parse(content)
}

module.exports.generateJSON = generateJSON