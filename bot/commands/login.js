const { bot } = require("../bot");

bot.command('login', (ctx) => {
    ctx.scene.enter('loginScene');
})