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

class OpeningCrawlApplication extends Application {
    constructor(options) {
      super({}, options);
    }
  
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

    activateListeners(html) {
        console.log('ffg-star-wars-enhancements | opening-crawl | active listeners');
        super.activateListeners(html);
    }
}

export function ready() {
    console.log("ffg-star-wars-enhancements | opening-crawl | ready");
    game.socket.on('module.ffg-star-wars-enhancements', socket_listener);

    // TODO: Remove this testing code
    //launch_opening_crawl();
}

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
        image: null,
    }
    game.socket.emit('module.ffg-star-wars-enhancements', data);
    socket_listener(data);
    console.log("ffg-star-wars-enhancements | opening-crawl | event emmitted");
}

function socket_listener(data) {
    console.log('ffg-star-wars-enhancements | socket', data);
    new OpeningCrawlApplication().render(true);
}
