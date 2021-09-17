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

export function rename_combatant(combatant) {
    if (!game.settings.get("ffg-star-wars-enhancements", "auto-rename-actors")) {
        log('attack_rename', 'Detected combatant being added to combat, but feature is disabled. Aborting.');
        return;
    }
    log('attack_rename', 'Found combatant being added to combat');
    if (!combatant.token && !combatant.actor) return;
    // Fetch the disposition for the combatant based on token and fall back on
    // actor, fall back to neutral if both are undefined.
    const disposition = (combatant.token?.data.disposition ?? combatant.actor?.token.disposition ?? 0);
    // Determine side based on disposition.
    const side = disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY ? 'lightside' : 'darkside';
    log('attack_rename', 'Renaming token');
    // Updates the data before it's sent to the DB, preventing names and icons from resetting on reload
    combatant.data.update({
        name: combatant.isNPC ? 'NPC' : 'PC',
        img: `systems/starwarsffg/images/dice/starwars/${side}.png`,
    });
}
