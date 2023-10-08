// noinspection JSUnresolvedVariable,JSUnresolvedFunction,ES6ConvertVarToLetConst

import { setting_image, setting_audio } from "./settings.js";
import { log_msg as log } from "./util.js";

export function init() {
    log("attack_animation", "Initializing");

    if (game.modules.get("jb2a_patreon")) {
        var base_path = "modules/jb2a_patreon";
    } else {
        var base_path = "modules/JB2A_DnD5e";
    }

    game.settings.registerMenu("ffg-star-wars-enhancements", "attack_animation_UISettings", {
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.ui.name"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.ui.hint"),
        label: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.ui.label"),
        icon: "fas fa-cut",
        type: attack_animation_UISettings,
        restricted: true
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-enable", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.enable"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.enable-hint"),
        scope: "world",
        config: false,
        type: Boolean,
        default: true,
        onChange: (rule) => window.location.reload()
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-brawl-animation", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.brawl-animation"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.brawl-animation-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "video",
        default: base_path + "/Library/Generic/Weapon_Attacks/Melee/LaserSword01_01_Regular_Blue_800x600.webm"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-brawl-sound", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.brawl-sound"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.brawl-sound-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "audio",
        default: "modules/ffg-star-wars-enhancements/audio/brawl.mp3"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-lightsaber-animation", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.lightsaber-animation"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.lightsaber-animation-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "video",
        default: base_path + "/Library/Generic/Weapon_Attacks/Melee/LaserSword01_01_Regular_Blue_800x600.webm"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-lightsaber-sound", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.lightsaber-sound"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.lightsaber-sound-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "audio",
        default: "modules/ffg-star-wars-enhancements/audio/lightsaber.mp3"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-melee-animation", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.melee-animation"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.melee-animation-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "video",
        default: base_path + "/Library/Generic/Weapon_Attacks/Melee/Sword01_01_Regular_White_800x600.webm"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-melee-sound", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.melee-sound"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.melee-sound-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "audio",
        default: "modules/ffg-star-wars-enhancements/audio/melee.mp3"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-gunnery-animation", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.gunnery-animation"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.gunnery-animation-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "video",
        default: base_path + "/Library/Generic/Weapon_Attacks/Ranged/LaserShot_01_Regular_Green_30ft_1600x400.webm"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-gunnery-sound", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.gunnery-sound"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.gunnery-sound-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "audio",
        default: "modules/ffg-star-wars-enhancements/audio/gunnery.mp3"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-ranged-heavy-animation", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.ranged-heavy-animation"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.ranged-heavy-animation-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "video",
        default: base_path + "/Library/Generic/Weapon_Attacks/Ranged/LaserShot_01_Regular_Blue_30ft_1600x400.webm"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-ranged-heavy-sound", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.ranged-heavy-sound"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.ranged-heavy-sound-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "audio",
        default: "modules/ffg-star-wars-enhancements/audio/blaster_heavy.mp3"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-ranged-light-animation", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.ranged-light-animation"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.ranged-light-animation-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "video",
        default: base_path + "/Library/Generic/Weapon_Attacks/Ranged/LaserShot_01_Regular_Red_30ft_1600x400.webm"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-ranged-light-sound", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.ranged-light-sound"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.ranged-light-sound-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "audio",
        default: "modules/ffg-star-wars-enhancements/audio/blaster.mp3"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-grenade-animation", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.grenade-animation"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.grenade-animation-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "video",
        default: base_path + "/Library/Generic/Impact/Impact_07_Regular_Yellow_400x400.webm"
    });
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-grenade-sound", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.grenade-sound"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.grenade-sound-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "audio",
        default: "modules/ffg-star-wars-enhancements/audio/explosion.wav"
    });
    log("attack_animation", "Initialized");
}

export function attack_animation_check() {
    if (game.settings.get("ffg-star-wars-enhancements", "attack-animation-enable")) {
        if (!game.modules.get("JB2A_DnD5e")?.active && !game.modules.get("jb2a_patreon")?.active && game.user.isGM) {
            log(
                "attack_animation",
                "JB2A (free or Patreon) is not loaded. Note that this module configures automatic attack animations, but these are disabled until you load either JB2A module"
            );
            let d = new Dialog({
                title: "FFG Star Wars Enhancements",
                content:
                    "JB2A (free or Patreon) is not loaded.<br>This module supports automatic attack animations, but these are disabled until you load the JB2A (free or paid) module.<br>The animations have been disabled.",
                buttons: {
                    one: {
                        icon: "<i class=\"fas fa-check\"></i>",
                        label: "Ok"
                    }
                },
                close: (html) => game.settings.set("ffg-star-wars-enhancements", "attack-animation-enable", false)
            });
            d.render(true);
            log("attack_animation", "Feature disabled - required modules are not loaded");
        }
    }
}

