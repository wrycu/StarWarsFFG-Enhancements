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

export function strain_reminder(created_data) {
    if (!game.user.isGM) {
        return;
    }
    if (game.settings.get("ffg-star-wars-enhancements", "strain-reminder")) {
        log('strain_reminder', 'Found combatant(s) being added to combat');
        var token_id = created_data['_id'];

        log('strain_reminder', 'Searching for combatant "' + token_id + '" in combat');
        let combatants = game.combat.combatants.filter(combatant => combatant);
        for (var x=0; x < combatants.length; x++) {
            if (combatants[x]['_id'] === token_id) {
                if (combatants[x]['isNPC'] === false) {
                    log('strain_reminder', 'Found combatant. Creating chat message');
                    var actor_name = combatants[x].actor.name;
                    var actor_strain = combatants[x].actor.system.stats.strain.value;
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
    else {
        log('strain_reminder', 'Detected combatant being added to combat, but feature is disabled. Aborting.');
    }
}
