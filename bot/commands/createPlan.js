const {bot} = require('../bot')

bot.command('createPlan',(ctx)=>{
    ctx.scene.enter('create_plan')
})