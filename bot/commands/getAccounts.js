const { bot } = require("../bot");
const API = require('../helpers/API');
const adminAPI = new API();

bot.command('/getAccounts', (ctx) => {
    try {
        const API = require('../helpers/API');
        const adminAPI = new API();
        adminAPI.getAllAccounts(adminAPI.GET_TOKEN(ctx.from.id), {})
            .then((result) => {
                ctx.reply(JSON.stringify(result))
                console.log(result)
            })
            .catch((error) => {
                console.log(error)
                ctx.reply('Error.')
            })
    } catch (error) {
        ctx.reply('Something wrong happened')
        console.log(error)
    }
})