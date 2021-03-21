export function registerSettings () {
    game.settings.register("ffg-star-wars-enhancements", "title-crawl-audio", {
        name: "Star Wars title crawl music",
        hint: "The original title crawl music has about 8-9 seconds of silence. Timing matters to ensure syncronization with the Logo.",
        scope: "world",
        config: true,
        type: String,
        default: "",
    })
}
