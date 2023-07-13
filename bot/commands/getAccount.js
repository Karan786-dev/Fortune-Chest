const { bot } = require('../bot')
const API = require('../helpers/API')
let api = new API()

bot.command('/getAccount', (ctx) => {
    let info = ctx.message.text.split(' ')[1]
    api.getAccount(api.GET_TOKEN(ctx.from.id), info).then((result) => {
        let data = result.data
        let text = `<b>User account found.</b>\n\n<b>DB id:</b> <code>${data._id}</code>\n<b>Email:</b> <code>${data.email}</code>\n<b>Phone:</b> <code>${data.phone}</code>\n<b>Username:</b> <code>${data.username}</code>\n<b>Balance:</b> <code>${(data.balance || 0).toFixed(3)}</code>\n<b>Invite Code:</b> <code>${data.inviteCode}</code>\n\n<b>Plan active:</b> <code>${data.plan ? 'Yes' : 'No'
            }</code > `
        let markup = [
            [{ text: data.block ? 'Unblock' : 'Block', callback_data: `/blockAccount ${data._id} ` + (data.block ? 'unblock' : 'block'), text: 'Change Balance', callback_data: '/change_balance ' + data._id }]
        ]
        if (data.invitedby) {
            markup.push([{ text: 'inviter data', callback_data: `/userData ${data.invitedby}` }])
            text += `\n<b>Invited By:</b> <code>${data.invitedby}</code>`
        }
        if (data.plan) {
            markup.push([{ text: 'Plan data', callback_data: `/plan ${data.plan.id}` }])
            text += `\n<b>Plan ID:</b> <code>${data.plan.id}</code>\n<b>Plan days left:</b> <code>${data.plan.days_left}</code>\n<b>Invested in plan:</b> <code>${(data.plan.amount || 0).toFixed(2)} Rs</code>`
        }
        ctx.replyWithHTML(text, { reply_markup: { inline_keyboard: markup } })
    }).catch((error) => {
        ctx.reply(error.message)
    })
})