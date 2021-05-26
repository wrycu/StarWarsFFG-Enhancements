import { setting_image, setting_audio } from './settings.js'
import { log_msg as log } from './util.js'

/**
 * Register settings used by the opening crawl.
 */
export function init() {
    log('opening-crawl', 'Initializing');
    game.settings.register("ffg-star-wars-enhancements", "opening-crawl-folder", {
        name: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-folder'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-folder-hint'),
        scope: "world",
        config: true,
        type: String,
        default: "Opening Crawls",
    });
    game.settings.register("ffg-star-wars-enhancements", "opening-crawl-music", {
        name: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-music'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-music-hint'),
        scope: "world",
        config: true,
        type: setting_audio,
        default: "",
    });
    game.settings.register("ffg-star-wars-enhancements", "opening-crawl-logo", {
        name: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-logo'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-logo-hint'),
        scope: "world",
        config: true,
        type: setting_image,
        default: "",
    });
    game.settings.register("ffg-star-wars-enhancements", "opening-crawl-music-delay", {
        name: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-music-delay'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-music-delay-hint'),
        scope: "world",
        config: true,
        type: Number,
        default: 0.0,
    });
    log('opening-crawl', 'Initialized');
}

/**
 * Application that displays the Opening Crawl.
 */
class OpeningCrawlApplication extends Application {
    /**
     * @param {object} data object to provide the opening crawl template
     * @param {object} options additional options for the application
     */
    constructor(data, options) {
      super({}, options);
      this.data = data;
    };

    /**
     * Configure a "full" screen with minimal controls that will display the
     * Opening Crawl.
     */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        template: "modules/ffg-star-wars-enhancements/templates/opening_crawl.html",
        id: "ffg-star-wars-enhancements-opening-crawl",
        title: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.title'),
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
        return this.data;
    }

    /**
     * Play this.data.music using the Playlist volume.
     * @param {function} callback callback to execute once playback has started
     */
    play_music(callback) {
        let volume = game.settings.get("core", "globalPlaylistVolume");
        this.howl = game.audio.create({src: this.data.music, preload:true, volume:volume})
        this.howl.once("load", async () => {
            callback();
            await sleep(
                game.settings.get("ffg-star-wars-enhancements", "opening-crawl-music-delay")
            );
            this.howl.play();
        });
        this.howl.load();
    }

    /**
     * Listener that times the audio playing the audio with the opening crawl.
     * @param {jQuery} html
     */
    activateListeners(html) {
        log('opening-crawl', 'active listeners');
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
        if (this.howl) {
            this.howl.stop();
        }
        return super.close();
    }
}

/**
 * Ready handler that listens on the ffg-star-wars-enhancements socket.
 */
export function ready() {
    log('opening-crawl', 'ready');
    game.socket.on('module.ffg-star-wars-enhancements', socket_listener);
}

/**
 * Parse the contents of a journal into the parts of the Opening Crawl into an
 * object.
 * @param {JournalEntry} journal
 * @returns {object|null}
 */
