const paginate = require("./paginate")

module.exports = (planData) => {
    console.log(planData)
    let text = `<b>Plan details below\n\nProfit: </b><code>${planData.profit}</code>%<i> of invested amount</i>\n<b>Plan DB ID: </b><code>${planData._id.toString()}</code>\n<b>Period:</b> ${planData.period} <i>Times user will get profit</i>\n<b>Referall Commission:</b> <code>${planData.commission}</code>%<i> of invested amount</i>\n<b>Minimum:</b> <code>${planData.minimum}</code> <i>Minimum amount user can invest</i>\n<b>Maximum:</b> <code>${planData.maximum}</code> <i>Maximum amount user can invest</i>\n<b>Thumbnail:</b> ${planData.image_link}`
    if ((planData.specific_days || []).length) {
        text += `\n\n<b>Users will only receive profit on these days: `
        planData.specific_days.forEach((element, index) => {
            text += (index == 0) ? element : ',' + element
        })
    } else {
        text += `<b>\n\nSpecific Days are set to default means  users will receive profit everyday in week till their period days left`
    }
    text += '</b>'
    let markup = paginate([
        { text: 'Period', callback_data: `/editPlan ${planData._id} period` },
        { text: 'Profit', callback_data: `/editPlan ${planData._id} profit` },
        { text: 'Referral Commission', callback_data: `/editPlan ${planData._id} commission` },
        { text: 'Minimum', callback_data: `/editPlan ${planData._id} minimum` },
        { text: 'Maximum', callback_data: `/editPlan ${planData._id} maximum` },
        { text: 'Thumbnail', callback_data: `/editPlan ${planData._id} image` },
        { text: 'Specific Days', callback_data: `/editPlan ${planData._id} specific_days` }
    ])
    markup.push([{ text: 'Delete', callback_data: `/deletePlan ${planData._id}` }])
    return { text, markup }
}