import { log_msg as log } from "./util.js";

export function init() {
    log("attack_rename", "Initializing");
    game.settings.register("ffg-star-wars-enhancements", "auto-rename-actors", {
        name: game.i18n.localize("ffg-star-wars-enhancements.rename.auto"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.rename.auto-hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register("ffg-star-wars-enhancements", "auto-rename-actors_friendly", {
        name: game.i18n.localize("ffg-star-wars-enhancements.rename.auto-friendly"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.rename.auto-hint-friendly"),
        scope: "world",
        config: true,
        type: String,
        default: "systems/starwarsffg/images/dice/starwars/lightside.png",
        filePicker: "Image",
    });
    game.settings.register("ffg-star-wars-enhancements", "auto-rename-actors_enemy", {
        name: game.i18n.localize("ffg-star-wars-enhancements.rename.auto-enemy"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.rename.auto-hint-enemy"),
        scope: "world",
        config: true,
        type: String,
        default: "systems/starwarsffg/images/dice/starwars/darkside.png",
        filePicker: "Image",
    });
    game.settings.register("ffg-star-wars-enhancements", "auto-rename-actors_neutral", {
        name: game.i18n.localize("ffg-star-wars-enhancements.rename.auto-neutral"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.rename.auto-hint-neutral"),
        scope: "world",
        config: true,
        type: String,
        default: "systems/starwarsffg/images/dice/starwars/lightside.png",
        filePicker: "Image",
    });
    log("attack_rename", "Initialized");
}

export function rename_combatant(combatant) {
    if (!game.settings.get("ffg-star-wars-enhancements", "auto-rename-actors")) {
        log("attack_rename", "Detected combatant being added to combat, but feature is disabled. Aborting.");
        return;
    }
    log("attack_rename", "Found combatant being added to combat");
    if (!combatant.token && !combatant.actor) return;
    // Fetch the disposition for the combatant based on token and fall back on
    // actor, fall back to neutral if both are undefined.
    const disposition = combatant.token?.disposition ?? combatant.actor?.token.disposition ?? 0;
    // Determine side based on disposition.
    let img;
    if (disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY) {
        img = game.settings.get("ffg-star-wars-enhancements", "auto-rename-actors_friendly");
    } else if (disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE) {
        img = game.settings.get("ffg-star-wars-enhancements", "auto-rename-actors_enemy");
    } else {
        img = game.settings.get("ffg-star-wars-enhancements", "auto-rename-actors_neutral");
    }
    log("attack_rename", "Renaming token");
    // Updates the data before it's sent to the DB, preventing names and icons from resetting on reload
    combatant.updateSource({
        name: combatant.isNPC ? "NPC" : "PC",
        img: img,
    });
}
