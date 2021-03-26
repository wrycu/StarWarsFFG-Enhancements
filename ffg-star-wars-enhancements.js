import { init as settings_init } from './scripts/settings.js'
import { init as opening_crawl_init, ready as opening_crawl_ready, select_opening_crawl, create_opening_crawl } from './scripts/opening_crawl.js'
import { init as rename_init, rename_actors } from './scripts/rename.js'

Hooks.once('init', async function() {
	console.log('ffg-star-wars-enhancements | Initializing')

	settings_init()
	rename_init()
    opening_crawl_init();

	console.log('ffg-star-wars-enhancements | Initializing finished')
});

Hooks.once('ready', () => {
	/* register functions for functionality here */
	rename_actors();
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
					name: game.i18n.localize("ffg-star-wars-enhancements.controls.new-opening-crawl.name"),
					title: game.i18n.localize("ffg-star-wars-enhancements.controls.new-opening-crawl.title"),
					icon: "fas fa-book-medical",
					button: true,
					onClick: () => {
						create_opening_crawl();
					},
				},
			]
		});
	}
});