import { log_msg as log } from './util.js'

export function init() {
    log('strain_reminder', 'Initializing');
    game.settings.register("ffg-star-wars-enhancements", "strain-reminder", {
        name: game.i18n.localize('ffg-star-wars-enhancements.strain-reminder'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.strain-reminder-hint'),
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });
    log('strain_reminder', 'Initialized');
}

export function strain_reminder(created_data, ...args) {
    if (args[0] === 'Combatant' && game.settings.get("ffg-star-wars-enhancements", "strain-reminder")) {
        log('strain_reminder', 'Found combatant(s) being added to combat');
        // iterate over the combatants and update each one
        for (var i = 0; i < args[1].length; i++) {
            if (Array.isArray(created_data)) {
                var token_id = created_data[i]['_id'];
            }
            else {
                var token_id = created_data['_id'];
            }

            log('strain_reminder', 'Searching for combatant "' + token_id + '" in combat');
            for (var x in game.combat.data.combatants) {
                if (game.combat.data.combatants[x]['_id'] === token_id) {
                    if (game.combat.data.combatants[x]['actor']['isPC'] === true) {
                        log('strain_reminder', 'Found combatant. Creating chat message');
                        var actor_name = game.combat.data.combatants[x].actor.data.name;
                        var actor_strain = game.combat.data.combatants[x].actor.data.data.stats.strain.value;
                        var msg = {
                            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                            'content': actor_name + ' entered combat wth ' + actor_strain + ' strain',
                        };
                        log('strain_reminder', 'Message content: ' + msg['content']);
                        ChatMessage.create(msg);
                    } else {
                        log('strain_reminder', 'Found combatant but it is not a player character. Aborting.');
                    }
                }
            }
        }
    }
    else {
        log('strain_reminder', 'Detected combatant being added to combat, but feature is disabled. Aborting.');
    }
}
