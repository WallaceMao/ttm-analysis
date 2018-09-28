'use strict'
/**
 * 计算引擎的管理者
 */
const engine = require('./engine')
const userPool = require('./userPool')
const output = require('./output')
const chalk = require('chalk')

/**
 * 以数组中的元素作为id查找
 * @param {*} startIdArray 
 * @param {*} outputSize 只输出大于outptuSize的集合 
 */
const scan = async (startIdArray, outputSize) => {
    try{

        if(!startIdArray || !startIdArray.length){
            console.error(`startIdArray invalid: ${startIdArray}`)
            return
        }

        console.log(chalk.blue(`--manager-- scan total: ${startIdArray.length}`))
        outputSize = outputSize || 100
        // 载入需要排除的id
        const excludeIdArray = await output.readExcludeIds()
        // userPool初始化
        await userPool.init()
        // 循环读取
        let num = 0
        let element
        console.log(chalk.blue('----------------'))
        for(let i = 0; i < startIdArray.length; i++){
            element = startIdArray[i]
            num ++
            // 如果excludeIdArray中含有element，那么就不执行
            if(excludeIdArray.indexOf(element) !== -1){
                console.log(chalk.blue(`--manager-- skiped startId(${element}), finished ${num} ids, total: ${startIdArray.length}`))
                continue
            }
            // 循环前清理
            await userPool.cleanPoolCache()

            const searchResult = await engine.search(userPool, element)
            await output.saveSingleSet(element, searchResult, outputSize)

            // 遍历输出结果，将结果中的每个user的id都加入到exclude数组，保证以后不会再次读取
            searchResult.nodeArray.forEach(userNode => {
                excludeIdArray.push(userNode.id)
            })
            console.log(chalk.blue(`--manager-- searched startId(${element}), finished ${num} ids, total: ${startIdArray.length}`))
        }
        console.log(chalk.blue('----------------'))
        // 将excludeIdArray写入到文件中
        await output.saveExcludeIds(excludeIdArray)
        console.log(chalk.blue(`--manager-- scan completed: ${startIdArray.length} ids`))

    }catch(err){
        global.logger.error(err.stack)
    }finally{
        await userPool.close()
    }
}

/**
 * 根据startId查找在userPool中查找单个用户所在的用户集
 * @param {*} startId 
 */
const scanOne = async (startId) => {
    try{
        await userPool.init()
        const searchResult = await engine.search(userPool, startId)
        await output.saveSingleSet(startId, searchResult)
    }catch(err){
        global.logger.error(err.stack)
    }finally{
        await userPool.close()
    }
}


module.exports.scan = scan