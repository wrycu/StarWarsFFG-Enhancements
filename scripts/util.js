export function log_msg(feature, message) {
    if (game.settings.get("starwarsffg", "enableDebug")) {
        console.log("ffg-star-wars-enhancements | " + feature + " | " + message);
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
