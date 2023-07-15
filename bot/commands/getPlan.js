const { bot } = require('../bot')
const API = require('../helpers/API')
const api = new API()
const generatePlanText = require('../helpers/generatePlanText')

bot.command('/getPlan', (ctx) => {
    try {
        api.getPlan(api.GET_TOKEN(ctx.from.id), ctx.message.text.split(' ')[1]).then((result) => {
            let planText = generatePlanText(result.data)
            ctx.replyWithHTML(planText.text, { reply_markup: { inline_keyboard: planText.markup } })
        })
    } catch (error) {
        console.log(error)
        ctx.reply('An Error happened')
    }
})