function parse_journal(journal) {
    let journal_html = $("<div/>").append($(journal.data.content));

    let episode_html = journal_html.find("h1");
    let title_html = journal_html.find("h2");

    if (episode_html.length == 0) {
        ui.notifications.warn(game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.missing-episode'));
        return null;
    }
    if (title_html.length == 0) {
        ui.notifications.warn(game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.missing-title'));
        return null;
    }

    var image = null;
    let image_html = journal_html.find("p>img");
    if (image_html.length) {
        image = image_html.attr("src");
        // Once the image has been extracted, remove the parent paragraph.
        journal_html.find("p>img").parent().remove();
    } else {
        log('opening-crawl', 'no image to pan to found in journal');
    }

    let body = journal_html.find("p").map(function()  {
        return $(this).text();
    }).toArray();

    if (body.length == 0) {
        ui.notifications.warn(game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.missing-body'));
        return null;
    }

    return {
        episode: episode_html.text(),
        title: title_html.text(),
        body: body,
        image: image,
    };
}

/**
 * Launch the opening crawl.
 * @param {object} data
 */
export function launch_opening_crawl(data) {
    log('opening-crawl', 'launching');

    data = mergeObject(data, {
        type: "opening-crawl",
        logo: game.settings.get('ffg-star-wars-enhancements', 'opening-crawl-logo'),
        music: game.settings.get('ffg-star-wars-enhancements', 'opening-crawl-music'),
    });
    game.socket.emit('module.ffg-star-wars-enhancements', data);
    socket_listener(data);
    log('opening-crawl', 'event emmitted');
}

/**
 * Listener for the ffg-star-wars-enhancements socket that launches the
 * OpeningCrawlApplication if the message type is "opening-crawl"
 *
 * @param {object} data object passed to OpeningCrawlApplication
 */
function socket_listener(data) {
    log('socket', data);
    if (data.type == "opening-crawl") {
        new OpeningCrawlApplication(data).render(true);
    }
}

export function select_opening_crawl() {
    new OpeningCrawlSelectApplication().render(true);
}

class OpeningCrawlSelectApplication extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/ffg-star-wars-enhancements/templates/opening_crawl_select.html",
            id: "ffg-star-wars-enhancements-opening-crawl-select",
            title: game.i18n.localize('ffg-star-wars-enhancements.controls.opening-crawl.title'),
        });
    }
    async getData() {
        let folder = await get_journal_folder();
        let journals = folder.content.map(journal => {
            return {
                id: journal.data._id,
                name: journal.data.name,
            }
        });

        return {
            journals: journals,
        };
    }
    _updateObject(event, data) {
        log('opening-crawl', 'select | journal selected');

        if (event.submitter.className == "create") {
            create_opening_crawl();
            return;
        }

        let journal = game.journal.get(data.journal_id);
        if (!journal) {
            log('opening-crawl', 'select | failed to open journal after selection');
            return;
        }

        var data = parse_journal(journal);
        if (!data) {
            log('opening-crawl', 'select | failed to parse journal');
            return;
        }

        launch_opening_crawl(data);
        log('opening-crawl', 'select | journal selection complete');
    }
}

/**
 * Get the opening crawls journal folder.
 */
async function get_journal_folder() {
    let folder_name = game.settings.get('ffg-star-wars-enhancements', 'opening-crawl-folder');

    let folder = game.folders.getName(folder_name);
    if (!folder) {
        let missing_folder = game.i18n.format('ffg-star-wars-enhancements.opening-crawl.create-folder', {folder: folder_name});
        let confirmation = await Dialog.confirm({
            title: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.title'),
            content: `<p>${missing_folder}</p>`,
        });
        if (confirmation) {
            folder = await Folder.create({
                name: folder_name,
                type: "JournalEntry",
                parent: 0,
            });

        } else {
            ui.notifications.error(game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.missing-folder'));
            throw "ffg-star-wars-enhancements | opening-crawl | opening crawl folder not configured in settings"
        }
    }
    return folder;
}

export async function create_opening_crawl() {
    let folder = await get_journal_folder();
    let data = {
        "name": "Episode X",
        "folder": folder.id,
        "content": "<h1>Episode X</h1><h2>Episode Title</h2><p>Replace the h1 and h2 above with your episode and title. Then, replace this block of text with the paragraphs of your opening crawl. Lastly, the opening crawl will pan to the image below. Replace the image with a planet, ship, or simply remove the image entirely to pan to open space.</p><p><img src=\"modules/ffg-star-wars-enhancements/artwork/planet.png\"/></p>",
    };
    JournalEntry.create(data).then(journal => {journal.sheet.render(true)});
}

/**
 * Helper function to delay code execution by an arbitrary amount
 * @param ms - number of MS to delay by
 * @returns {Promise<unknown>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
