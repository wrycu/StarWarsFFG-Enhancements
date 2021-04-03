import { init as settings_init } from './scripts/settings.js'
import { log_msg as log } from './scripts/util.js'
import { init as attack_animation_init, attack_animation } from './scripts/animation.js'
import { init as opening_crawl_init, ready as opening_crawl_ready, select_opening_crawl } from './scripts/opening_crawl.js'
import { init as rename_init, rename_actors } from './scripts/rename.js'
import { create_datapad_journal } from './scripts/datapads.js'
import { dice_helper_init, dice_helper } from './scripts/dice_helper.js'

Hooks.once('init', async function() {
	log('base_module', 'Initializing');

	settings_init()
	rename_init()
	attack_animation_init();
    opening_crawl_init();
    dice_helper_init();

    log('base_module', 'registering helpers');
    Handlebars.registerHelper("iff", function (a, operator, b, opts) {
        var bool = false;
        switch (operator) {
            case "==":
                bool = a == b;
                break;
            case ">":
                bool = a > b;
                break;
            case "<":
                bool = a < b;
                break;
            case "!=":
                bool = a != b;
                break;
            case "contains":
                if (a && b) {
                    bool = a.includes(b);
                } else {
                    bool = false;
                }
                break;
            default:
                throw "Unknown operator " + operator;
        }

        if (bool) {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    });
    log('base_module', 'Done registering helpers');

	log('base_module', 'Initializing finished');
});

Hooks.once('ready', () => {
    /* register functionality here */
    rename_actors();

    opening_crawl_ready();
    dice_helper();
});

Hooks.on("getSceneControlButtons", (controls) => {
	if (game.user.isGM) {
		controls.push({
			name: game.i18n.localize("ffg-star-wars-enhancements.controls.name"),
			title: game.i18n.localize("ffg-star-wars-enhancements.controls.title"),
			layer: "ControlsLayer",
			icon: "fa fa-jedi",
			tools: [
				{
					name: game.i18n.localize("ffg-star-wars-enhancements.controls.opening-crawl.name"),
					title: game.i18n.localize("ffg-star-wars-enhancements.controls.opening-crawl.title"),
					icon: "fas fa-journal-whills",
					button: true,
					onClick: () => {
						select_opening_crawl();
					},
				},
				{
					name: game.i18n.localize("ffg-star-wars-enhancements.controls.new-journal-template.name"),
					title: game.i18n.localize("ffg-star-wars-enhancements.controls.new-journal-template.title"),
					icon: "fas fa-book-medical",
					button: true,
					onClick: () => {
						create_datapad_journal();
					},
				},
			]
		});
	}
});

function register_hooks() {
    libWrapper.register(
        'ffg-star-wars-enhancements',
        'game.ffg.RollFFG.prototype.toMessage',
        function (wrapped, ...args) {
            attack_animation();
            return wrapped(...args);
        }
    )
}
