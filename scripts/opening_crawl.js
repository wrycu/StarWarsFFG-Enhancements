/**
 * Register settings used by the opening crawl.
 */
export function init() {
    game.settings.register("ffg-star-wars-enhancements", "title-crawl-audio", {
        name: "Star Wars opening crawl music",
        hint: "Provide music to play during the opening crawl. The crawl is timed with the original audio with 8-9 seconds of silence.",
        scope: "world",
        config: true,
        type: String,
        default: "",
    });
    game.settings.register("ffg-star-wars-enhancements", "title-crawl-logo", {
        name: "Star Wars opening crawl logo",
        hint: "Provide an alternative logo for the opening crawl. The default logo uses a copyright safe font.",
        scope: "world",
        config: true,
        type: String,
        default: "",
    });
    game.settings.register("ffg-star-wars-enhancements", "title-crawl-contents", {
        name: "Star Wars opening crawl contents",
        hint: "Contents of the opening crawl.",
        scope: "world",
        config: false,
        type: String,
        default: "",
    });
    game.settings.register("ffg-star-wars-enhancements", "auto-rename-actors", {
        name: "Auto-rename combat actors",
        hint: "Tokens with a friendly disposition will be named to NPC; tokens with any other disposition will be set to NPC",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
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
        title: "Opening Crawl",
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

    // TODO: Remove this testing code
    //launch_opening_crawl();
}

/**
 * Launch the opening crawl.
 */
export function launch_opening_crawl() {
    console.log("ffg-star-wars-enhancements | opening-crawl | launching");
    let data = {
        type: "opening-crawl",
        episode: "Episode X",
        title: "Testing Begins",
        body: [
            "This is a testing message for verifying the opening-crawl is working as configured.",
            "Pay no mind to the body of this message other than that it is being included.",
            "This messaging will be replaced with the journal entry once available.",
        ],
        logo: null,
        image: null,
        music: null,
    }
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
    new OpeningCrawlApplication(data).render(true);
}
