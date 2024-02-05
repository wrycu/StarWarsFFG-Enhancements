import { log_msg as log } from "./util.js";



export function title_cards_dialog() {
    new Dialog({
        title: game.i18n.localize("ffg-star-wars-enhancements.controls.title-cards.title"),
        content:`
          <form>
            <div class="form-group">
            <p>
              <label>${game.i18n.localize("ffg-star-wars-enhancements.controls.title-cards.toptext-label")}</label>
              <input type='text' name='toptext'></input>
              </p>
              <p>
              <label>${game.i18n.localize("ffg-star-wars-enhancements.controls.title-cards.bottomtext-label")}</label>
              <input type='text' name='bottomtext'></input>
              </p>
            </div>
          </form>`,
        buttons:{
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: `Launch Title Cards`
            }},
        default:'yes',
        close: html => {
            let data = {
                toptext: html.find('input[name=\'toptext\']').val(),
                bottomtext: html.find('input[name=\'bottomtext\']').val()
            }
          launch_title_cards(data);
          }
      }).render(true);
}


/**
 * Launch the title cards.
 * @param {object} data
 */
export function launch_title_cards(data) {
    log("title-cards", "launching");

    data = mergeObject(data, {
        type: "title-cards",
        logo: game.settings.get("ffg-star-wars-enhancements", "title-cards-logo"),
        music: game.settings.get("ffg-star-wars-enhancements", "title-cards-music"),
    });
    game.socket.emit("module.ffg-star-wars-enhancements", data);
    socket_listener(data);
    log("title-cards", "event emmitted");
}


/**
 * Register settings used by title cards
 */
export function init() {
    log("title-cards", "Initializing");
    game.settings.registerMenu("ffg-star-wars-enhancements", "title-cards_UISettings", {
        name: game.i18n.localize("ffg-star-wars-enhancements.title-cards.ui.name"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.title-cards.ui.hint"),
        label: game.i18n.localize("ffg-star-wars-enhancements.title-cards.ui.label"),
        icon: "fas fa-cut",
        type: title_cards_UISettings,
        restricted: true,
    });
    game.settings.register("ffg-star-wars-enhancements", "title-cards-logo", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-logo"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-logo-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "folder",
        default: "",
    });
    game.settings.register("ffg-star-wars-enhancements", "title-cards-music", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-music"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-music-hint"),
        scope: "world",
        config: false,
        type: String,
        filePicker: "audio",
        default: "",
    });
    game.settings.register("ffg-star-wars-enhancements", "title-cards-music-delay", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-music-delay"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-music-delay-hint"),
        scope: "world",
        config: false,
        type: Number,
        default: 0.0,
    });
    game.settings.register("ffg-star-wars-enhancements", "title-cards-top-font-size", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-top-font-size"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-top-font-size-hint"),
        scope: "world",
        config: false,
        type: Number,
        default: 150,
    });
    game.settings.register("ffg-star-wars-enhancements", "title-cards-bottom-font-size", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-bottom-font-size"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-bottom-font-size-hint"),
        scope: "world",
        config: false,
        type: Number,
        default: 50,
    });
    game.settings.register("ffg-star-wars-enhancements", "title-cards-logo-delay", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-logo-delay"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-logo-delay-hint"),
        scope: "world",
        config: false,
        type: Number,
        default: 5.7,
    });
    game.settings.register("ffg-star-wars-enhancements", "title-cards-logo-duration", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-logo-duration"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-logo-duration-hint"),
        scope: "world",
        config: false,
        type: Number,
        default: 4.5,
    });
    game.settings.register("ffg-star-wars-enhancements", "title-cards-text-delay", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-text-delay"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-text-delay-hint"),
        scope: "world",
        config: false,
        type: Number,
        default: 10.7,
    });
    game.settings.register("ffg-star-wars-enhancements", "title-cards-text-duration", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-text-duration"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-text-duration-hint"),
        scope: "world",
        config: false,
        type: Number,
        default: 5,
    });
    game.settings.register("ffg-star-wars-enhancements", "title-cards-close-delay", {
        module: "ffg-star-wars-enhancements",
        name: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-close-delay"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.title-cards.title-cards-close-delay-hint"),
        scope: "world",
        config: false,
        type: Number,
        default: 1,
    });
    log("title-cards", "Initialized");
}

function get_total_duration() {
    return (
        game.settings.get("ffg-star-wars-enhancements", "title-cards-text-delay") +
        game.settings.get("ffg-star-wars-enhancements", "title-cards-text-duration") +
        game.settings.get("ffg-star-wars-enhancements", "title-cards-close-delay")
    );
}

