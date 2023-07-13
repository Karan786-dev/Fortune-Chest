const { Scenes } = require('telegraf');
const API = require('../helpers/API');
const generateAccountText = require('../helpers/generateAccountText');
const api = new API();

const { BaseScene } = Scenes;

let scene = new BaseScene('change_balance')

scene.enter((ctx) => {
    ctx.replyWithHTML('<b>Send exact amount you want to set</b>\n<i>type:</i> <code>exit</code> to cancel')
})

scene.hears('exit', (ctx) => {
    ctx.scene.leave()
    ctx.replyWithHTML('Exited.')
})

scene.on('message', (ctx) => {
    let account_id = ctx.scene.session.state.user
    if (isNaN(ctx.message.text)) return ctx.replyWithHTML('<b>Please try again with a valid number.</b>')
    let amount = parseFloat(ctx.message.text)
    api.editAccount(api.GET_TOKEN(ctx.from.id), account_id, { balance: amount })
        .then((result) => {
            console.log(result)
            ctx.replyWithHTML(`<b>Balance updated to:</b> <code>${amount.toFixed(3)}</code>`)
            let accountText = generateAccountText(result.data)
            ctx.replyWithHTML(accountText.text, { reply_markup: { inline_keyboard: accountText.markup } })
            ctx.scene.leave()
        })
        .catch((error) => {
            ctx.reply('Something wrong happened')
            console.log(error)
        })
})


module.exports = scene