export function attack_animation(...args) {
    // take our custom arg out of the array so we don't return it
    let that = args[0];
    args = args.splice(1);

    if (!game.settings.get("ffg-star-wars-enhancements", "attack-animation-enable")) {
        return args;
    }
    var error = false;
    /* check for the required modules */
    if (!game.modules.get("fxmaster")?.active && game.user.isGM) {
        log("attack_animation", "fxmaster was not loaded. Not attempting attack animation");
        ui.notifications.error(
            "FFG Star Wars Enhancements attack animations requires the 'FXMaster' module. Please install and activate it."
        );
        error = true;
    }
    if (!game.modules.get("JB2A_DnD5e")?.active && !game.modules.get("jb2a_patreon")?.active && game.user.isGM) {
        log("attack_animation", "JB2A was not loaded. Not attempting attack animation");
        ui.notifications.error(
            "FFG Star Wars Enhancements attack animations requires the 'jb2a' module. Please install and activate it."
        );
        error = true;
    }
    if (error) {
        return args;
    }
    if (!args[0].hasOwnProperty("flavor")) {
        log("attack_animation", "Found roll without required metadata, bailing");
        return args;
    }

    log("attack_animation", "Detected FFG dice roll, checking to see if this is a combat skill");
    let skill = args[0]["flavor"]
        .replace(game.i18n.localize("SWFFG.Rolling") + " ", "")
        .replace("...", "")
        .replace(" ", " ");

    let combat_skills = {};
    /* melee animations */
    // brawl
    combat_skills[game.i18n.localize("SWFFG.SkillsNameBrawl")] = {
        animation_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-brawl-animation"),
        sound_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-brawl-sound")
    };
    // lightsaber
    combat_skills[game.i18n.localize("SWFFG.SkillsNameLightsaber")] = {
        animation_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-lightsaber-animation"),
        sound_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-lightsaber-sound")
    };
    // melee
    combat_skills[game.i18n.localize("SWFFG.SkillsNameMelee")] = {
        animation_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-melee-animation"),
        sound_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-melee-sound")
    };
    /* ranged animations */
    // gunnery
    combat_skills[game.i18n.localize("SWFFG.SkillsNameGunnery")] = {
        animation_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-gunnery-animation"),
        sound_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-gunnery-sound")
    };
    // ranged heavy
    combat_skills[game.i18n.localize("SWFFG.SkillsNameRangedHeavy").replace(" ", " ")] = {
        animation_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-ranged-heavy-animation"),
        sound_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-ranged-heavy-sound")
    };
    // ranged light
    combat_skills[game.i18n.localize("SWFFG.SkillsNameRangedLight").replace(" ", " ")] = {
        animation_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-ranged-light-animation"),
        sound_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-ranged-light-sound")
    };
    // grenade
    combat_skills["grenade"] = {
        animation_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-grenade-animation"),
        sound_file: game.settings.get("ffg-star-wars-enhancements", "attack-animation-grenade-sound")
    };

    if (skill in combat_skills) {
        log("attack_animation", "Determined that \"" + skill + "\" is a combat skill");
        /* check if things are configured for us to continue */
        if (game.user.targets.size === 0) {
            ui.notifications.warn("You must target at least one token as a target or disable attack animations");
            log("attack_animation", "Aborted attack animation because there were no targets selected");
            return args;
        }

        if (canvas.tokens.controlled.length === 0) {
            /* no tokens are selected, attempt to see if any of the tokens on the scene are owned by the user */
            var source = [];
            for (var x = 0; x < canvas.tokens.placeables.length; x++) {
                if (canvas.tokens.placeables[x].isOwner) {
                    source.push(canvas.tokens.placeables[x]);
                }
            }
            if (source.length !== 1) {
                /* we failed to find exactly 1 token owned by the current user, bail */
                ui.notifications.warn("Please select the attacker or disable attack animations");
                log("attack_animation", "Aborted attack animation because no source targets were selected");
                return args;
            }
        } else {
            var source = canvas.tokens.controlled;
        }

        let actor_id = undefined;
        if (args[0]["speaker"]["actor"] === undefined) {
            // on foundry v9 the actor data is undefined when using the crew setting
            // convert the token to the actor ID of the ship
            actor_id = canvas.tokens.placeables.filter((token) => token.id === args[0]["speaker"]["token"])[0].actor.id;
        } else {
            actor_id = args[0]["speaker"]["actor"]["_id"];
        }

        if (that["data"] === null || jQuery.isEmptyObject(that["data"])) {
            // this was a roll from a skill
            var flag_data = null;
            var item_name = null;
        } else {
            // this was a roll from an item
            let item_id = that["data"]["_id"];
            var item_name = that["data"]["name"];
            let the_item = game.actors.get(actor_id).items.get(item_id);
            if (the_item !== null && the_item !== undefined) {
                var flag_data = the_item.getFlag("ffg-star-wars-enhancements", "attack-animation");
            } else {
                // no custom data was set
                var flag_data = null;
            }
        }

        var count = null;
        /* check to see if there is custom stuff set for this item */
        if (flag_data === undefined || flag_data === null) {
            log("attack_animation", "Got animation from config");
            // check if the item is a grenade and override the skill if it is
            if (item_name && item_name.toLowerCase().includes("grenade")) {
                // the item was a grenade, we've got to change some stuff around
                log("attack_animation", "Item being rolled is a grenade, swapping animation to \"grenade\"");
                // noinspection JSDuplicatedDeclaration
                var animation_file = combat_skills["grenade"]["animation_file"];
                // noinspection JSDuplicatedDeclaration
                var sound_file = combat_skills["grenade"]["sound_file"];
                skill = "grenade";
            } else {
                // noinspection JSDuplicatedDeclaration
                var animation_file = combat_skills[skill]["animation_file"];
                // noinspection JSDuplicatedDeclaration
                var sound_file = combat_skills[skill]["sound_file"];
            }
        } else {
            log("attack_animation", "Got animation from flag data");
            // noinspection JSDuplicatedDeclaration
            var animation_file = flag_data["animation_file"];
            // noinspection JSDuplicatedDeclaration
            var sound_file = flag_data["sound_file"];
            if (flag_data.hasOwnProperty("animation_count")) {
                count = flag_data["animation_count"];
            }
        }

        // todo: based on dice results, we could have the animation miss
        log("attack_animation", "Playing the attack animation: " + animation_file + " / " + sound_file);
        // noinspection JSIgnoredPromiseFromCall
        play_animation(animation_file, sound_file, skill, source, count);
        return args;
    } else {
        // not a combat skill; ignore it
        return args;
    }
}

