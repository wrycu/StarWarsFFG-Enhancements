import { log_msg as log } from './util.js'
import { setting_image } from './settings.js'

let module_name = 'talent_checker';

export function init () {
    log(module_name, 'Initializing');
    game.settings.registerMenu("ffg-star-wars-enhancements", "talent_checker_UISettings", {
        name: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.conf'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.conf-hint'),
        label: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.ui.label'),
        icon: "fas fa-cut",
        type: talent_checker_UISettings,
        restricted: true,
    });
    game.settings.register("ffg-star-wars-enhancements", "talent-checker-enable", {
        name: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.enable'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.enable-hint'),
        scope: "world",
        config: false,
        type: Boolean,
        default: true,
    });
    game.settings.register("ffg-star-wars-enhancements", "talent-checker-status", {
        name: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.status'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.status-hint'),
        scope: "world",
        config: false,
        type: setting_image,
        default: 'icons/svg/regen.svg',
    });
    game.settings.register("ffg-star-wars-enhancements", "minion-size-enable", {
        name: game.i18n.localize('ffg-star-wars-enhancements.minion-size.enable'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.minion-size.enable-hint'),
        scope: "world",
        config: false,
        type: Boolean,
        default: true,
    });
    game.settings.register("ffg-star-wars-enhancements", "minion-size-status", {
        name: game.i18n.localize('ffg-star-wars-enhancements.minion-size.status'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.minion-size.status-hint'),
        scope: "world",
        config: false,
        type: setting_image,
        default: 'icons/environment/people/infantry-army.webp',
    });
    log(module_name, 'Done initializing');
}

export function talent_checker() {
    Hooks.on("canvasReady", (canvas) => {
        if (game.user.isGM) {
            log(module_name, 'Detected scene load');
            for (let i=0; i < canvas.tokens.placeables.length; i++) {
                // begin javascript sucks
                let actor = game.actors.get(canvas.tokens.placeables[i].actor.id);
                let token = canvas.tokens.placeables[i];
                // end javascript sucks
                if (game.settings.get("ffg-star-wars-enhancements", "talent-checker-enable")) {
                    // do the adversary stuff
                    log(module_name, 'Found token ' + actor.name + '; searching for Adversary talent');
                    let ranks = get_ranks(actor);
                    update_status(token, ranks, game.settings.get("ffg-star-wars-enhancements", "talent-checker-status"));
                }
                if (game.settings.get("ffg-star-wars-enhancements", "minion-size-enable")) {
                    // do the minion group size stuff
                    log(module_name, 'Found token ' + actor.name + '; searching for minion group size');
                    let minion_count = get_group_size(actor);
                    if (minion_count !== null) {
                        log(module_name, 'Minion group ' + actor.data.name + ' is of size ' + minion_count);
                        update_status(token, minion_count, game.settings.get("ffg-star-wars-enhancements", "minion-size-status"));
                    }
                }
            }
        }
    });

    Hooks.on("createToken", (scene, inc_token, ...args) => {
        if (game.user.isGM) {
            let token_id = inc_token._id;
            let actor_data = token_to_actor(token_id);
            let actor = actor_data[0];
            let token = actor_data[1];
            if (game.settings.get("ffg-star-wars-enhancements", "talent-checker-enable")) {
                let ranks = get_ranks(actor);
                update_status(token, ranks, game.settings.get("ffg-star-wars-enhancements", "talent-checker-status"));
            }
            if (game.settings.get("ffg-star-wars-enhancements", "minion-size-enable")) {
                let minion_count = get_group_size(actor);
                if (minion_count !== null) {
                    log(module_name, 'Minion group ' + actor.data.name + ' is of size ' + minion_count);
                    update_status(token, minion_count, game.settings.get("ffg-star-wars-enhancements", "minion-size-status"));
                }
            }
        }
    });
}

/**
 * Looks up the minion group max size
 * @param {actor} an FFG Actor to check the max size of
 * @returns {integer|null} the max group size
 */
function get_group_size(actor) {
    if (actor.data.type === 'minion') {
        log(module_name, 'Found minion group being added: ' + actor.data.name);
        return actor.data.data.quantity.max;
    } else {
        log(module_name, 'Found non-minion group being added: ' + actor.data.name);
        return null;
    }
}

/**
 * Given a token ID, looks up the associated actor and token objects
 * @param {token_id} ID of a token to lookup
 * @returns [actor, token]
 */
function token_to_actor(token_id) {
    let token = canvas.tokens.placeables.filter(token => token.id === token_id)[0];
    let actor = game.actors.get(token.actor.id);
    return [actor, token];
}

/**
 * Given an actor, return the ranks in Adversary that that actor has
 * @param {actor} FFG Actor
 * @returns {ranks} number of ranks
 */
function get_ranks(actor) {
    let talents = actor.data.items.filter(item => item.type === 'talent' && item.name === 'Adversary');
    let ranks = 0;
    for (let x=0; x < talents.length; x++) {
        ranks += talents[x].data.ranks.current;
    }
    log(module_name, 'Found ' + ranks + ' ranks of Adversary');
    return ranks;
}

/**
 * Apply a status the given token
 * @param {token, ranks, icon_path} Token to apply the icon to, # to show for it, and path to the icon
 * @returns {null}
 */
function update_status(token, ranks, icon_path) {
    if (ranks === 0) { return;}
    if (!window.EffectCounter) {
        // the user doesn't have status icon counters installed, don't give a count
        log(module_name, 'Adding non-ranked status to token');
        token.effects.push(icon_path);
    } else {
        log(module_name, 'Adding status rank ' + ranks + ' to token');
        // create the effect counter
        let new_counter = new EffectCounter(ranks, icon_path, token);
        // render it
        new_counter.update();
    }
}

class talent_checker_UISettings extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "talent-checker",
            classes: ["starwarsffg", "data-import"],
            title: `${game.i18n.localize("ffg-star-wars-enhancements.talent-checker.title")}`,
            template: "modules/ffg-star-wars-enhancements/templates/settings_attack_animations.html",
        });
    }

    getData(options) {
        const gs = game.settings;
        const canConfigure = game.user.can("SETTINGS_MODIFY");

        const data = {
            system: {title: game.system.data.title, menus: [], settings: []},
        };

        // Classify all settings
        for (let setting of gs.settings.values()) {
            // Exclude settings the user cannot change
             if ((!setting.config && !setting.key.includes("talent-checker-") && !setting.key.includes("minion-size-")) || (!canConfigure && setting.scope !== "client")) continue;

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
            if (s.key.includes("talent-checker-") || s.key.includes("minion-size-")) data.system.settings.push(s);
        }

        // Return data
        return {
            user: game.user,
            canConfigure: canConfigure,
            systemTitle: game.system.data.title,
            data: data,
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".submenu button").click(this._onClickSubmenu.bind(this));
        html.find('button[name="reset"]').click(this._onResetDefaults.bind(this));
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
                }
                else if (input) {
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
            left: this.position.left + 10,
        });
        return fp.browse();
    }

    /* -------------------------------------------- */

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
