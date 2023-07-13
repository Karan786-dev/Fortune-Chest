const { bot } = require('../bot')

bot.action(/^\/change_balance (.+)$/, (ctx) => {
    try {
        ctx.scene.enter('change_balance', { user: ctx.match[1] })
    } catch (error) {
        ctx.reply('Something wrong happened')
        console.log(error)
    }
})