const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function play_animation(animation_file, sound_file, skill, source, count) {
    const tokens = source;
    var arrayLength = game.user.targets.size;
    for (var i = 0; i < arrayLength; i++) {
        if (count !== null) {
            var range = count.split("-");
            if (range.length > 1) {
                var lower_bound = parseInt(range[0]);
                var num_shots = parseInt(range[1]);
            } else {
                var lower_bound = 2;
                var num_shots = parseInt(count);
            }
        } else if (["Melee", "Brawl", "Lightsaber"].indexOf(skill) > -1) {
            // noinspection JSDuplicatedDeclaration
            var lower_bound = 1;
            var num_shots = 1;
        } else {
            var lower_bound = 1;
            // noinspection JSDuplicatedDeclaration
            var num_shots = Math.floor(Math.random() * 6 + 1);
        }
        for (var x = lower_bound - 1; x < num_shots; x++) {
            if (skill === "grenade") {
                var animation_config = {
                    position: Array.from(game.user.targets)[i].center,
                    file: animation_file,
                    anchor: {
                        x: 0.5,
                        y: 0.5
                    },
                    angle: -90
                };
            } else if (skill.toLowerCase().includes("ranged")) {
                var ray = new Ray(tokens[0].center, Array.from(game.user.targets)[i].center);
                var animation_config = {
                    position: tokens[0].center,
                    file: animation_file,
                    anchor: {
                        x: 0.125, //default = 0.125
                        y: 0.5 //default is 0.5
                    },
                    angle: -(ray.angle * 57.3),
                    scale: {
                        x: ray.distance / 1200, //default is ray.distance / 1200
                        y: ray.distance / 1200 <= 200 ? 0.66 : ray.distance / 1200 //default is ray.distance <= 200 ? 0.66 : ray.distance / 1200
                    }
                };
            } else {
                var ray = new Ray(tokens[0].center, Array.from(game.user.targets)[i].center);
                var animation_config = {
                    position: tokens[0].center,
                    file: animation_file,
                    anchor: {
                        x: 0.4, //default = 0.125
                        y: 0.5 //default is 0.5
                    },
                    angle: -(ray.angle * 57.3),
                    scale: {
                        x: ray.distance / 1200 <= 200 ? 0.66 : ray.distance / 1200, //default is ray.distance / 1200
                        y: ray.distance / 1200 <= 200 ? 0.66 : ray.distance / 1200 //default is ray.distance <= 200 ? 0.66 : ray.distance / 1200
                    }
                };
            }
            canvas.specials.playVideo(animation_config);
            game.socket.emit("module.fxmaster", animation_config);

            AudioHelper.play({ src: sound_file, volume: 0.3, autoplay: true, loop: false }, true);
            await sleepNow(250);
        }
    }
    await sleepNow(500);
}

