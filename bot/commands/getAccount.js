const { bot } = require('../bot')
const API = require('../helpers/API')
let api = new API()

bot.command('/getAccount', (ctx) => {
    let info = ctx.message.text.split(' ')[1]
    api.getAccount(api.GET_TOKEN(ctx.from.id), info).then((result) => {
        ctx.reply(JSON.stringify(result))
    }).catch((error) => {
        ctx.reply(error.message)
    })
})