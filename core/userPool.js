'use strict'

const mysql = require('mysql2')
const config = require('config')
const UserNode = require('../class/UserNode')

const USER_SQL = 'SELECT t.id as \'id\', t.team_id as \'teamId\', t.super_user_id as \'suId\' FROM `user` t '

// 以'id'作为key值，value为UserNode的实例
let userIndex = {}
// 以't-id'作为key值，value格式为{isFull: false, array: []}
let teamIndex = {}
// 以's-id'作为key值，value格式为{isFull: false, array: []}
let suIndex = {}

const defaultIndexObject = () => {
    return {isFull: false, array: []}
}

let conn
const init = async () => {
    // const arr = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'demo', 'userSetExample.json')))
    // arr.forEach((ele) => {
    //     pool.push(new UserNode(ele.id, ele.teamId, ele.suId))
    // })
    const pool = mysql.createPool({
        host: config.dataSource.host,
        user: config.dataSource.username,
        password: config.dataSource.password,
        database: config.dataSource.database
    })
    conn = pool.promise()
}
const close = () => {
    conn.end()
}

const saveCache = async (rows) => {
    rows.forEach(element => {
        // 如果缓存中已经存在，那么就不做处理
        if(userIndex[`${element.id}`]){
            return
        }
        const userNode = new UserNode(element.id, element.teamId,element.suId)
        userIndex[`${userNode.id}`] = userNode
        if(userNode.teamId){
            const indexObject = teamIndex[`${userNode.teamId}`] || defaultIndexObject()
            indexObject.array.push(userNode)
            teamIndex[`${userNode.teamId}`] = indexObject
        }
        if(userNode.suId){
            const indexObject = suIndex[`${userNode.suId}`] || defaultIndexObject()
            indexObject.array.push(userNode)
            suIndex[`${userNode.suId}`] = indexObject
        }
    });
}
const cleanPoolCache = async () => {
    userIndex = {}
    teamIndex = {}
    suIndex = {}
}

/**
 * userIndex中有，就从pool中读，如果没有，那么就从数据库读，并缓存到pool中
 * @param {*} id 
 */
const getUserNodeById = async (id) => {
    let cacheUser = userIndex[`${id}`]
    if(!cacheUser){
        global.logger.debug(`${USER_SQL} where t.id = ${id}`)
        const [rows, fields] = await conn.execute(`${USER_SQL} where t.id = ?`, [id])
        // 如果没有查出记录，需要报出日志信息
        if(rows.length > 0){
            saveCache(rows)
            cacheUser = userIndex[`${id}`]
        }else{
            global.logger.error(`user id not found in getUserNodeById: ${id}`)
            cacheUser = null
        }
    }

    return cacheUser
}

const getUserNodesByTeamId = async (teamId) => {
    let indexObject = teamIndex[`${teamId}`]
    let cacheTeamUsers
    if(indexObject && indexObject.isFull){
        cacheTeamUsers = indexObject.array
    }else{
        global.logger.debug(`${USER_SQL} where t.team_id = ${teamId}`)
        const [rows, fields] = await conn.execute(`${USER_SQL} where t.team_id = ?`, [teamId])
        // 如果没有查出记录，需要报出日志信息
        if(rows.length > 0){
            saveCache(rows)
            indexObject = teamIndex[`${teamId}`]
            indexObject.isFull = true
            cacheTeamUsers = indexObject.array
        }else{
            global.logger.error(`teamId not found in getUserNodesByTeamId: ${teamId}`)
            cacheTeamUsers = []
        }
    }

    return cacheTeamUsers
}

const getUserNodesBySuId = async (suId) => {
    let indexObject = suIndex[`${suId}`]
    let cacheSuUsers
    if(indexObject && indexObject.isFull){
        cacheSuUsers = indexObject.array
    }else{
        global.logger.debug(`${USER_SQL} where t.super_user_id = ${suId}`)
        const [rows, fields] = await conn.execute(`${USER_SQL} where t.super_user_id = ?`, [suId])
        // 如果没有查出记录，需要报出日志信息
        if(rows.length > 0){
            saveCache(rows)
            indexObject = suIndex[`${suId}`]
            indexObject.isFull = true
            cacheSuUsers = indexObject.array
        }else{
            global.logger.error(`suId not found in getUserNodesBySuId: ${suId}`)
            cacheSuUsers = []
        }
    }

    return cacheSuUsers
}

module.exports.init = init
module.exports.close = close
module.exports.cleanPoolCache = cleanPoolCache
module.exports.getUserNodeById = getUserNodeById
module.exports.getUserNodesByTeamId = getUserNodesByTeamId
module.exports.getUserNodesBySuId = getUserNodesBySuId