// noinspection DuplicatedCode
class attack_animation_UISettings extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "data-importer",
            classes: ["starwarsffg", "data-import"],
            title: `${game.i18n.localize("SWFFG.UISettingsLabel")}`,
            template: "modules/ffg-star-wars-enhancements/templates/settings.html"
        });
    }

    // noinspection JSDeprecatedSymbols
    getData(options) {
        const gs = game.settings;
        const canConfigure = game.user.can("SETTINGS_MODIFY");

        const data = {
            system: { title: game.system.title, menus: [], settings: [] }
        };

        // Classify all settings
        // noinspection JSUnusedLocalSymbols
        for (let setting of gs.settings.values()) {
            // Exclude settings the user cannot change
            if (!setting.key.includes("attack-animation-") || (!canConfigure && setting.scope !== "client")) continue;

            // Update setting data
            const s = duplicate(setting);
            s.name = game.i18n.localize(s.name);
            s.hint = game.i18n.localize(s.hint);
            s.value = game.settings.get(s.module, s.key);
            s.type = setting.type instanceof Function ? setting.type.name : "String";
            s.isCheckbox = setting.type === Boolean;
            s.isSelect = s.choices !== undefined;
            s.isRange = setting.type === Number && s.range;
            s.isFilePicker = setting.valueType === "FilePicker";

            // Classify setting
            const name = s.module;
            if (s.key.includes("attack-animation-")) data.system.settings.push(s);
        }

        // Return data
        return {
            user: game.user,
            canConfigure: canConfigure,
            systemTitle: game.system.title,
            data: data
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".submenu button").click(this._onClickSubmenu.bind(this));
        html.find("button[name=\"reset\"]").click(this._onResetDefaults.bind(this));
        html.find("button.filepicker").click(this._onFilePicker.bind(this));
    }

    /**
     * Handle activating the button to configure User Role permissions
     * @param event {Event}   The initial button click event
     * @private
     */
    _onClickSubmenu(event) {
        event.preventDefault();
        const menu = game.settings.menus.get(event.currentTarget.dataset.key);
        if (!menu) return ui.notifications.error("No submenu found for the provided key");
        const app = new menu.type();
        return app.render(true);
    }

    /* -------------------------------------------- */

    /**
     * Handle button click to reset default settings
     * @param event {Event}   The initial button click event
     * @private
     */
    _onResetDefaults(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const form = button.form;
        for (let [k, v] of game.settings.settings.entries()) {
            if (!v.config) {
                let input = form[k];
                if (input && input.type === "checkbox") {
                    input.checked = v.default;
                } else if (input) {
                    input.value = v.default;
                }
            }
        }
    }

    /* -------------------------------------------- */

    _onFilePicker(event) {
        event.preventDefault();

        const fp = new FilePicker({
            type: "image",
            callback: (path) => {
                $(event.currentTarget).prev().val(path);
                //this._onSubmit(event);
            },
            top: this.position.top + 40,
            left: this.position.left + 10
        });
        return fp.browse();
    }

    /* -------------------------------------------- */

    // noinspection JSUnusedGlobalSymbols
    /** @override */
    async _updateObject(event, formData) {
        for (let [k, v] of Object.entries(flattenObject(formData))) {
            let s = game.settings.settings.get(k);
            let current = game.settings.get(s.module, s.key);
            if (v !== current) {
                await game.settings.set(s.module, s.key, v);
            }
        }
    }
}

