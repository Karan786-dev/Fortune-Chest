const path = require("path");
const { stage } = require("../bot");
const fs = require('fs');

fs.readdirSync(__dirname).forEach((file) => {
    if (file !== path.basename(__filename)) {
        const sceneModule = require(path.join(__dirname, file));
        const scene = sceneModule;

        stage.register(scene);
        console.log('Scene Active:', scene.id);
    }
});
