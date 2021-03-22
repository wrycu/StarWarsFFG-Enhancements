import { init as opening_crawl_init, ready as opening_crawl_ready } from './scripts/opening_crawl.js'
import { init as rename_init, rename_actors } from './scripts/rename.js'

Hooks.once('init', async function() {
	console.log('ffg-star-wars-enhancements | Initializing')

	rename_init()
    opening_crawl_init();

	console.log('ffg-star-wars-enhancements | Initializing finished')
});

Hooks.once('ready', () => {
	/* register functions for functionality here */
	rename_actors();
    opening_crawl_ready();
});
