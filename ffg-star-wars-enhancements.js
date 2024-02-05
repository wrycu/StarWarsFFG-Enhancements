import { init as settings_init } from "./scripts/settings.js";
import { FfgEnhancementsLayer, log_msg as log } from "./scripts/util.js";
import { init as attack_animation_init, attack_animation_check, attack_animation } from "./scripts/animation.js";
import { init as opening_crawl_init, ready as opening_crawl_ready } from "./scripts/opening_crawl.js";
import { init as title_cards_init, ready as title_cards_ready } from "./scripts/title_cards.js";
import { init as hyperspace_init, ready as hyperspace_ready } from "./scripts/hyperspace.js";
import { init as rename_init, rename_combatant } from "./scripts/rename.js";
import {
    init as dice_helper_init,
    dice_helper,
    create_and_populate_journal as dice_helper_setup,
} from "./scripts/dice_helper.js";
import { init as strain_reminder_init, strain_reminder } from "./scripts/strain_reminder.js";
import { init as talent_checker_init, talent_checker } from "./scripts/talent_checker.js";
import { init as shop_generator_init, ready as shop_sheet_ready } from "./scripts/shop_sheet.js";
import { stim_sync } from "./scripts/stim_sync.js";
import { minionsize_sync } from "./scripts/minionsize_sync.js";
import { register_controls } from "./scripts/controls_layer.js";

import { init as quench_tests_init } from "./tests/quench.js";

Hooks.once("init", async function () {
    log("base_module", "Initializing");

    register_layers();
    settings_init();
    rename_init();
    attack_animation_init();
    dice_helper_init();
    strain_reminder_init();
    talent_checker_init();
    opening_crawl_init();
    title_cards_init();
    shop_generator_init();
    hyperspace_init();
    quench_tests_init(); // Will have no effect unless Quench is active

    log("base_module", "registering helpers");
    Handlebars.registerHelper("iff_custom", function (a, operator, b, opts) {
        var bool = false;
        switch (operator) {
            case "==":
                bool = a == b;
                break;
            case ">":
                bool = a > b;
                break;
            case "<":
                bool = a < b;
                break;
            case "!=":
                bool = a != b;
                break;
            case "in":
                bool = b.indexOf(a) > 0;
                break;
            case "not in":
                bool = b.indexOf(a) < 0;
                break;
            case "contains":
                if (a && b) {
                    bool = a.includes(b);
                } else {
                    bool = false;
                }
                break;
            default:
                throw "Unknown operator " + operator;
        }

        if (bool) {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    });
    Handlebars.registerHelper("times", function (times, opts) {
        var out = "";
        var i;
        var data = {};

        if (times) {
            for (i = 0; i < times; i += 1) {
                data.index = i;
                out += opts.fn(this, {
                    data: data,
                });
            }
        } else {
            out = opts.inverse(this);
        }

        return out;
    });

    log("base_module", "Done registering helpers");
    log("base_module", "Initializing finished");
});

Hooks.once("ready", () => {
    /* register functionality here */
    attack_animation_check();
    opening_crawl_ready();
    title_cards_ready();
    shop_sheet_ready();
    dice_helper();
    talent_checker();
    register_hooks();
    dice_helper_setup();
    hyperspace_ready();
});

Hooks.on("getSceneControlButtons", (controls) => {
    if (!game.user.isGM) {
        return;
    }
    register_controls(controls);
});

Hooks.on("createCombatant", (combatant) => {
    strain_reminder(combatant);
});
Hooks.on("preCreateCombatant", (combatant) => {
    rename_combatant(combatant);
});

Hooks.on("updateActor", (...args) => {
    stim_sync("updateActor", ...args);
});

Hooks.on("canvasReady", (...args) => {
    stim_sync("scene", ...args);
});

Hooks.on("updateActor", (...args) => {
    minionsize_sync("updateActor", ...args);
});

Hooks.on("canvasReady", (...args) => {
    minionsize_sync("canvasReady", ...args);
});

Hooks.on("createToken", async (...args) => {
    minionsize_sync("createToken", ...args);
});

function register_hooks() {
    libWrapper.register(
        "ffg-star-wars-enhancements",
        "game.ffg.RollFFG.prototype.toMessage",
        function (wrapped, ...args) {
            /*
                we may want to monkeypatch a different function in the future. this location doesn't seem to have access
                to the actual weapon in use. I'm not sure if we actually care yet, but worth considering.
             */
            var data = attack_animation(this, ...args);
            return wrapped(...data);
        }
    );
}

function register_layers() {
    CONFIG.Canvas.layers.ffgenhancements = { layerClass: FfgEnhancementsLayer, group: "interface" };
}
