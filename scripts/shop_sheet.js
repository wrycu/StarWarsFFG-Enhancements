import { ActorSheetFFGV2 } from "../../../systems/starwarsffg/modules/actors/actor-sheet-ffg-v2.js"
import {log_msg as log} from "./util.js";
import {open_shop_generator} from "./shop.js"

export function init() {
    Actors.registerSheet("ffg", Vendor, {
        label: "ffg-sw-enhanced-vendor",
        makeDefault: false,
    });
}

export function ready() {
    console.log("shop sheet ready")
    game.socket.on('module.ffg-star-wars-enhancements', socket_listener);
}

async function socket_listener(data) {
    //log('socket', data);
    console.log("got packet")
    if (data.type === "buy") {
        console.log("Detected buy request")
        console.log(data)
        /* is the packet meant for us? */
        if (game.user.id === data.gm_id) {
            console.log("yes, this packet is for us, time to start decoding")
            let buyer = game.actors.get(data.buyer_id);
            let seller = game.actors.get(data.seller_id);
            if (data.compendium_item) {
                console.log("Non-compendium item")
                var item = await seller.getEmbeddedEntity("OwnedItem", data.item_id);
            } else {
                console.log("Compendium item")
                var item = await game.packs.get(data.compendium).getEntity(data.item_id);
                ChatMessage.create({
                    content: (
                        await getTemplate('modules/ffg-star-wars-enhancements/templates/shop/item_purchased.html')
                    )({actor: buyer.name, item: item.name, vendor: seller.name, price: data.price})
                });
            }
            // check to see if the buyer has enough credits to afford the item
            if (buyer.data.data.stats.credits.value < parseInt(data.price)) {
                console.log(buyer.name + " attempted to buy " + item.name + " but couldn't afford it!")
                ChatMessage.create({
                    content: '<a class="entity-link" draggable="true" data-entity="Actor" data-id="' + data.buyer_id + '">'
                        + buyer.name + "</a> tried to buy " + item.name + " from "
                        + '<a class="entity-link" draggable="true" data-entity="Actor" data-id="' + data.seller_id +  '">'
                        + seller.name + "</a> but couldn't afford the price of " + data.price + " credits!",
                });
            } else {
                console.log(item)
                await buyer.createEmbeddedEntity("OwnedItem", item);
                // todo: remove the item from the inventory
                console.log("removing item from vendor")
                await seller.deleteEmbeddedEntity("OwnedItem", data.item_id);
                /* this doesn't seem to actually get reflected on the character sheet */
                buyer.data.data.stats.credits.value -= parseInt(data.price);
                ChatMessage.create({
                    content: '<a class="entity-link" draggable="true" data-entity="Actor" data-id="' + data.buyer_id + '">'
                        + buyer.name + "</a> bought " + item.name + " from " +
                        '<a class="entity-link" draggable="true" data-entity="Actor" data-id="' + data.seller_id +  '">'
                        + seller.name + "</a> for " + data.price + " credits! (make sure to deduct the credits from your sheet)",
                });
            }

        } else {
            console.log("rejected message as it isn't for us")
            console.log(game.user.id)
            console.log(data.gm_id)
        }
    }
}

async function find_item_id(actor_id, item_name) {
    let vendor = game.actors.get(actor_id);
    for (let x = 0; x < vendor.data.items.length; x++) {
        if (vendor.data.items[x].name === item_name) {
            return vendor.data.items[x]._id;
        }
    }
    return null;
}

export class Vendor extends ActorSheetFFGV2 {
    /* based extensively on https://github.com/jopeek/fvtt-loot-sheet-npc-5e/blob/master/lootsheetnpc5e.js */
    static get defaultOptions() {
        const options = super.defaultOptions;

        mergeObject(options, {
            classes: ["starwarsffg", "sheet", "actor", "v2", "ffg-sw-enhanced", "vendor"],
            template: "modules/ffg-star-wars-enhancements/templates/shop/inventory.html",
            width: 710,
            height: 650,
            scrollY: [".inventory", ".vendor_item"],
        });
        return options;
    }

    get template() {
        return "modules/ffg-star-wars-enhancements/templates/shop/inventory.html";
    }

