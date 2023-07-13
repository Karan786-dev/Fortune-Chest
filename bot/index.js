const { bot } = require("./bot");
const { Scenes, session } = require('telegraf');
const { API_LINK } = require("./config");

console.log('Bot listining to updates')
bot.launch().catch((error) => {
    console.log(error)
})

require('./commands')
require('./scenes')
require('./actions')



