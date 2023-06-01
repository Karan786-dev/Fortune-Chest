const { Telegraf, session, Scenes } = require("telegraf");
const { BOT_TOKEN } = require("./config");
const { BaseScene, Stage } = Scenes;
const stage = new Stage()
const bot = new Telegraf(BOT_TOKEN)
bot.use(session());
bot.use(stage.middleware())
module.exports = { bot, stage }