import { log_msg as log } from './util.js'

let module_name = 'talent_checker';

export function init () {
    log(module_name, 'Initializing');
    game.settings.register("ffg-star-wars-enhancements", "talent-checker-enable", {
        name: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.enable'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.enable-hint'),
        scope: "world",
        type: Boolean,
        default: true,
    });
    log(module_name, 'Done initializing');
}

export function talent_checker() {
    Hooks.on("canvasReady", (canvas) => {
        if (game.user.isGM) {
            console.log("heya")
            console.log(canvas);
            console.log(canvas.tokens)
            for (let i=0; i < canvas.tokens.placeables.length; i++) {
                let token = canvas.tokens.placeables[i];
                for (let x=0; x < token.actor.data.items.length; x++) {
                    let item = token.actor.data.items[x];
                    if (item.type === 'talent' && item.name === 'Adversary') {
                        console.log(canvas.tokens.placeables[i].effects)
                        console.log(token.data.name + ' has talent Adversary');
                        canvas.tokens.placeables[i].toggleEffect('icons/svg/radiation.svg', {'active': true});
                    }
                }
            }
        }
    });

    Hooks.on("createToken", (scene, token, ...args) => {
        if (game.user.isGM) {
            console.log("heyyyyyyyyyyyyy babiii")
            console.log(scene);
            console.log(token);
            console.log(...args);
            let token_id = token._id;
            for (let i=0; i < scene.data.tokens.length; i++) {
                if (scene.data.tokens[i]._id === token_id) {
                    let actor = game.actors.get(scene.data.tokens[i].actorId);
                    for (let i=0; i < actor.data.items.length; i++) {
                        let item = actor.data.items[i];
                        if (item.type === 'talent' && item.name === 'Adversary') {
                            console.log(canvas.tokens.placeables[i].effects)
                            console.log(actor.name + ' has talent Adversary');
                            token.id = token_id;
                            token.effects.push('icons/svg/radiation.svg')
                        }
                    }
                    console.log(scene.data.tokens[i].name + ' was created');
                    console.log(scene.data.tokens[i]);
                }
            }
        }
    });
}
