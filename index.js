const path = require('path')
const chalk = require('chalk')
const logConfig = require('./config/logConfig')
const fileHandler = require('./util/fileHandler')
const manager = require('./core/manager')

global.logger = logConfig.commonLogger

const start = async () => {
    try{
        const directory = process.argv[2]
        const outputSizeArgv = parseInt(process.argv[3])
        let outputSize

        if(!directory){
            console.error(chalk.red('ERROR: lack argument: no output root directory'))
            return
        }
        if(!global.isNaN(outputSizeArgv)){
            outputSize = outputSizeArgv
        }
        global.outputDirectory = directory
        
        const INPUT_ROOT_PATH = path.join(__dirname, 'files', directory, 'input')
        
        const array = await fileHandler.generateJSON(path.join(INPUT_ROOT_PATH, 'id.csv'))
        await manager.scan(array, outputSize)
    }catch(err){
        console.error(err.stack)
    }
}

start()

