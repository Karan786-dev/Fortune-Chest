const { bot } = require('../bot')
const API = require('../helpers/API')
const generateAccountText = require('../helpers/generateAccountText')
const api = new API()

bot.action(/^\/blockAccount (.+)$/, (ctx) => {
    try {
        ctx.deleteMessage()
        let user_id = ctx.match[1].split(' ')[0]
        let status = ctx.match[1].split(' ')[1]
        api.editAccount(api.GET_TOKEN(ctx.from.id), user_id, status == 'block' ? { block: true } : { unblock: true }).then((result) => {
            console.log(result)
            return
            let accountText = generateAccountText(result.data)
            ctx.replyWithHTML(accountText.text, { reply_markup: { inline_keyboard: accountText.markup } })
        }).catch((error) => {
            console.log(error)
        })
    } catch (error) {
        ctx.reply('Something wrong happened')
        console.log(error)
    }
})