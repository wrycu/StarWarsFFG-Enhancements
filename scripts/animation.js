import { setting_image, setting_audio } from './settings.js'
import { log_msg as log } from './util.js'

export function init () {
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-brawl-animation", {
        name: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.brawl-animation'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.brawl-animation-hint'),
        scope: "world",
        config: true,
        type: setting_image,
        default: 'modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/LaserSword01_01_Regular_Blue_800x600.webm',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-brawl-sound", {
        name: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.brawl-sound'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.brawl-sound-hint'),
        scope: "world",
        config: true,
        type: setting_audio,
        default: 'modules/ffg-star-wars-enhancements/audio/brawl.mp3',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-lightsaber-animation", {
        name: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.lightsaber-animation'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.lightsaber-animation-hint'),
        scope: "world",
        config: true,
        type: setting_image,
        default: 'modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/LaserSword01_01_Regular_Blue_800x600.webm',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-lightsaber-sound", {
        name: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.lightsaber-sound'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.lightsaber-sound-hint'),
        scope: "world",
        config: true,
        type: setting_audio,
        default: 'modules/ffg-star-wars-enhancements/audio/lightsaber.mp3',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-melee-animation", {
        name: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.melee-animation'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.melee-animation-hint'),
        scope: "world",
        config: true,
        type: setting_image,
        default: 'modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Sword01_01_Regular_White_800x600.webm',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-melee-sound", {
        name: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.melee-sound'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.melee-sound-hint'),
        scope: "world",
        config: true,
        type: setting_audio,
        default: 'modules/ffg-star-wars-enhancements/audio/melee.mp3',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-gunnery-animation", {
        name: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.gunnery-animation'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.gunnery-animation-hint'),
        scope: "world",
        config: true,
        type: setting_image,
        default: 'modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/LaserShot_01_Regular_Green_30ft_1600x400.webm',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-gunnery-sound", {
        name: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.gunnery-sound'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.gunnery-sound-hint'),
        scope: "world",
        config: true,
        type: setting_audio,
        default: 'modules/ffg-star-wars-enhancements/audio/gunnery.mp3',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-ranged-heavy-animation", {
        name: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.ranged-heavy-animation'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.ranged-heavy-animation-hint'),
        scope: "world",
        config: true,
        type: setting_image,
        default: 'modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/LaserShot_01_Regular_Blue_30ft_1600x400.webm',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-ranged-heavy-sound", {
        name: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.ranged-heavy-sound'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.ranged-heavy-sound-hint'),
        scope: "world",
        config: true,
        type: setting_audio,
        default: 'modules/ffg-star-wars-enhancements/audio/blaster_heavy.mp3',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-ranged-light-animation", {
        name: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.ranged-light-animation'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.ranged-light-animation-hint'),
        scope: "world",
        config: true,
        type: setting_image,
        default: 'modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/LaserShot_01_Regular_Red_30ft_1600x400.webm',
    })
    game.settings.register("ffg-star-wars-enhancements", "attack-animation-ranged-light-sound", {
        name: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.ranged-light-sound'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.attack-animation.ranged-light-sound-hint'),
        scope: "world",
        config: true,
        type: setting_audio,
        default: 'modules/ffg-star-wars-enhancements/audio/blaster.mp3',
    })
}

