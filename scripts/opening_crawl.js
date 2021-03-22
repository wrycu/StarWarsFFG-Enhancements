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

function socket_listener(data) {
    console.log('ffg-star-wars-enhancements | socket', data);
}

export function ready() {
    game.socket.on('module.ffg-star-wars-enhancements', socket_listener);
}

export function launch_opening_crawl() {
    game.socket.emit('module.ffg-star-wars-enhancements', {
        type: "opening-crawl",
    });
    console.log("ffg-star-wars-enhancements | opening-crawl | launching");
    console.log("ffg-star-wars-enhancements | opening-crawl | launched");
}