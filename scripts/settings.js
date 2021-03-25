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
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-brawl-animation", {
        name: "Attack animation for Brawl",
        hint: "Animation file for Brawl attacks",
        scope: "world",
        config: true,
        type: String,
        default: 'modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/LaserSword01_01_Regular_Blue_800x600.webm',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-brawl-sound", {
        name: "Attack sound for Brawl",
        hint: "Sound file for Brawl attacks",
        scope: "world",
        config: true,
        type: String,
        default: '',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-lightsaber-animation", {
        name: "Attack animation for Lightsaber",
        hint: "Animation file for Lightsaber attacks",
        scope: "world",
        config: true,
        type: String,
        default: 'modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/LaserSword01_01_Regular_Blue_800x600.webm',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-lightsaber-sound", {
        name: "Attack sound for Lightsaber",
        hint: "Sound file for Lightsaber attacks",
        scope: "world",
        config: true,
        type: String,
        default: '',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-melee-animation", {
        name: "Attack animation for Melee",
        hint: "Animation file for Melee attacks",
        scope: "world",
        config: true,
        type: String,
        default: 'modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Sword01_01_Regular_White_800x600.webm',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-melee-sound", {
        name: "Attack sound for Melee",
        hint: "Sound file for Melee attacks",
        scope: "world",
        config: true,
        type: String,
        default: '',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-gunnery-animation", {
        name: "Attack animation for Gunnery",
        hint: "Animation file for Gunnery attacks",
        scope: "world",
        config: true,
        type: String,
        default: 'modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/LaserShot_01_Regular_Green_30ft_1600x400.webm',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-gunnery-sound", {
        name: "Attack sound for Gunnery",
        hint: "Sound file for Gunnery attacks",
        scope: "world",
        config: true,
        type: String,
        default: '',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-ranged-heavy-animation", {
        name: "Attack animation for Ranged: Heavy",
        hint: "Animation file for Ranged: Heavy attacks",
        scope: "world",
        config: true,
        type: String,
        default: 'modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/LaserShot_01_Regular_Blue_30ft_1600x400.webm',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-ranged-heavy-sound", {
        name: "Attack sound for Ranged: Heavy",
        hint: "Sound file for Ranged: Heavy attacks",
        scope: "world",
        config: true,
        type: String,
        default: '',
    })
        game.settings.register("ffg-star-wars-enhancements", "attack-animation-ranged-light-animation", {
        name: "Attack animation for Ranged: Light",
        hint: "Animation file for Ranged: Light attacks",
        scope: "world",
        config: true,
        type: String,
        default: 'modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/LaserShot_01_Regular_Red_30ft_1600x400.webm',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-ranged-light-sound", {
        name: "Attack sound for Ranged: Light",
        hint: "Sound file for Ranged: Light attacks",
        scope: "world",
        config: true,
        type: String,
        default: '',
    })
}
