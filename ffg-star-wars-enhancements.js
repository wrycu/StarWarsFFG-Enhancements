import { init as attack_animation_init, attack_animation } from './scripts/animation.js'
import { init as opening_crawl_init, ready as opening_crawl_ready, select_opening_crawl, create_opening_crawl } from './scripts/opening_crawl.js'
import { init as rename_init, rename_actors } from './scripts/rename.js'

Hooks.once('init', async function() {
	console.log('ffg-star-wars-enhancements | Initializing')

	rename_init();
	attack_animation_init();
    opening_crawl_init();

	console.log('ffg-star-wars-enhancements | Initializing finished')
});

Hooks.once('ready', () => {
    /* register functionality here */
    rename_actors();
    attack_animation();
    opening_crawl_ready();
});

/*
Hooks.once('ffgDiceMessage', (roll) => {
    attack_animation(roll).then();
});
*/

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
