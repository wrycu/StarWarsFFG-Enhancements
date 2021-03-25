/**
 * Register settings used by the opening crawl.
 */
export function init() {
    game.settings.register("ffg-star-wars-enhancements", "opening-crawl-folder", {
        name: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-folder'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-folder-hint'),
        scope: "world",
        config: true,
        type: String,
        default: "",
    });
    game.settings.register("ffg-star-wars-enhancements", "opening-crawl-music", {
        name: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-music'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-music-hint'),
        scope: "world",
        config: true,
        type: String,
        default: "",
    });
    game.settings.register("ffg-star-wars-enhancements", "opening-crawl-logo", {
        name: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-logo'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.opening-crawl-logo-hint'),
        scope: "world",
        config: true,
        type: String,
        default: "",
    });
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
    }
 
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
     * Listener that times the audio playing the audio with the opening crawl.
     * @param {jQuery} html 
     */
    activateListeners(html) {
        console.log('ffg-star-wars-enhancements | opening-crawl | active listeners');
        super.activateListeners(html);

        // TODO: Better integrate with Foundry's audio engine. Right now this
        // plays at max volume, which is potentially not cool.

        // When the audio tag exist, hide the HTML until the audio file is
        // loaded. Once it's loaded, redisplay the HTML to retrigger the
        // animation.
        let audios = html.find('audio');
        if (audios.length) {
            let audio = audios[0];

            html[0].style.display = "none";
            audio.oncanplaythrough = () => {
                html[0].style.display = "block";
                audio.play();
            };
            audio.load();
        }
    }
}

/**
 * Ready handler that listens on the ffg-star-wars-enhancements socket.
 */
export function ready() {
    console.log("ffg-star-wars-enhancements | opening-crawl | ready");
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
        console.log("ffg-star-wars-enhancements | opening-crawl | no image to pan to found in journal");
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
    }
}

/**
 * Launch the opening crawl.
 * @param {object} data
 */
export function launch_opening_crawl(data) {
    console.log("ffg-star-wars-enhancements | opening-crawl | launching");

    data = mergeObject(data, {
        type: "opening-crawl",
        logo: game.settings.get('ffg-star-wars-enhancements', 'opening-crawl-logo'),
        music: game.settings.get('ffg-star-wars-enhancements', 'opening-crawl-music'),
    });
    game.socket.emit('module.ffg-star-wars-enhancements', data);
    socket_listener(data);
    console.log("ffg-star-wars-enhancements | opening-crawl | event emmitted");
}

/**
 * Listener for the ffg-star-wars-enhancements socket that launches the
 * OpeningCrawlApplication if the message type is "opening-crawl"
 * 
 * @param {object} data object passed to OpeningCrawlApplication
 */
function socket_listener(data) {
    console.log('ffg-star-wars-enhancements | socket', data);
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
    getData() {
        let folder_name = game.settings.get('ffg-star-wars-enhancements', 'opening-crawl-folder');

        let folder = game.folders.getName(folder_name);
        if (!folder) {
            ui.notifications.warn(game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.missing-folder'));
            throw "ffg-star-wars-enhancements | opening-crawl | opening crawl folder not configured in settings"
        }
        let journals = folder.content.map(journal => {
            return {
                id: journal.data._id,
                name: journal.data.name,
            }
        });

        return {
            folder_name: folder_name,
            journals: journals,
        };
    }
    _updateObject(event, data) {
        console.log("ffg-star-wars-enhancements | opening-crawl | journal selected");
        let journal = game.journal.get(data.journal_id);
        if (!journal) {
            console.log("ffg-star-wars-enhancements | opening-crawl | failed to open journal after selection");
            return;
        }

        var data = parse_journal(journal);
        if (!data) {
            console.log("ffg-star-wars-enhancements | opening-crawl | failed to parse journal");
            return;
        }

        launch_opening_crawl(data);
        console.log("ffg-star-wars-enhancements | opening-crawl | journal selection complete");
    }
}

export function create_opening_crawl() {
    let folder_name = game.settings.get('ffg-star-wars-enhancements', 'opening-crawl-folder');

    let folder = game.folders.getName(folder_name);
    if (!folder) {
        ui.notifications.warn(game.i18n.localize('ffg-star-wars-enhancements.opening-crawl.missing-folder'));
        throw "ffg-star-wars-enhancements | opening-crawl | opening crawl folder not configured in settings"
    }
    let data = {
        "name": "Episode X",
        "folder": folder.id,
        "content": "<h1>Episode X</h1><h2>Episode Title</h2><p>Replace the h1 and h2 above with your episode and title. Then, replace this block of text with the paragraphs of your opening crawl. Lastly, the opening crawl will pan to the image below. Replace the image with a planet, ship, or simply remove the image entirely to pan to open space.</p><p><img src=\"modules/ffg-star-wars-enhancements/artwork/planet.png\"/></p>",
    };
    JournalEntry.create(data).then(journal => {journal.sheet.render(true)});
}