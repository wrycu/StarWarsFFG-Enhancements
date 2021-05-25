import { log_msg as log } from './util.js'
import { setting_image } from './settings.js'

let module_name = 'talent_checker';

export function init () {
    log(module_name, 'Initializing');
    game.settings.registerMenu("ffg-star-wars-enhancements", "talent_checker_UISettings", {
        name: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.conf'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.talent-checker.conf-hint'),
        label: "Open configuration",
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
    log(module_name, 'Done initializing');
}

export function talent_checker() {
    Hooks.on("canvasReady", (canvas) => {
        if (game.user.isGM && game.settings.get("ffg-star-wars-enhancements", "talent-checker-enable")) {
            log(module_name, 'Detected scene load; searching for actors with the Adversary talent');
            for (let i=0; i < canvas.tokens.placeables.length; i++) {
                let token = canvas.tokens.placeables[i];
                log(module_name, 'Found token ' + token.data.name + '; searching for Adversary talent');
                let adversary_count = 0;
                for (let x=0; x < token.actor.data.items.length; x++) {
                    let item = token.actor.data.items[x];
                    if (item.type === 'talent' && item.name === 'Adversary') {
                        log(module_name, 'Found Adversary ' + item.data.ranks.current + ' on ' + token.data.name + '! Adding status');
                        adversary_count+= 1;
                        if (!window.EffectCounter) {
                            // the user doesn't have status icon counters installed; they don't get a count
                            canvas.tokens.placeables[i].toggleEffect(game.settings.get("ffg-star-wars-enhancements", "talent-checker-status"), {'active': true});
                        } else {
                            let icon_path = game.settings.get("ffg-star-wars-enhancements", "talent-checker-status");
                            // create the effect counter
                            let new_counter = new EffectCounter(item.data.ranks.current, icon_path, canvas.tokens.placeables[i]);
                            // render it
                            new_counter.update();
                        }
                    }
                }
            }
        }
    });

    Hooks.on("createToken", (scene, token, ...args) => {
        if (game.user.isGM && game.settings.get("ffg-star-wars-enhancements", "talent-checker-enable")) {
            log(module_name, 'Detected token creation; looking for actor data');
            let token_id = token._id;
            for (let i=0; i < scene.data.tokens.length; i++) {
                if (scene.data.tokens[i]._id === token_id) {
                    let actor = game.actors.get(scene.data.tokens[i].actorId);
                    log(module_name, 'Found actor ' + actor.name + '; looking for talent');
                    for (let i=0; i < actor.data.items.length; i++) {
                        let item = actor.data.items[i];
                        if (item.type === 'talent' && item.name === 'Adversary') {
                            log(module_name, actor.name + ' has talent Adversary ' + item.data.ranks.current + '; adding status');
                            if (!window.EffectCounter) {
                                // the user doesn't have status icon counters installed; they don't get a count
                                token.id = token_id;
                                token.effects.push(game.settings.get("ffg-star-wars-enhancements", "talent-checker-status"));
                            } else {
                                let icon_path = game.settings.get("ffg-star-wars-enhancements", "talent-checker-status");
                                // convert the JSON blob into a Token object
                                let the_token = new Token(token);
                                // create the effect counter
                                let new_counter = new EffectCounter(item.data.ranks.current, icon_path, the_token);
                                // render it
                                new_counter.update();
                            }
                        }
                    }
                }
            }
        }
    });
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
            if ((!setting.config && !setting.key.includes("talent-checker-")) || (!canConfigure && setting.scope !== "client")) continue;

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
            if (s.key.includes("talent-checker-")) data.system.settings.push(s);
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
