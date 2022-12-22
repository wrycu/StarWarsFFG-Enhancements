import {log_msg, log_msg as log} from './util.js'

let module_name = 'hologram';

export function convert_to_hologram() {
    if (!game.modules.get('tokenmagic')?.active) {
        ui.notifications.warn("You must install and enable Token Magic FX to use this feature");
        log_msg(module_name, "Refusing to convert token to hologram because TokenMagic is not loaded");
    }
    if (canvas.tokens.controlled.length < 1) {
        ui.notifications.warn("You must select at least one token");
        log_msg(module_name, "Refusing to convert token to hologram because no token is selected");
    }

    let filter_id = 'hologram';
    let tokens = canvas.activeLayer.placeables.filter(p => p.controlled === true) || [];

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
                    animated:
                        {
                            thickness:
                                {
                                    active: true,
                                    loopDuration: 3000,
                                    animType: "syncCosOscillation",
                                    val1: 0,
                                    val2: 4
                                }
                        }
                }, {
                    filterType: "wave",
                    filterId: "myWaves",
                    time: 0,
                    anchorX: 0.5,
                    anchorY: 1000,
                    strength: 0.005,
                    frequency: 1000,
                    color: 0x99CCFF,
                    maxIntensity: 1.1,
                    minIntensity: 0.9,
                    padding: 5,
                    animated:
                        {
                            time:
                                {
                                    active: true,
                                    speed: 0.0035,
                                    animType: "move"
                                },
                            anchorX:
                                {
                                    active: false,
                                    val1: 0.15,
                                    val2: 0.85,
                                    animType: "syncChaoticOscillation",
                                    loopDuration: 20000
                                },
                            anchorY:
                                {
                                    active: false,
                                    val1: 0.15,
                                    val2: 0.85,
                                    animType: "syncSinOscillation",
                                    loopDuration: 20000
                                }
                        }
                }, {
                    filterType: "adjustment",
                    filterId: "myAdjust",
                    saturation: 1,
                    brightness: 1,
                    contrast: 1,
                    gamma: 1,
                    red: 1,
                    green: 1,
                    blue: 1,
                    alpha: 0.75,
                    animated:
                        {
                            alpha:
                                {
                                    active: true,
                                    loopDuration: 500,
                                    animType: "syncCosOscillation",
                                    val1: 0.75,
                                    val2: 0.85
                                }
                        }
                }
            ];
            TokenMagic.addUpdateFiltersOnSelected(params);
        }
    });
}