/**
 * Ready handler that listens on the ffg-star-wars-enhancements socket.
 */
export function ready() {
    log("title-cards", "ready");
    game.socket.on("module.ffg-star-wars-enhancements", socket_listener);
}

/**
 * Listener for the ffg-star-wars-enhancements socket that launches the
 * TitleCardsApplication if the message type is "title-cards"
 *
 * @param {object} data object passed to TitleCardsApplication
 */
async function socket_listener(data) {
    log("socket", data);
    if (data.type == "title-cards") {
        let titles = new TitleCardsApplication(data).render(true);
        if (game.settings.get("ffg-star-wars-enhancements", "title-cards-close-delay") != 0) {
            await sleep(get_total_duration() * 1000);
            titles.close();
        }
    }
}


/**
 * Helper function to delay code execution by an arbitrary amount
 * @param ms - number of MS to delay by
 * @returns {Promise<unknown>}
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Application that displays the Opening Crawl.
 */
class TitleCardsApplication extends Application {
    /**
     * @param {object} data object to provide the opening crawl template
     * @param {object} options additional options for the application
     */
    constructor(data, options) {
        super({}, options);
        this.data = data;
    }

    /**
     * Configure a "full" screen with minimal controls that will display the
     * Opening Crawl.
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/ffg-star-wars-enhancements/templates/title_cards.html",
            id: "ffg-star-wars-enhancements-title-cards",
            title: game.i18n.localize("ffg-star-wars-enhancements.controls.title-cards.title"),
            minimizable: false,
            editable: false,
            resizable: true,
            popOut: true,
            shareable: false,
            top: 0,
            left: 0,
            width: 4096,
            height: 2160,
        });
    }

    /**
     * Provide the data object for the template.
     * @returns object provided to the constructor
     */
    getData() {
        let data = this.data;
        data.topSize = game.settings.get("ffg-star-wars-enhancements", "title-cards-top-font-size");
        data.bottomSize = game.settings.get("ffg-star-wars-enhancements", "title-cards-bottom-font-size");
        data.logoDelay = game.settings.get("ffg-star-wars-enhancements", "title-cards-logo-delay");
        data.logoDuration = game.settings.get("ffg-star-wars-enhancements", "title-cards-logo-duration");
        data.textDelay = game.settings.get("ffg-star-wars-enhancements", "title-cards-text-delay");
        data.textDuration = game.settings.get("ffg-star-wars-enhancements", "title-cards-text-duration");
        return data;
    }

    /**
     * Play this.data.music using the Playlist volume.
     * @param {function} callback callback to execute once playback has started
     */
    async play_music(callback) {
        let volume = game.settings.get("core", "globalPlaylistVolume");
        let audio_helper = game.audio;
        const that = this;

        audio_helper.preload(this.data.music).then(async (sound) => {
            callback();
            await sleep(game.settings.get("ffg-star-wars-enhancements", "title-cards-music-delay"));
            sound.play({
                volume: volume,
            });
            that.sound = sound;
        });
    }

    /**
     * Listener that times the audio playing the audio with the opening crawl.
     * @param {jQuery} html
     */
    activateListeners(html) {
        log("opening-crawl", "active listeners");
        super.activateListeners(html);

        // When music is configured, hide the HTML until the audio loaded is
        // loaded. Once it's loaded, redisplay the HTML to retrigger the
        // animation.
        if (this.data.music) {
            function start_animation() {
                html[0].style.display = "block";
            }

            html[0].style.display = "none";

            this.play_music(start_animation);
        }
    }

    close() {
        if (this.sound) {
            this.sound.stop();
            this.sound = null;
        }
        return super.close();
    }
}

// noinspection DuplicatedCode
class title_cards_UISettings extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "data-importer",
            classes: ["starwarsffg", "data-import"],
            title: `${game.i18n.localize("ffg-star-wars-enhancements.title-cards.ui.name")}`,
            template: "modules/ffg-star-wars-enhancements/templates/settings.html",
        });
    }

    // noinspection JSDeprecatedSymbols
    getData(options) {
        const gs = game.settings;
        const canConfigure = game.user.can("SETTINGS_MODIFY");

        const data = {
            system: { title: game.system.title, menus: [], settings: [] },
        };

        // Classify all settings
        // noinspection JSUnusedLocalSymbols
        for (let setting of gs.settings.values()) {
            // Exclude settings the user cannot change
            if (!setting.key.includes("title-cards-") || (!canConfigure && setting.scope !== "client")) continue;

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
            if (s.key.includes("title-cards-")) data.system.settings.push(s);
        }

        // Return data
        return {
            user: game.user,
            canConfigure: canConfigure,
            systemTitle: game.system.title,
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