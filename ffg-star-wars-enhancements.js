import { registerSettings } from './scripts/settings.js'

Hooks.once('init', async function() {
	console.log('ffg-star-wars-enhancements | Initializing')

	registerSettings()
	
	console.log('ffg-star-wars-enhancements | Initializing finished')
});
