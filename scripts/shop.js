import { log_msg as log } from "./util.js";

let module_name = 'shop_generator';

class Shop {
    constructor(shady, specialization, min_items, max_items, location, actor, base_price) {
        /*
        Shop generator
        PURPOSE:
            Generates a shop with randomly selected items
            Note that this is not implemented in the rules, but https://www.swrpg-shop.com/ does a great job of it and
                this is intended to implement similar functionality in-game
            TODO: add a value / rarity upper bound option
        LIMITATIONS:
            Currently, the shop can only use items from compendiums (not items in the world itself)
            There is no way to modify the roll the actor makes, or to use two different people per roll type
        ARGS:
            shady: boolean - should we include restricted items in the shop inventory?
            specialization: string - type of items the shop will carry (see examples below)
                 general     - all item types are permitted
                 armor       - contains armor only
                 gear        - contains gear only
                 weapon      - contains weapons only
                 nerf herder - contains consumables only
             min_items: int - lower bound of the number of items the shop will have
             max_items: int - upper bound of the number of items the shop will have
             location: string - location modifier (see examples below)
                 minus_two
                 minus_one
                 no_change
                 plus_one
                 plus_two
                 plus_three
                 plus_four
             actor: string - ID of the actor we should use to roll to see if items are in the shop or not
             base_price: int - % price to report (100 is no change, 50 is half, 200 is double)
         */
        log(module_name, 'Initializing shop object');
        let specialization_mapping = {
            'general': {
                'compendiums': [
                    'world.oggdudearmor',
                    'world.oggdudegear',
                    'world.oggdudeweapons',
                    'world.oggdudeitemattachments',
                ],
                'types': [
                    'weapon',
                    'gear',
                    'armour',
                    'itemattachment',
                ],
            },
            'armor': {
                'compendiums': [
                    'world.oggdudearmor',
                ],
                'types': [
                    'armour'
                ],
            },
            'gear': {
                'compendiums': [
                    'world.oggdudegear',
                ],
                'types': [
                    'gear',
                ],
            },
            'weapon': {
                'compendiums': [
                    'world.oggdudeweapons',
                ],
                'types': [
                    'weapon',
                ],
            },
            'nerf_herder': {
                'compendiums': [
                    'world.oggdudegear',
                ],
                'types': [
                    'gear',
                ],
            },
        };
        let location_mapping = {
            'minus_two': -2,
            'minus_one': -1,
            'no_change': 0,
            'plus_one': 1,
            'plus_two': 2,
            'plus_three': 3,
            'plus_four': 4
        };
        let price_mapping = {
            0: 1,
            1: 1,
            2: 2,
            3: 3,
            4: 4,
        }
        this.shady = shady;
        this.compendiums = specialization_mapping[specialization]['compendiums'];
        this.item_types = specialization_mapping[specialization]['types'];
        this.min_items = parseInt(min_items);
        this.max_items = parseInt(max_items);
        // do some basic error checking for min and max numbers... you know how people are
        if (this.min_items < 1) {
            this.min_items = 1;
        }
        if (this.max_items < this.min_items) {
            this.max_items = this.min_items;
        }
        this.location_modifier = location_mapping[location];
        if (location_mapping[location] in price_mapping) {
            this.price_modifier = price_mapping[location_mapping[location]];
        } else {
            // you can't have negative numbers as keys for some weirdo reason reeee
            this.price_modifier = 1;
        }
        this.actor_id = actor;
        this.base_price = parseInt(base_price);
        log(module_name, 'Shop Initialized!');
    }

