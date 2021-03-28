import { init as settings_init } from './scripts/settings.js'
import { log_msg as log } from './scripts/util.js'
import { init as attack_animation_init, attack_animation } from './scripts/animation.js'
import { init as opening_crawl_init, ready as opening_crawl_ready, select_opening_crawl } from './scripts/opening_crawl.js'
import { init as rename_init, rename_actors } from './scripts/rename.js'
import { create_datapad_journal } from './scripts/datapads.js'

Hooks.once('init', async function() {
	log('base_module', 'Initializing')

	settings_init()
	rename_init()
	attack_animation_init();
    opening_crawl_init();

	log('base_module', 'Initializing finished')
});

Hooks.once('ready', () => {
    /* register functionality here */
    rename_actors();
    attack_animation();
    opening_crawl_ready();
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
