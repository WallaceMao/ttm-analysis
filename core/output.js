'use strict'
/**
 * 用于处理输出
 */
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const moment = require('moment')

const dataRootPath = path.join(__dirname, '..', 'files')
const filePrefix = 'set-'
const excludeIdsFile = 'excludeIds.json'

const getTimeStamp = () => {
    return moment().format('YYYYMMDDhhmmss')
}
const getInputPath = () => {
    return path.join(dataRootPath, global.outputDirectory, 'input')
}
const getOutputPath = () => {
    return path.join(dataRootPath, global.outputDirectory, 'output')
}

const saveSingleSet = async (startId, cache, outputSetSize) => {
    outputSetSize = outputSetSize || 0
    const setSize = cache.nodeArray.length
    // setSize小于outputSetSize的，不进行输出
    if(setSize < outputSetSize){
        console.log(chalk.yellow(`--output-- no output, startId: ${startId}, setSize: ${setSize}, outputSize: ${outputSetSize}`))
        return
    }
    console.log(chalk.yellow(`--output-- multi output: startId: ${startId}, setSize: ${setSize}, outputSize: ${outputSetSize}`))
    const fileName = `${filePrefix}${startId}-${getTimeStamp()}.json`
    const content = {
        meta: {
            startId: startId,
            size: setSize
        },
        set: cache.nodeArray
    }
    fs.writeFileSync(path.join(getOutputPath(), fileName), JSON.stringify(content), 'UTF-8')
}

const readExcludeIds = async () => {
    const content = fs.readFileSync(path.join(getInputPath(), excludeIdsFile), 'UTF-8') || '[]'
    return JSON.parse(content)
}

const saveExcludeIds = async (json) => {
    fs.writeFileSync(path.join(getInputPath(), excludeIdsFile), JSON.stringify(json), 'UTF-8')
}

module.exports.saveSingleSet = saveSingleSet
module.exports.saveExcludeIds = saveExcludeIds
module.exports.readExcludeIds = readExcludeIds