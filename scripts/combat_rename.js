Hooks.once('ready', () => {
    if(!game.modules.get('lib-wrapper')?.active && game.user.isGM)
        ui.notifications.error("Module XYZ requires the 'libWrapper' module. Please install and activate it.");
    else {
        libWrapper.register(
            'ffg-star-wars-enhancements',
            'Combat.prototype.createEmbeddedEntity',
            async function (wrapped, ...args) {
                if (args[0] === 'Combatant') {
                    // create the combatant normally
                    var created_data = await wrapped(args[0], args[1]);

                    // iterate over the combatants and update each one
                    for (i = 0; i < args[1].length; i++) {
                        var update_data = {
                            '_id': created_data[i]['_id'],
                        }

                        // check the disposition and update the name and image
                        // this is done as a second (different) call because we want to update the information on a temporary basis
                        // and we can't specify part of the data is temporary
                        if (game.actors.tokens[args[1][i]['tokenId']].token?.data?.disposition === TOKEN_DISPOSITIONS['FRIENDLY']) {
                            update_data['name'] = 'PC';
                            update_data['img'] = 'systems/starwarsffg/images/dice/starwars/lightside.png';
                        }
                        else {
                            update_data['name'] = 'NPC';
                            update_data['img'] = 'systems/starwarsffg/images/dice/starwars/darkside.png';
                        }

                        game.combat.updateEmbeddedEntity("Combatant", update_data, {temporary: true});
                    }
                }
            }
        )
    }
});