    async getData() {
        const sheetData = super.getData();
        let vendor_data = this.entity.getFlag("ffg-star-wars-enhancements", "vendor-data");
        // temporary to avoid having to refactor a bunch of code below
        let vendor_meta_data = vendor_data['meta'];
        vendor_data = vendor_data['items'];

        console.log("GETTING DATA")
        console.log(this.entity.data.items)
        let inventory_data = [];
        for (let x = 0; x < this.entity.data.items.length; x++) {
            /* merge the flag data with the inventory data so we can render it in the template */
            let item = this.entity.data.items[x];
            if (this.entity.data.items[x].name in vendor_data) {
                let stupid_id = this.entity.getOwnedItem(item._id);
                console.log(stupid_id)
                console.log(stupid_id.id)
                console.log("flagged item")
                console.log(vendor_data[item.name].flagged_id)
                console.log(item.flags.ffgTempId)
                console.log({
                    name: item.name,
                    id: vendor_data[item.name].flagged_id,
                    compendium: vendor_data[item.name].compendium,
                    image: vendor_data[item.name].image,
                    price: vendor_data[item.name].price,
                    roll: vendor_data[item.name].roll,
                    type: item.type,
                    restricted: item.restricted,
                })
                inventory_data.push({
                    name: item.name,
                    id: vendor_data[item.name].flagged_id,
                    compendium: vendor_data[item.name].compendium,
                    image: vendor_data[item.name].image,
                    price: vendor_data[item.name].price,
                    roll: vendor_data[item.name].roll,
                    type: item.type,
                    restricted: item.restricted,
                    flagged: true,
                })
            } else {
                console.log("non-flagged item")
                console.log(item)
                let price = (parseInt(item.data.price.value) * vendor_meta_data['price_modifier']) * (vendor_meta_data['base_price'] / 100);
                inventory_data.push({
                    name: item.name,
                    id: item.flags.ffgTempId,
                    image: item.img,
                    price: price,
                    roll: "Manually Added", // manually added item,
                    type: item.type,
                    restricted: item.data.rarity.isrestricted,
                    flagged: false,
                })
            }
        }
        let tmp_sheet_data = {
            'inventory': inventory_data,
            'meta': {
                'is_gm': game.user.isGM,
            },
        }
        console.log(tmp_sheet_data)
        sheetData.inventory = tmp_sheet_data;
        return sheetData;
    }

    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
        super.activateListeners(html);
        // buy item
        html.find('.item-buy').click(ev => this._buyItem(ev));
        // remove item from inventory
        html.find('.item-remove').click(ev => this._remove_item(ev));
        // refresh inventory
        html.find('.refresh').click(ev => this._refresh_stock(ev));
    }

    /**
     * Handle buy item
     * @private
     */
    async _buyItem(event, all = 0) {
        event.preventDefault();
        console.log("buy item or something")
        console.log(event)
        console.log($(event.currentTarget).parents(".item"))
        console.log(this)

        /* validate that the game is set up on a good manner */
        let target_gm = null;
        game.users.forEach((user) => {
            if (user.isGM && user.active && user.viewedScene === game.user.viewedScene) {
                target_gm = user;
            }
        });
        if (!target_gm) {
            return ui.notifications.error("No active GM on your scene, they must be online and on the same scene to purchase an item.");
        }

        //if (this.token === null) {
        //    return ui.notifications.error(`You must purchase items from a token.`);
        //}
        if (!game.user.data.character) {
            console.log("Loot Sheet | No active character for user");
            return ui.notifications.error(`No active character for user.`);
        }

        let item_name = $(event.currentTarget).parents(".item").attr("data-item-name");
        let item_price = $(event.currentTarget).parents(".item").attr("data-item-price");
        let compendium_item = $(event.currentTarget).parents(".item").attr("data-item-type");
        let compendium = $(event.currentTarget).parents(".item").attr("data-item-compendium");

        let item_id = await find_item_id(this.entity.id, item_name);
        console.log("(buy): detected buy attempt for item " + item_name + "; found ID: " + item_id)

        let buy_packet = {
            type: "buy",
            buyer_id: game.user.data.character,
            seller_id: this.entity.id,
            price: item_price,
            item_id: item_id,
            quantity: 1,
            gm_id: target_gm.id,
            compendium_item: compendium_item,
            compendium: compendium,
        };
        console.log("sending buy packet")
        console.log(buy_packet)
        game.socket.emit('module.ffg-star-wars-enhancements', buy_packet);
    }

    /**
     * Handle delete item
     * @private
     */
    async _remove_item(event, all = 0) {
        event.preventDefault();
        console.log("remove item or something")
        let item_name = $(event.currentTarget).parents(".item").attr("data-item-name");
        let item_id = await find_item_id(this.entity.id, item_name);
        await game.actors.get(this.entity.id).deleteEmbeddedEntity("OwnedItem", item_id);
    }

    async _refresh_stock(event, all = 0) {
        log("refreshing stock for " + this.entity.id)
        open_shop_generator(this.entity.id);
    }
}