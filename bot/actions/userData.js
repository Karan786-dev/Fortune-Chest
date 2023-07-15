const { bot } = require('../bot')
const API = require('../helpers/API')
const generateAccountText = require('../helpers/generateAccountText')
let api = new API()

bot.action(/^\/userData (.+)$/, (ctx) => {
    try {
        let info = ctx.match[1]
        api.getAccount(api.GET_TOKEN(ctx.from.id), info).then((result) => {
            let data = result.data
            let accountText = generateAccountText(data)
            ctx.replyWithHTML(accountText.text, { reply_markup: { inline_keyboard: accountText.markup } })
        }).catch((error) => {
            ctx.reply(error.message)
        })
    } catch (error) {
        ctx.reply('Something wrong happened')
        console.log(error)
    }
})