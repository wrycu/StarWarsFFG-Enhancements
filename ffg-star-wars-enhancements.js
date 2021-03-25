import { registerSettings } from './scripts/settings.js'
import { rename_actors } from './scripts/rename.js'
import { attack_animation } from './scripts/animation.js'

Hooks.once('init', async function() {
	console.log('ffg-star-wars-enhancements | Initializing')

	registerSettings()

	console.log('ffg-star-wars-enhancements | Initializing finished')
});

Hooks.once('ready', () => {
	/* register functionality here */
	rename_actors();
	attack_animation();
});

/*
Hooks.once('ffgDiceMessage', (roll) => {
	attack_animation(roll).then();
});
*/
