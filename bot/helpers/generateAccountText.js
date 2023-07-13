module.exports = (data) => {
    let text = `<b>User account found.</b>\n\n<b>DB id:</b> <code>${data._id}</code>\n<b>Email:</b> <code>${data.email}</code>\n<b>Phone:</b> <code>${data.phone}</code>\n<b>Username:</b> <code>${data.username}</code>\n<b>Balance:</b> <code>${(data.balance || 0).toFixed(3)}</code>\n<b>Invite Code:</b> <code>${data.inviteCode}</code>\n\n<b>Plan active:</b> <code>${data.plan ? 'Yes' : 'No'}</code>`

    let markup = [
        [{ text: 'Change Balance', callback_data: '/change_balance ' + data._id }],
        [{ text: data.block ? 'Unblock' : 'Block', callback_data: `/blockAccount ${data._id} ` + (data.block ? 'unblock' : 'block') }]
    ]

    if (data.invitedBy) {
        markup.push([{ text: 'Inviter data', callback_data: `/userData ${data.invitedBy}` }])
        text += `\n<b>Invited By:</b> <code>${data.invitedBy}</code>`
    }

    if (data.plan) {
        markup.push([{ text: 'Plan data', callback_data: `/plan ${data.plan.id}` }])
        text += `\n<b>Plan ID:</b> <code>${data.plan.id}</code>\n<b>Plan days left:</b> <code>${data.plan.days_left}</code>\n<b>Invested in plan:</b> <code>${(data.plan.amount || 0).toFixed(2)} Rs</code>`
    }

    return { text, markup };
}