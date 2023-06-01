const fs = require('fs')
const path = require('path')

fs.readdirSync(__dirname).forEach(command =>{
    if(command != 'index.js') {
        require(path.join(__dirname,command))
        console.log('Command Active:',command)
    }
})