const { Input } = require("telegraf");
const { bot } = require("../bot");
const API = require('../helpers/API');
const { covert_json_to_csv } = require("../helpers/convert_json_to_csv");
const adminAPI = new API();

bot.command('/getAccounts', (ctx) => {
    try {

        const API = require('../helpers/API');
        const adminAPI = new API();
        adminAPI.getAllAccounts(adminAPI.GET_TOKEN(ctx.from.id), {})
            .then((result) => {
                const data = result.data
                //Parse data
                let parsedData = data.map((element, index) => {
                    return {
                        ID: element._id,
                        NAME: element.username,
                        PHONE: element.phone,
                        EMAIL: element.email,
                        'INVITE CODE': element.inviteCode,
                        'INVITED BY': element.invitedBy || '-',
                        BALANCE: parseFloat(element?.balance || 0).toFixed(2),
                        BANNED: element.banned ? true : false,
                        'PLAN ACTIVE': element.plan ? true : false,
                        'PLAN ID': element.plan ? element.plan.id : '-',
                        'INVESTED AMOUNT': element.plan ? (element.plan.amount || 0) : '-',
                        'PLAN DAYS LEFT': element.plan ? element.plan.days_left : '-',
                    }
                })
                const csv_file = covert_json_to_csv(parsedData, ctx.from.id)
                ctx.replyWithDocument(Input.fromLocalFile(csv_file))
            })
            .catch((error) => {
                console.log(error)
                ctx.reply('Error. ', error)
            })
    } catch (error) {
        ctx.reply('Something wrong happened')
        console.log(error)
    }
})