class ConfigureAttackAnimation extends FormApplication {
    constructor() {
        super();
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/ffg-star-wars-enhancements/templates/configure_attack_animations.html",
            id: "ffg-star-wars-enhancements-attack-animation-configure",
            title: "Attack Animation"
        });
    }

    activateListeners(html) {
        // for whatever reason, the old wrap does not work, so instead we'll override the listener
        super.activateListeners(html);
        html.find("button[name=\"create\"]").click(this._saveChanges.bind(this));
    }

    async _saveChanges(event) {
        event.preventDefault();
        await this._updateObject(event, this._extractFormData(event));
    }

    _extractFormData(event) {
        return {
            actor: event.target.parentElement[0].value,
            item: event.target.parentElement[1].value,
            animation_file: event.target.parentElement[2].value,
            animation_count: event.target.parentElement[4].value,
            sound_file: event.target.parentElement[5].value
        };
    }

    async getData() {
        // list of actors in the game
        let tmp_actors = game.actors.contents;
        // list of actors to pass to the formapplication
        let actors = [];
        /* step over all actors in the game */
        for (var x = 0; x < tmp_actors.length; x++) {
            // pull items for the actor
            var items = tmp_actors[x].items.contents;
            // list of items to pass to the form application
            let tmp_items = [];
            /* step over all items so we can check if custom data is already set or not */
            for (var i = 0; i < items.length; i++) {
                // convert the item to an Item type object so we can read flag data off of it
                let the_item = tmp_actors[x].items.get(items[i]._id);
                // validate it's a weapon, since you can only roll attacks with weapons
                if (the_item.type === "weapon") {
                    // read the flag data if it's present
                    let flag = the_item.getFlag("ffg-star-wars-enhancements", "attack-animation");
                    if (flag === undefined || flag === null) {
                        // set a default if it isn't
                        var animation = game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.global");
                        var sound = game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.global");
                        var count = game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.global");
                    } else {
                        // display the currently configured data if it exists
                        var animation = flag["animation_file"];
                        var sound = flag["sound_file"];
                        if (flag.hasOwnProperty("animation_count")) {
                            var count = flag["animation_count"];
                        } else {
                            var count = game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.global");
                        }
                    }
                    // add to the list of items for the formapplication
                    tmp_items.push({
                        id: items[i]._id,
                        name: items[i].name,
                        animation: animation,
                        sound: sound,
                        count: count
                    });
                }
            }
            /* only add the actor if they have items to help reduce the number of items to search through */
            if (tmp_items.length > 0) {
                let actor_name = tmp_actors[x]["name"];
                if (tmp_actors[x].hasPlayerOwner === true) {
                    // help the GM find players by adding a note
                    actor_name += " (PC)";
                }
                actors.push({
                    id: tmp_actors[x]["id"],
                    name: actor_name,
                    items: tmp_items
                });
            }
        }
        return {
            actors: actors
        };
    }

    async _updateObject(event, data) {
        // todo: allow overwriting one part without overwriting both
        log("attack_animation", "Got animation change request " + JSON.stringify(data));
        let global_value = game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.global");
        if (data["animation_file"] === global_value || data["sound_file"] === global_value) {
            log("attack_animation", "Removing attack flag");
            // remove the flag data so we can use the default value
            ui.notifications.notify(
                game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.notification-unset")
            );
            game.actors
                .get(data["actor"])
                .items.get(data["item"])
                .setFlag("ffg-star-wars-enhancements", "attack-animation", null);
            return;
        }
        log("attack_animation", "Setting attack flag");
        let flag_data = {
            sound_file: data["sound_file"],
            animation_file: data["animation_file"],
            animation_count: data["animation_count"]
        };
        game.actors
            .get(data["actor"])
            .items.get(data["item"])
            .setFlag("ffg-star-wars-enhancements", "attack-animation", flag_data);
        ui.notifications.notify(
            game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.notification-success")
        );
    }
}

export async function configure_attack_animation() {
    new ConfigureAttackAnimation().render(true);
}
