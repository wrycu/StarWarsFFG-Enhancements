class Shop {
    constructor(shady, black_market, specialization, min_items, max_items, location) {
        let specialization_mapping = {
            'general': [
                'world.oggdudearmor',
                'world.oggdudegear',
                'world.oggdudeweapons',
            ],
            'armor': [
                'world.oggdudearmor',
            ],
            'gear': [
                'world.oggdudegear',
            ],
            'weapon': [
                'world.oggdudeweapons',
            ],
            'nerf_herder': [
                'world.oggdudegear',
            ],
        };
        let location_mapping = {
            'primary_core_world': -2,
            'other_core_world': -1,
            'primary_trade_lane': -1,
            'colony_world': 0,
            'inner_rim_world': 0,
            'civilized_world': 0,
            'mid_rim_world': 1,
            'recently_settled_world': 1,
            'outer_rim_world': 2,
            'frontier_world': 2,
            'wild_space_world': 3,
            'uncivilized_world': 4
        };
        let price_mapping = {
            0: 1,
            1: 1,
            2: 2,
            3: 3,
            4: 4,
        }
        this.shady = false;
        this.compendiums = specialization_mapping['weapon'];
        this.min_items = 1;
        this.max_items = 1;
        this.location_modifier = location_mapping['uncivilized_world'];
        this.price_modifier = price_mapping[location_mapping['uncivilized_world']];
        this.incoming_skill = {
            'negotiation': '',
            'streetwise': '',
        };
        this.dice = "2da";
    }

    async shop() {
        /* generate random number */
        let generate_count = Math.floor((Math.random() * this.max_items) + this.min_items);
        let index_galaxy = 0;
        let possible_items_raw = [];
        /* build the raw item array */
        for (let i = 0; i < this.compendiums.length; i++) {
            let compendium_items = await game.packs.get(this.compendiums[i]).getData();
            for (let x = 0; x < compendium_items['index'].length; x++) {
                possible_items_raw.push({
                    'compendium': this.compendiums[i],
                    'item': compendium_items['index'][x],
                })
            }
        }
        console.log("found " + possible_items_raw.length + " possible raw items")
        /* select items and get their details */
        let selected_items = [];
        while (selected_items.length < generate_count) {
            /* look up the details and see if it makes the shop */
            let possible_item_index = Math.floor((Math.random() * possible_items_raw.length));
            // get item details
            console.log("heya, possible_items_raw debug info")
            console.log(possible_items_raw[0])
            console.log("item ID:")
            console.log(possible_items_raw[possible_item_index]['item']['_id'])
            console.log("compendium name:")
            console.log(possible_items_raw[possible_item_index]['compendium'])
            console.log("item:")
            console.log(possible_items_raw[possible_item_index]['item'])
            let possible_item = await game.packs.get(possible_items_raw[possible_item_index]['compendium']).getEntity(possible_items_raw[possible_item_index]['item']['_id']);
            // check if it's OK
            if (possible_item.data.data.rarity.isrestricted === true && this.shady === false){
                console.log("Rejected item " + possible_item.name + " (item is restricted and shady is not true)");
            } else {
                // todo: also check if the type meets our requirements for the type of store
                // path will be item.data.type

                let dice_string = this.dice + ' + ' + this.rarity_to_difficulty(possible_item.data.data.rarity.adjusted + this.location_modifier);
                // make the check to see if we find the item
                let result = new game.ffg.RollFFG(dice_string).roll().ffg;
                if (result['success'] >= 1) {
                    // we passed the check, count the item as added! woot!
                    /* build the result string */
                    let result_string = '';
                    for (let i = 0; i<result['success']; i++) {
                        result_string += '[su]';
                    }
                    for (let i = 0; i<result['advantage']; i++) {
                        result_string += '[ad]';
                    }
                    for (let i = 0; i<result['triumph']; i++) {
                        result_string += '[tr]';
                    }
                    for (let i = 0; i<result['threat']; i++) {
                        result_string += '[th]';
                    }
                    for (let i = 0; i<result['despair']; i++) {
                        result_string += '[de]';
                    }
                    selected_items.push({
                        'item': {
                            'id': possible_item.id,
                            'name': possible_item.name,
                            // items without images don't have this set, it seems (which means it isn't present at all, of course)
                            /*'image': possible_items_raw[possible_item_index['compendium']]['img'],*/
                            'type': possible_item.data.type,
                        },
                        'price': possible_item.data.data.price.adjusted * this.price_modifier,
                        'roll': result_string,
                        'dice_string': dice_string,
                    })
                } else {
                    console.log("Rejected item " + possible_item.name + " (failed check)");
                }
            }
            // remove the item from the possible item list
            possible_items_raw.splice(possible_item_index, 1);
        }
        console.log("Completed shop building!");
        console.log(selected_items);
    };

    rarity_to_difficulty(rarity) {
        if (rarity <= 10) {
            return String(Math.floor(rarity / 2)) + 'dd';
        } else if (rarity > 10) {
            let upgrade_count = rarity % 10;
            return String((5 - upgrade_count)) + 'dd + ' + String(upgrade_count) + 'dc';
        }
    }
}

myshop = new Shop(1, 1, 1, 1, 1, 1)
