import { log_msg as log } from './util.js'
import { setting_image } from './settings.js'

let module_name = 'talent_checker';

export function init () {
    log(module_name, 'Initializing');
    game.settings.register("ffg-star-wars-enhancements", "talent-checker-enable", {
        name: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.enable'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.enable-hint'),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register("ffg-star-wars-enhancements", "talent-checker-status", {
        name: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.status'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.status-hint'),
        scope: "world",
        config: true,
        type: setting_image,
        default: 'icons/svg/regen.svg',
    });
    log(module_name, 'Done initializing');
}

export function talent_checker() {
    Hooks.on("canvasReady", (canvas) => {
        if (game.user.isGM && game.settings.get("ffg-star-wars-enhancements", "talent-checker-enable")) {
            log(module_name, 'Detected scene load; searching for actors with the Adversary talent');
            for (let i=0; i < canvas.tokens.placeables.length; i++) {
                let token = canvas.tokens.placeables[i];
                log(module_name, 'Found token ' + token.data.name + '; searching for Adversary talent');
                for (let x=0; x < token.actor.data.items.length; x++) {
                    let item = token.actor.data.items[x];
                    if (item.type === 'talent' && item.name === 'Adversary') {
                        log(module_name, 'Found Adversary talent on ' + token.data.name + '! Adding status');
                        canvas.tokens.placeables[i].toggleEffect(game.settings.get("ffg-star-wars-enhancements", "talent-checker-status"), {'active': true});
                    }
                }
            }
        }
    });

    Hooks.on("createToken", (scene, token, ...args) => {
        if (game.user.isGM && game.settings.get("ffg-star-wars-enhancements", "talent-checker-enable")) {
            log(module_name, 'Detected token creation; looking for actor data');
            let token_id = token._id;
            for (let i=0; i < scene.data.tokens.length; i++) {
                if (scene.data.tokens[i]._id === token_id) {
                    let actor = game.actors.get(scene.data.tokens[i].actorId);
                    log(module_name, 'Found actor ' + actor.name + '; looking for talent');
                    for (let i=0; i < actor.data.items.length; i++) {
                        let item = actor.data.items[i];
                        if (item.type === 'talent' && item.name === 'Adversary') {
                            log(module_name, actor.name + ' has talent Adversary; adding status');
                            token.id = token_id;
                            token.effects.push(game.settings.get("ffg-star-wars-enhancements", "talent-checker-status"));
                        }
                    }
                }
            }
        }
    });
}
