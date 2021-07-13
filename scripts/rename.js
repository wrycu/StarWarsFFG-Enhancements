import { log_msg as log } from './util.js'

export function init() {
    log('attack_rename', 'Initializing');
    game.settings.register("ffg-star-wars-enhancements", "auto-rename-actors", {
        name: game.i18n.localize('ffg-star-wars-enhancements.rename.auto'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.rename.auto-hint'),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });
    log('attack_rename', 'Initialized');
}

export function rename_actors(created_data) {
    if (game.settings.get("ffg-star-wars-enhancements", "auto-rename-actors")) {
        log('attack_rename', 'Found combatant being added to combat');
        var update_data = {
            'data': {
                '_id': created_data['data']['_id'],
            },
            '_id': created_data['data']['_id']
        }

        log('attack_rename', 'ID "' + update_data['data']['_id'] + '"');
        // used to be a global value, now it's a "module" - unsure of how to access it and I don't see it changing
        //   drastically
        let token_dispositions = {
            'friendly': 1,
            'neutral': 0,
            'enemy': -1,
        };
        let combatants = game.combat.data.combatants.filter(combatant => combatant);
        for (var x=0; x < combatants.length; x++) {
            // check the disposition and update the name and image
            // this is done as a second (different) call because we want to update the information on a temporary basis
            // and we can't specify part of the data is temporary
            if (combatants[x]['data']['_id'] === update_data['_id']) {
                if (combatants[x].token.data.disposition === token_dispositions['friendly']) {
                    if (combatants[x].isNPC) {
                        update_data['name'] = 'NPC';
                    } else {
                        update_data['name'] = 'PC';
                    }
                    update_data['img'] = 'systems/starwarsffg/images/dice/starwars/lightside.png';
                }
                else {
                    update_data['name'] = 'NPC';
                    update_data['img'] = 'systems/starwarsffg/images/dice/starwars/darkside.png';
                }
                log('attack_rename', 'Renaming token');
                game.combat.combatants.filter(combatant => combatant)[x].update(update_data);
                break;
            }
        }
    }
    else {
        log('attack_rename', 'Detected combatant being added to combat, but feature is disabled. Aborting.');
    }
}