export function attack_animation() {
    var error = false;
    /* check for the required modules */
    if (!game.modules.get('lib-wrapper')?.active && game.user.isGM) {
        log('attack_animation', 'libWrapper was not loaded. Not attempting attack animation');
        ui.notifications.error("FFG Star Wars Enhancements attack animations requires the 'libWrapper' module. Please install and activate it.");
        error = true;
    }
    if (!game.modules.get('fxmaster')?.active && game.user.isGM) {
        log('attack_animation', 'fxmaster was not loaded. Not attempting attack animation');
        ui.notifications.error("FFG Star Wars Enhancements attack animations requires the 'FXMaster' module. Please install and activate it.");
        error = true;
    }
    if (!game.modules.get('JB2A_DnD5e')?.active && game.user.isGM) {
        log('attack_animation', 'JB2A was not loaded. Not attempting attack animation');
        ui.notifications.error("FFG Star Wars Enhancements attack animations requires the 'jb2a' module. Please install and activate it.");
        error = true;
    }

    if (error) {
        return;
    }

    /*
        we may want to monkeypatch a different function in the future. this location doesn't seem to have access to
            the actual weapon in use. I'm not sure if we actually care yet, but worth considering.
     */
    libWrapper.register(
        'ffg-star-wars-enhancements',
        'game.ffg.RollFFG.prototype.toMessage',
        function (wrapped, ...args) {
            log('attack_animation', 'Detected FFG dice roll, checking to see if this is a combat skill');
            let skill = args[0]['flavor'].replace('Rolling ', '').replace('...', '').replace(' ', ' ');
            let combat_skills = {
                /* melee animations */
                'Brawl': {
                    'animation_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-brawl-animation"),
                    'sound_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-brawl-sound"),
                },
                'Lightsaber': {
                    'animation_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-lightsaber-animation"),
                    'sound_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-lightsaber-sound"),
                },
                'Melee': {
                    'animation_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-melee-animation"),
                    'sound_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-melee-sound"),
                },
                /* ranged animations */
                'Gunnery': {
                    'animation_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-gunnery-animation"),
                    'sound_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-gunnery-sound"),
                },
                'Ranged: Heavy': {
                    'animation_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-ranged-heavy-animation"),
                    'sound_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-ranged-heavy-sound"),
                },
                'Ranged: Light': {
                    'animation_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-ranged-light-animation"),
                    'sound_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-ranged-light-sound"),
                },
            };
            if (skill in combat_skills) {
                log('attack_animation', 'Determined that ' + skill + ') is a combat skill');
                /* check if things are configured for us to continue */
                if (game.user.targets.size === 0) {
                    ui.notifications.warn('You must target at least one token as a target or disable attack animations');
                    log('attack_animation', 'Aborted attack animation because there were no targets selected');
                    return wrapped(...args);
                }

                if (canvas.tokens.controlled.length === 0) {
                    ui.notifications.warn("Please select the attacker or disable attack animations");
                    log('attack_animation', 'Aborted attack animation because no source targets were selected');
                    return wrapped(...args);
                }
                let wrapped_data = wrapped(...args);
                // todo: based on dice results, we could have the animation miss
                log('attack_animation', 'Playing the attack animation');
                play_animation(combat_skills[skill]['animation_file'], combat_skills[skill]['sound_file']);
                return wrapped_data
            }
            else {
                // not a combat skill; ignore it
                return wrapped(...args);
            }
        }
    )
}

const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function play_animation(animation_file, sound_file) {
    const tokens = canvas.tokens.controlled;
    var arrayLength = game.user.targets.size;
    for (var i = 0; i < arrayLength; i++) {
        var num_shots = Math.floor((Math.random() * 6) + 1);
        for (var x = 0; x < num_shots; x++) {
            let ray = new Ray(tokens[0].center, Array.from(game.user.targets)[i].center);

            let animation_config = {
                position: tokens[0].center,
                file: animation_file,
                anchor: {
                    x: 0.125,
                    y: 0.5,
                },
                angle: -(ray.angle * 57.3),
                scale: {
                    x: ray.distance / 1200,
                    y: ray.distance <= 200 ? 0.66 : ray.distance / 1200,
                },
            }
            canvas.fxmaster.playVideo(animation_config);
            game.socket.emit('module.fxmaster', animation_config);
            AudioHelper.play({src: sound_file, volume: .3, autoplay: true, loop: false}, true);
            await sleepNow(250)
        }
    }
    await sleepNow(500)
}
