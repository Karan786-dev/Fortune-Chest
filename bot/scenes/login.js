const { Scenes } = require('telegraf');
const API = require('../helpers/API');
const adminAPI = new API();

const { BaseScene } = Scenes;
const loginScene = new BaseScene('loginScene');

loginScene.enter((ctx) => {
    ctx.replyWithHTML(`<b>Please, enter the admin password</b>`);
});

loginScene.on('message', (ctx) => {
    let password = ctx.message.text;
    ctx.scene.leave()
    adminAPI.AUTH(password, ctx.from.id)
        .then((result) => {
            ctx.replyWithHTML('<b>Login success</b>')
        })
        .catch((error) => {
            if (error.code == "INVALID_PASSWORD") {
                ctx.replyWithHTML(`<b>Incorrect Password please try again /login</b>`)
            }
        });
    ctx.scene.leave()
});

module.exports = loginScene;
