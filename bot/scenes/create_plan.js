const { Scenes } = require('telegraf')
const paginate = require('../helpers/paginate')
const isImageUrl = require('../helpers/isImageUrl')
const { default: axios } = require('axios')
const API = require('../helpers/API')
const api = new API()
const scene = new Scenes.BaseScene('create_plan')

let days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

scene.enter((ctx) => {
    ctx.scene.session.data = {}
    ctx.scene.session.target = 'profit'
    ctx.replyWithHTML(`<b>Send plan profit ,like for 2% type 2</b>\n\n<i>You can type</i> <code>exit</code> <i>at any time to cancel this process</i>`)
})

scene.hears('exit', (ctx) => {
    delete ctx.scene.session.data
    ctx.scene.leave()
    ctx.reply('Process cancelled')
})

scene.on('message', async (ctx) => {
    let answer = ctx.message.text
    switch (ctx.scene.session.target) {
        case 'profit':
            if (isNaN(answer) || parseFloat(answer) < 0) return ctx.replyWithHTML('<b>Please send a valid number.</b>')
            ctx.scene.session.data.profit = parseFloat(answer)
            ctx.replyWithHTML('<b>Send amount of days/times users can receive profit</b>')
            ctx.scene.session.target = 'period'
            break;
        case 'period':
            if (isNaN(answer) || parseFloat(answer) < 1) return ctx.replyWithHTML('<b>Please send a valid number.</b>')
            ctx.scene.session.data.period = parseInt(answer)
            ctx.replyWithHTML('<b>Send percentage of referall commission ,like for 2% type 2</b>')
            ctx.scene.session.target = 'commission'
            break
        case 'commission':
            if (isNaN(answer) || parseFloat(answer) < 0) return ctx.replyWithHTML('<b>Please send a valid number.</b>')
            ctx.scene.session.data.commission = parseFloat(answer)
            ctx.replyWithHTML('<b>Send minimum amount user can invest in this plan</b>')
            ctx.scene.session.target = 'minimum'
            break

        case 'minimum':
            if (isNaN(answer) || parseFloat(answer) < 0) return ctx.replyWithHTML('<b>Please send a valid number.</b>')
            ctx.scene.session.data.minimum = parseFloat(answer)
            ctx.replyWithHTML('<b>Send maximum amount user can invest in this plan</b>')
            ctx.scene.session.target = 'maximum'
            break

        case 'maximum':
            if (isNaN(answer) || parseFloat(answer) < 0) return ctx.replyWithHTML('<b>Please send a valid number.</b>')
            ctx.scene.session.data.maximum = parseFloat(answer)
            ctx.replyWithHTML('<b>Send plan thumbnail image link</b>')
            ctx.scene.session.target = 'image'
            break
        case 'image':
            console.log(answer)
            ctx.replyWithPhoto(answer, { caption: 'Chest Thumbnail.' }).then(() => {
                ctx.scene.session.data.image_link = answer
                ctx.scene.session.data.specific_days = []
                ctx.scene.session.target = 'specific_days'

                let array_of_buttons = paginate(days.map((day, index) => {
                    return { text: day.toUpperCase(), callback_data: '/add_day ' + day }
                }), 3)
                array_of_buttons.push([{ text: 'Next =>', callback_data: 'next' }])
                ctx.replyWithHTML('<b>Select specific day when users will receive their profit</b>', { reply_markup: { inline_keyboard: array_of_buttons } })
            }).catch((error) => {
                console.log(error)
                ctx.replyWithHTML('<b>Please send an image url that returns an image</b>')
            })
            break
        default:
            break;
    }
})


scene.action(/^\/add_day (.+)$/, (ctx) => {
    try {
        let day = ctx.match[1]
        if (ctx.scene.session.data.specific_days.includes(day)) {
            ctx.scene.session.data.specific_days =
                ctx.scene.session.data.specific_days.filter((day_in_session) => {
                    return day != day_in_session
                })
        } else if (ctx.scene.session.data.specific_days.length == 6) {
            ctx.scene.session.data.specific_days = []
        } else {
            ctx.scene.session.data.specific_days.push(day)
        }
        let array_of_buttons = paginate(days.map((day1, index) => {
            return { text: (ctx.scene.session.data.specific_days.length ? (ctx.scene.session.data.specific_days.includes(day1) ? '✅ ' : '❎ ') : '') + day1, callback_data: '/add_day ' + day1 }
        }), 3)
        array_of_buttons.push([{ text: 'Next =>', callback_data: 'next' }])
        let text = '<b>Select specific day when users will receive their profit</b>'
        if (ctx.scene.session.data.specific_days.length) {
            text += `\n\nUsers will only receive profit on these days: `
            ctx.scene.session.data.specific_days.forEach((element, index) => {
                text += (index == 0) ? element : ',' + element
            })
        } else {
            text += `\n\nSpecific Days are set to default means  users will receive profit everyday in week till their period days left`
        }
        ctx.editMessageText(text, { reply_markup: { inline_keyboard: array_of_buttons }, parse_mode: 'HTML' }).catch((error) => {
            console.log(error)
            ctx.answerCbQuery(`there's something wrong , please try again`)
        })
    } catch (error) {
        ctx.reply('Something wrong happened')
        console.log(error)
    }
})


scene.action('next', (ctx) => {
    try {
        let planData = ctx.scene.session.data
        let text = `<b>Confirm plan creation , check plan details below\n\nProfit: </b><code>${planData.profit}</code>%<i> of invested amount</i>\n<b>Period:</b> ${planData.period} <i>Times user will get profit</i>\n<b>Referall Commission:</b> <code>${planData.commission}</code>%<i> of invested amount</i>\n<b>Minimum:</b> <code>${planData.minimum}</code> <i>Minimum amount user can invest</i>\n<b>Maximum:</b> <code>${planData.maximum}</code> <i>Maximum amount user can invest</i>\n<b>Thumbnail:</b> ${planData.image_link}`
        if (ctx.scene.session.data.specific_days.length) {
            text += `\n\n<b>Users will only receive profit on these days: `
            ctx.scene.session.data.specific_days.forEach((element, index) => {
                text += (index == 0) ? element : ',' + element
            })
        } else {
            text += `<b>\n\nSpecific Days are set to default means  users will receive profit everyday in week till their period days left`
        }
        text += '</b>'
        ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Continue', callback_data: 'continue' }, { text: 'Cancel', callback_data: 'cancel' }]] }, disable_web_page_preview: true })
    } catch (error) {
        ctx.reply('Something wrong happened')
        console.log(error)
    }
})

scene.action('continue', ctx => {
    try {
        let planData = ctx.scene.session.data
        consolr.log(planData)
        api.createPlan(api.GET_TOKEN(ctx.from.id), planData).
            then((result) => {
                console.log(result)
            })
            .catch((error) => {
                console.log(error)
            })
    } catch (error) {
        ctx.reply('Something wrong happened')
        console.log(error)
    }
})

scene.action('cancel', (ctx) => {
    ctx.deleteMessage()
    delete ctx.scene.session.data
    ctx.scene.leave()
    ctx.reply('Process cancelled')
})
module.exports = scene