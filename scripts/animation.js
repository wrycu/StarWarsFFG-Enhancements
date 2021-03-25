export function attack_animation() {
    var error = false;
    /* check for the required modules */
    if (!game.modules.get('lib-wrapper')?.active && game.user.isGM) {
        ui.notifications.error("FFG Star Wars Enhancements attack animations requires the 'libWrapper' module. Please install and activate it.");
        error = true;
    }
    if (!game.modules.get('fxmaster')?.active && game.user.isGM) {
        ui.notifications.error("FFG Star Wars Enhancements attack animations requires the 'FXMaster' module. Please install and activate it.");
        error = true;
    }
    if (!game.modules.get('JB2A_DnD5e')?.active && game.user.isGM) {
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
        async function (wrapped, ...args) {
            // todo: improve logging
            console.log(...args)
            console.log(this)
            let skill = args[0]['flavor'].replace('Rolling ', '').replace('...', '').replace(' ', ' ');
            let combat_skills = {
                /* melee animations */
                'Brawl': {
                    'animation_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-brawl-animation"),
                    'sound_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-brawl-animation"),
                },
                'Lightsaber': {
                    'animation_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-lightsaber-animation"),
                    'sound_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-lightsaber-animation"),
                },
                'Melee': {
                    'animation_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-melee-animation"),
                    'sound_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-melee-animation"),
                },
                /* ranged animations */
                'Gunnery': {
                    'animation_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-gunnery-animation"),
                    'sound_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-gunnery-animation"),
                },
                'Ranged: Heavy': {
                    'animation_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-ranged-heavy-animation"),
                    'sound_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-ranged-heavy-animation"),
                },
                'Ranged: Light': {
                    'animation_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-ranged-light-animation"),
                    'sound_file': game.settings.get("ffg-star-wars-enhancements", "attack-animation-ranged-light-animation"),
                },
            };
            if (skill in combat_skills) {
                console.log("This is a combat skill")
                /* check if things are configured for us to continue */
                if (game.user.targets.size === 0) {
                    ui.notifications.warn('You must target at least one token as a target');
                    await wrapped(...args);
                    return;
                }

                if (canvas.tokens.controlled.length === 0) {
                    ui.notifications.warn("Please select the attacker");
                    await wrapped(...args);
                    return;
                }
                await wrapped(...args);
                // todo: based on dice results, we could have the animation miss
                await Cast(combat_skills[skill]['animation_file'], combat_skills[skill]['animation_file'])
            }
            else {
                console.log("This is NOT a combat skill")
                console.log(skill)
                // not a combat skill; ignore it
                await wrapped(...args);
            }
        }
    )
}

const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function Cast(animation_file, sound_file) {
    //var myStringArray = Array.from(game.user.targets)[0];
    var arrayLength = game.user.targets.size;
    for (var i = 0; i < arrayLength; i++) {
        let mainTarget = Array.from(game.user.targets)[i];
        let myToken = canvas.tokens.controlled [0];

        let ray = new Ray(myToken.center, mainTarget.center);
        let anDeg = -(ray.angle * 57.3);
        let anDist = ray.distance;

        let anFileSize = 600;
        let anchorX = 0.2;
        switch(true){
            case (anDist<=600):
                anFileSize = 600;
                anchorX = 0.2;
                break;
            case (anDist>1200):
                anFileSize = 1800;
                anchorX = 0.091;
                break;
            default:
                anFileSize = 1200;
                anchorX = 0.125;
                break;
        }

        let anFile = animation_file;

        let anScale = anDist / anFileSize;
        let anScaleY = anDist <= 600 ? 0.9  : anScale;

        let spellAnim =
        {
            file: anFile,
            position: myToken.center,
            anchor: {
                x: anchorX,
                y: 0.5
            },
            angle: anDeg,
            scale: {
                x: anScale,
                y: anScaleY
            }
        };

        canvas.fxmaster.playVideo(spellAnim);
        game.socket.emit('module.fxmaster', spellAnim);
        //AudioHelper.play({src: "Audio/Soundboard/Saber_Attack_1.mp3", volume: .5, autoplay: true, loop: false}, true);
        await sleepNow(500)
    }
}