import { log_msg as log } from './util.js'
import { update_status } from './talent_checker.js'

let module_name = 'stim_sync';

export function init() {
    log(module_name, 'Initializing');
    game.settings.registerMenu("ffg-star-wars-enhancements", "stimpack-sync_UISettings", {
        name: game.i18n.localize('ffg-star-wars-enhancements.stimpack-sync.ui.name'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.stimpack-sync.ui.hint'),
        label: game.i18n.localize('ffg-star-wars-enhancements.stimpack-sync.ui.label'),
        icon: "fas fa-cut",
        type: stimpack_sync_UISettings,
        restricted: true,
    });
    game.settings.register("ffg-star-wars-enhancements", "stimpack-sync-enable", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize('ffg-star-wars-enhancements.stimpack-sync-enable'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.stimpack-sync-enable-hint'),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: (rule) => window.location.reload(),
    });
    game.settings.register("ffg-star-wars-enhancements", "stimpack-sync-status", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize('ffg-star-wars-enhancements.stimpack-sync-status'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.stimpack-sync-status-hint'),
        scope: "world",
        config: true,
        type: String,
        filePicker: 'image',
        default: "icons/consumables/potions/vial-cork-red.webp"
    });
    log(module_name, 'Initialized');
}

export function stim_sync(source, ...args) {
    // check if the user is a GM and that the setting is enabled
    if (game.user.isGM && game.settings.get("ffg-star-wars-enhancements", "stimpack-sync-enable")) {
        try {
            // pull the path of the status to apply
            let status = game.settings.get("ffg-star-wars-enhancements", "stimpack-sync-status");
            /*
                We can't modify tokens that aren't currently rendered, so we hook the update actor AND scene load calls
                (and handle each a different way)
             */
            if (source === 'token') {
                let our_args = args[1]; // medical use info
                if (our_args && our_args.hasOwnProperty('data') && our_args['data'].hasOwnProperty('stats') && our_args['data']['stats'].hasOwnProperty('medical')) {
                    // this is a stimpack update
                    log(module_name, "caught stimpack usage, new count: " + our_args['data']['stats']['medical']['uses']);

                    // look up relevant info
                    let actor_id = args[1]['_id'];
                    let stimpack_usage = our_args['data']['stats']['medical']['uses'];
                    let tokens = canvas.tokens.placeables.filter(token => token.data.actorId === actor_id);

                    // update the tokens
                    for (var x = 0; x < tokens.length; x++) {
                        update_status(
                            tokens[x],
                            stimpack_usage,
                            status,
                        );
                    }
                }
            } else if (source === 'scene') {
                log(module_name, "caught scene-transition, looking for tokens");
                let tokens = canvas.tokens.placeables.filter(token => token);
                for (var x = 0; x < tokens.length; x++) {
                    let token = tokens[x];
                    let actor = game.actors.get(token.data.actorId);
                    let stimpack_usage = actor?.data?.data?.stats?.medical?.uses;
                    if (stimpack_usage !== undefined) {
                        log(module_name, "found token for " + actor.name + " with " + stimpack_usage + " stimpack uses");

                        // update the tokens
                        update_status(
                            token,
                            stimpack_usage,
                            status,
                        );
                    }
                }
            }
        } catch (exception) {
            // something went wrong, bail (silently)
            log(module_name, 'Failed to sync stimpack usage: ' + exception);
        }
    }
}

class stimpack_sync_UISettings extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "data-importer",
            classes: ["starwarsffg", "data-import"],
            title: `${game.i18n.localize("SWFFG.UISettingsLabel")}`,
            template: "modules/ffg-star-wars-enhancements/templates/settings.html",
        });
    }

    // noinspection JSDeprecatedSymbols
    getData(options) {
        const gs = game.settings;
        const canConfigure = game.user.can("SETTINGS_MODIFY");

        const data = {
            system: {title: game.system.data.title, menus: [], settings: []},
        };

        // Classify all settings
        // noinspection JSUnusedLocalSymbols
        for (let setting of gs.settings.values()) {
            // Exclude settings the user cannot change
            if (!setting.key.includes("stimpack-sync-") || (!canConfigure && setting.scope !== "client")) continue;

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
            if (s.key.includes("stimpack-sync-")) data.system.settings.push(s);
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
