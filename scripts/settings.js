export function registerSettings () {
    game.settings.register("ffg-star-wars-enhancements", "title-crawl-audio", {
        name: "Star Wars title crawl music",
        hint: "The original title crawl music has about 8-9 seconds of silence. Timing matters to ensure syncronization with the Logo.",
        scope: "world",
        config: true,
        type: String,
        default: "",
    })
    game.settings.register("ffg-star-wars-enhancements", "auto-rename-actors", {
        name: "Auto-rename combat actors",
        hint: "Tokens with a friendly disposition will be named to NPC; tokens with any other disposition will be set to NPC",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    })
}