    /*
        Populates the shop with items
        It selects a random number between min_items and max_items
        It then picks a random item from the relevant compendiums and, using the PC passed in, rolls to see if that item is found or not
        If the item is found, it adds it to the shop inventory
     */
    async shop() {
        log(module_name, "Let's go shopping!");
        /* generate random number */
        let generate_count = Math.floor((Math.random() * (this.max_items - this.min_items)) + this.min_items);
        let possible_items_raw = [];
        /* build the raw item array */
        for (let i = 0; i < this.compendiums.length; i++) {
            try {
                let compendium_items = await game.packs.get(this.compendiums[i]).getData();
                for (let x = 0; x < compendium_items['index'].length; x++) {
                    possible_items_raw.push({
                        'compendium': this.compendiums[i],
                        'item': compendium_items['index'][x],
                    });
                }
            } catch ( e ) {
                log(module_name, "Unable to find compendium " + this.compendiums[i]);
            }
        }
        /* select items and get their details */
        let selected_items = [];
        while (selected_items.length < generate_count) {
            /* check to see if it's even possible to create items up to our desired amount */
            if (possible_items_raw.length < selected_items) {
                log(module_name, "Unable to find sufficient items - aborting with " + selected_items.length + " items in shop inventory");
                break;
            }
            /* look up the details and see if it makes the shop */
            let possible_item_index = Math.floor((Math.random() * possible_items_raw.length));
            // get item details
            let possible_item = await game.packs.get(possible_items_raw[possible_item_index]['compendium']).getEntity(possible_items_raw[possible_item_index]['item']['_id']);
            // check if it's OK
            if (possible_item.data.data.rarity.isrestricted === true && this.shady === false) {
                log(module_name, "Rejected item " + possible_item.name + " (item is restricted and this is not a shady store)");
            } else if (this.item_types.includes(possible_item.data.type) === false) {
                log(module_name, "Rejected item " + possible_item.name + " (item is not an accepted type for this kind of store)");
            } else if (possible_item.data.type === 'itemattachment' && this.item_types.includes(possible_item.data.data.type) === false) {
                log(module_name, "Rejected item " + possible_item.name + " (item is a mod for an item type not accepted for this kind of store)");
            } else {
                // the item is a fit for our shop, roll to see if the actor finds it or not
                log(module_name, "Rolling to see if we find the item in the shop or not");
                // make the check to see if we find the item
                let difficulty = this.rarity_to_difficulty(possible_item.data.data.rarity.adjusted + this.location_modifier);
                if (possible_item.data.data.rarity.isrestricted === true) {
                    // legal items use negotiation
                    var pool = await this.build_dice_pool(this.actor_id, difficulty['difficulty'], difficulty['challenge'], 'streetwise');
                } else {
                    // illegal items use streetwise
                    var pool = await this.build_dice_pool(this.actor_id, difficulty['difficulty'], difficulty['challenge'], 'negotiation');
                }
                let result = new game.ffg.RollFFG(pool.renderDiceExpression()).roll().ffg;

                // see if the check was successful or not
                if (result['success'] >= 1) {
                    // we passed the check, count the item as added! woot!
                    /* build the result string (the normal [su] shortcut doesn't render properly here) */
                    let result_string = '';
                    for (let i = 0; i<result['success']; i++) {
                        result_string += '<span class="dietype starwars success">s</span>';
                    }
                    for (let i = 0; i<result['advantage']; i++) {
                        result_string += '<span class="dietype starwars advantage">a</span>';
                    }
                    for (let i = 0; i<result['triumph']; i++) {
                        result_string += '<span class="dietype starwars triumph">x</span>';
                    }
                    for (let i = 0; i<result['threat']; i++) {
                        result_string += '<span class="dietype starwars threat">t</span>';
                    }
                    for (let i = 0; i<result['despair']; i++) {
                        result_string += '<span class="dietype starwars despair">y</span>';
                    }

                    // attempt to use a custom default image if one isn't set
                    let base_path = 'modules/ffg-star-wars-enhancements/icons/';
                    let image_mapping = {
                        'gear': base_path + 'gym-bag.svg',
                        'weapon': base_path + 'bolter-gun.svg',
                        'armour': base_path + 'breastplate.svg',
                    };
                    if (possible_items_raw[possible_item_index]['item']['img'] === "icons/svg/mystery-man.svg" && possible_item.data.type in image_mapping) {
                        var image = image_mapping[possible_item.data.type];
                    } else {
                        var image = possible_items_raw[possible_item_index]['item']['img'];
                    }

                    // the price is modified by where in the galaxy the shop is (and furthermore by the vendor modifier)
                    let price = (parseInt(possible_item.data.data.price.value) * this.price_modifier) * (this.base_price / 100);
                    log(module_name, "We passed our check! Woot! Adding " + possible_item.name + "to shop inventory");
                    selected_items.push({
                        'item': {
                            'id': possible_item.id,
                            'name': possible_item.name,
                            'image': image,
                            'type': possible_item.data.type,
                            'compendium': possible_items_raw[possible_item_index]['compendium'],
                            'restricted': possible_item.data.data.rarity.isrestricted,
                        },
                        'price': price,
                        'roll': result_string,
                        'dice_string': pool.renderDiceExpression(),
                    });
                } else {
                    log(module_name, "Rejected item " + possible_item.name + " (failed check to find it)");
                }
            }
            // remove the item from the possible item list so we don't stumble on it again
            possible_items_raw.splice(possible_item_index, 1);
        }
        log(module_name, "Completed building the shop inventory!");
        log(module_name, JSON.stringify(selected_items));
        return selected_items;
    };

