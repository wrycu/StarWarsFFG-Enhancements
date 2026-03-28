import { log_msg, log_msg as log } from "./util.js";

let module_name = "hologram";

export function convert_to_hologram() {
    if (!game.modules.get("tokenmagic")?.active) {
        ui.notifications.warn("You must install and enable Token Magic FX to use this feature");
        log_msg(module_name, "Refusing to convert token to hologram because TokenMagic is not loaded");
        return;
    }
    if (canvas.tokens.controlled.length < 1) {
        ui.notifications.warn("You must select at least one token");
        log_msg(module_name, "Refusing to convert token to hologram because no token is selected");
        return;
    }

    let filter_id = "hologram";
    let tokens = canvas.activeLayer.placeables.filter((p) => p.controlled === true) || [];

    tokens.forEach(function (element) {
        if (TokenMagic.hasFilterId(element, filter_id)) {
            log_msg(module_name, "Removing hologram effect from token");
            TokenMagic.deleteFiltersOnSelected();
        } else {
            log_msg(module_name, "Adding hologram effect from token");
            let params = [
                {
                    filterType: "outline",
                    filterId: filter_id,
                    padding: 10,
                    color: 0x999999,
                    thickness: 1,
                    quality: 5,
                    zOrder: 9,
                    animated: {
                        thickness: {
                            active: true,
                            loopDuration: 3000,
                            animType: "syncCosOscillation",
                            val1: 0,
                            val2: 4,
                        },
                    },
                },
                {
                    filterType: "crt",
                    filterId: "myLines",
                    curvature: 0,
                    lineWidth: 2.0,
                    lineContrast: 0.3,
                    verticalLine: false,
                    noise: 0,
                    vignetting: 0,
                    animated: {
                        seed: {
                            active: true,
                            animType: "randomNumber",
                            val1: 0,
                            val2: 1,
                        },
                    },
                },
                {
                    filterType: "adjustment",
                    filterId: "myAdjust",
                    saturation: 1.5,
                    brightness: 1.5,
                    contrast: 2,
                    gamma: 1,
                    red: 0,
                    green: 0.25,
                    blue: 4,
                    alpha: 1,
                    animated: {
                        alpha: {
                            active: true,
                            loopDuration: 500,
                            animType: "syncCosOscillation",
                            val1: 0.75,
                            val2: 0.85,
                        },
                    },
                },
            ];
            TokenMagic.addUpdateFiltersOnSelected(params);
        }
    });
}
