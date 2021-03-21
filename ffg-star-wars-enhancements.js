import { registerSettings } from './scripts/settings.js'
import { rename_actors } from './scripts/rename.js'

Hooks.once('init', async function() {
	console.log('ffg-star-wars-enhancements | Initializing')

	registerSettings()

	console.log('ffg-star-wars-enhancements | Initializing finished')
});

Hooks.once('ready', () => {
	/* register functions for functionality here */
	rename_actors();
});
