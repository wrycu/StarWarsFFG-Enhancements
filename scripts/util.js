export function log_msg(feature, message) {
    try {
        if (game.settings.get("starwarsffg", "enableDebug")) {
            console.log("ffg-star-wars-enhancements | " + feature + " | " + message);
        }
    } catch (e) {
        // Setting may not be registered yet during init phase
    }
}

export class FfgEnhancementsLayer extends InteractionLayer {
    constructor() {
        super();
    }

    static get layerOptions() {
        return foundry.utils.mergeObject(super.layerOptions, {
            name: "ffgenhancements",
            zIndex: 241,
        });
    }
}