    /*
    Converts the rarity number to the difficulty of the roll
    RAW the check gets upgraded for every 10 above the first 10
     */
    rarity_to_difficulty(rarity) {
        if (rarity <= 10) {
            return {
                "difficulty": Math.floor(rarity / 2),
                "challenge": 0,
            }
        } else {
            return {
                "difficulty": 5 - rarity % 10,
                "challenge": rarity % 10,
            }
        }
    }

    /*
    Given the actor and the pool they're facing, build the dice pool
    This is core system functionality but it isn't exposed as an individual function so I had to duplicate the code
     */
    async build_dice_pool(actor_id, difficulty, upgrades, shop_skill) {
        // stripped down version of https://github.com/StarWarsFoundryVTT/StarWarsFFG/blob/6606003c3a87de394c7ccd74401d838c17bc0b42/modules/helpers/dice-helpers.js#L7
        let actor = game.actors.get(actor_id);
        if (shop_skill === 'negotiation') {
            var skill = actor.data.data.skills.Negotiation;
            var characteristic = actor.data.data.characteristics[skill.characteristic];
        } else if (shop_skill === 'streetwise') {
            var skill = actor.data.data.skills.Streetwise;
            var characteristic = actor.data.data.characteristics[skill.characteristic];
        }
        let dicePool = new DicePoolFFG({
            ability: Math.max(characteristic.value, skill.rank),
            boost: skill.boost,
            setback: skill.setback + status.setback,
            force: skill.force,
            advantage: skill.advantage,
            dark: skill.dark,
            light: skill.light,
            failure: skill.failure,
            threat: skill.threat,
            success: skill.success,
            triumph: skill.triumph,
            despair: skill.despair,
            difficulty: difficulty,
        });

        dicePool.upgrade(Math.min(characteristic.value, skill.rank));
        for (let i = 0; i < upgrades; i++) {
            dicePool.upgradeDifficulty();
        }
        return dicePool;
    }
}

/*
Helper function to return a list of actors owned by players
 */
async function get_player_actors() {
    let actors = game.actors.entries;
    let pcs = []
    for (let i = 0; i < actors.length; i++) {
        if (actors[i].hasPlayerOwner === true) {
            pcs.push(actors[i]);
        }
    }
    return pcs;
}

/*
Provides a GUI for configuring the shop
Passes the results to the shop object and generates the shop inventory
 */
class ShopGenerator extends FormApplication {
    constructor(actor_id=null) {
        super();
        // allows us to tie the shop generation to a specific, already existing actor
        this.actor_id = actor_id;
    }

    /*
    No idea what this does, but it is in stuff I'm basing the module off of so it's here too
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/ffg-star-wars-enhancements/templates/shop/setup.html",
            id: "ffg-star-wars-enhancements-shop-generator-setup",
            title: "Shop Generator",
        });
    }

    /*
    Get the list of players so we can provide a neat dropdown for the GM to select from
     */
    async getData() {
        let actors = await get_player_actors();
        return {
            actors: actors,
        };
    }

