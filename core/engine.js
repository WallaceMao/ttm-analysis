'use strict'

const TeamEdge = require('../class/TeamEdge')
const SuEdge = require('../class/SuEdge')
const chalk = require('chalk')

/**
 * 执行逻辑为：
 * 1  从搜索队列的头部取出当前操作的节点元素，并存入结果缓存
 * 2  如果当前节点元素有teamId，那么根据teamId读取下级节点，将当前节点元素和下级节点元素的edge存入结果缓存中。并将下级节点元素排入到搜索队列的队尾
 * 3  如果当前节点元素有suId，那么根据suId读取下级节点，将当前节点元素和下级节点元素的edge存入结果缓存中。并将下级节点元素排入到搜索队列的队尾
 * @param {*} searchQueue 搜索队列
 * @param {*} cache 结果缓存
 */
const doSearch = async (userPool, searchQueue, cache) => {
    const currentNode = searchQueue.shift()
    // 设置为节点已经读取
    currentNode.visitStatus = 'visited'
    cache.nodeArray.push(currentNode)

    // 读取teamEdge
    if(currentNode.teamId){
        const teamUserNodeList = await userPool.getUserNodesByTeamId(currentNode.teamId)
        teamUserNodeList.forEach((userNode) => {
            // 如果是已经访问过的，那么不再访问
            if(userNode.visitStatus === 'visited'){
                return
            }
            // 数据量太大，暂时不启用
            // cache.edgeTeamArray.push(new TeamEdge(currentNode.teamId, currentNode, userNode))
            // 如果已经在queue中
            if(userNode.visitStatus === 'queued'){
                return
            }
            userNode.visitStatus = 'queued'
            searchQueue.push(userNode)
        })
    }

    // 读取suEdge
    if(currentNode.suId){
        const suUserNodeList = await userPool.getUserNodesBySuId(currentNode.suId)
        suUserNodeList.forEach((userNode) => {
            // 如果是已经访问过，那么不再访问
            if(userNode.visitStatus === 'visited'){
                return
            }
            // 数据量太大，暂时不启用
            // cache.edgeSuArray.push(new SuEdge(currentNode.suId, currentNode, userNode))
            // 如果已经在queue中
            if(userNode.visitStatus === 'queued'){
                return
            }
            userNode.visitStatus = 'queued'
            searchQueue.push(userNode)
        })
    }
}
/**
 * 使用广度优先的原则来遍历
 * @param {*} userPool 用户池
 * @param {*} startId 起始用户的id
 */
const search = async (userPool, startId) => {
    const startTime = new Date().getTime()
    console.log(chalk.green(`--engine-- search started, startId is: ${startId}====`))

    // 获取初始userNode
    const startNode = await userPool.getUserNodeById(startId)
    if(!startNode){
        global.logger.error(`userNode not exists: id: ${startId}`)
        return
    }

    // 用来存储搜索队列的数据结构
    const searchQueue = []
    // 用来存储搜索结果的数据结构
    const result = {
        nodeArray: [],
        edgeTeamArray: [],
        edgeSuArray: []
    }
    // 开始循环查找
    searchQueue.push(startNode)
    while(searchQueue.length > 0){
        console.log(chalk.green(`--engine-- loop: searchQueue size: ${searchQueue.length}, head node id: ${searchQueue[0].id}`))
        await doSearch(userPool, searchQueue, result)
    }
    console.log(chalk.green(`--engine-- finished, startId is: ${startId}, time used: ${new Date().getTime() - startTime}ms====`))
    return result
}


module.exports.search = search