    /*
    Called when the form is submitted
    Creates a shop, passes the form data to it, and creates the inventory
        (in the shop and the actor)
     */
    async _updateObject(event, data) {
        log(module_name, "Shop generation request started");
        if (data['shop_actor'] === "") {
            ui.notifications.warn("You must choose a player-owned character to populate the store");
            return;
        }
        let myshop = new Shop(data['shady'], data['shop_type'], data['min_item_count'], data['max_item_count'], data['shop_location'], data['shop_actor'], data['shop_base_price']);
        let inventory = await myshop.shop();

        /* set the store data as a flag on the actor we got passed in (assuming one was) */
        log(module_name, "Shop generation completed with " + inventory.length + " items, preparing to update actor");
        let actor_id = this.actor_id;
        let vendor = game.actors.get(actor_id);
        // modify the inventory format into the flag format
        let flag_data = {}
        // this is a different iteration than the one below because we trigger a data update on the lower one and
        // we want the flag set before we trigger that
        for (let x = 0; x < inventory.length; x++) {
            let item = inventory[x];
            flag_data[item.item.name] = {
                price: item.price,
                roll: item.roll,
                dice_string: item.dice_string,
                image: item.item.image,
                compendium: item.item.compendium,
                flagged_id: item.item.id,
                restricted: item.item.restricted,
            }
        }
        // set up to delete items from the vendor
        let to_delete = [];
        for (let x = 0; x < vendor.data.items.length; x++) {
            to_delete.push(vendor.data.items[x]._id);
        }
        // set up to create the items for the vendor
        let to_create = [];
        for (let x = 0; x < inventory.length; x++) {
            let item = inventory[x].item;
            to_create.push(await game.packs.get(item.compendium).getEntity(item.id));
        }

        // add the price modifier so we can apply it to drag-and-dropped items
        // we could actually save all shop settings here, but I am too lazy to do that atm
        let location_mapping = {
            'minus_two': -2,
            'minus_one': -1,
            'no_change': 0,
            'plus_one': 1,
            'plus_two': 2,
            'plus_three': 3,
            'plus_four': 4
        };
        let price_mapping = {
            0: 1,
            1: 1,
            2: 2,
            3: 3,
            4: 4,
        }

        if (location_mapping[data['shop_location']] in price_mapping) {
            var price_modifier = price_mapping[location_mapping[data['shop_location']]];
        } else {
            // you can't have negative numbers as keys for some weirdo reason reeee
            var price_modifier = 1;
        }

        flag_data = {
            'items': flag_data,
            'meta': {
                'base_price': parseInt(data['shop_base_price']),
                'price_modifier': price_modifier,
            }
        };
        // set the extended data as a flag
        log(module_name, "Setting flag data: " + JSON.stringify(flag_data));
        // actually set the flag data
        vendor.setFlag("ffg-star-wars-enhancements", "vendor-data", flag_data);

        // actually delete the old items
        await vendor.deleteEmbeddedEntity(
            "OwnedItem",
            to_delete,
        );
        // actually create the new items
        await vendor.createEmbeddedEntity(
            "OwnedItem",
            to_create,
        );
    }
}

/*
Helper function to render the ShopGenerator UI
 */
export function open_shop_generator(actor_id=null) {
    log(module_name, "shop generator for " + actor_id);
    new ShopGenerator(actor_id).render(true);
}

/*
Super basic GUI to create a vendor
This probably isn't needed, but in the interest of increasing visibility of the functionality I wanted to make a GUI flow available
 */
class ShopCreator extends FormApplication {
    constructor(actor_id=null) {
        super();
        this.actor_id = actor_id;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/ffg-star-wars-enhancements/templates/shop/create.html",
            id: "ffg-star-wars-enhancements-shop-generator-create",
            title: "Shop Creator",
        });
    }

    async getData() {
        let actors = await get_player_actors();
        return {
            actors: actors,
        };
    }

    async _updateObject(event, data) {
        // ask for the name of the actor to create
        // create it, logging the ID
        // open the sheet and call open_shop_generator
        let actor = await game.ffg.ActorFFG.create({
            name: data['actor_name'],
            type: 'character',
        })
        // swap the sheet type to vendor
        // I'm not sure how to do it by default, but this seems reasonably fast
        game.actors.get(actor.id).setFlag("core", "sheetClass", "ffg.Vendor")
        new ShopGenerator(actor.id).render(true);
    }
}

/*
Helper function to render the shop creator
 */
export async function shop_creator() {
    new ShopCreator().render(true);
}
