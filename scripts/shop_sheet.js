import { ActorSheetFFGV2 } from "../../../systems/starwarsffg/modules/actors/actor-sheet-ffg-v2.js";
import { log_msg as log } from "./util.js";
import { open_shop_generator } from "./shop.js";
import ImportHelpers from "../../../systems/starwarsffg/modules/importer/import-helpers.js";

let module_name = "shop_sheet";

/* Register the vendor sheet */
export function init() {
    log(module_name, "Registering sheet");
    Actors.registerSheet("ffg", Vendor, {
        label: "ffg-sw-enhanced-vendor",
        makeDefault: false,
    });
    game.settings.register("ffg-star-wars-enhancements", "general_shop_compendiums", {
        name: game.i18n.localize("ffg-star-wars-enhancements.shop.setting.general.name"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.shop.setting.general.hint"),
        scope: "world",
        config: true,
        type: String,
        default:
            "world.oggdudearmor,world.oggdudegear,world.oggdudeweapons,world.oggdudegenericattachments",
    });
    game.settings.register("ffg-star-wars-enhancements", "armor_shop_compendiums", {
        name: game.i18n.localize("ffg-star-wars-enhancements.shop.setting.armor.name"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.shop.setting.armor.hint"),
        scope: "world",
        config: true,
        type: String,
        default: "world.oggdudearmor,world.oggdudearmorattachments",
    });
    game.settings.register("ffg-star-wars-enhancements", "gear_shop_compendiums", {
        name: game.i18n.localize("ffg-star-wars-enhancements.shop.setting.gear.name"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.shop.setting.gear.hint"),
        scope: "world",
        config: true,
        type: String,
        default: "world.oggdudegear,world.oggdudegenericattachments",
    });
    game.settings.register("ffg-star-wars-enhancements", "weapon_shop_compendiums", {
        name: game.i18n.localize("ffg-star-wars-enhancements.shop.setting.weapon.name"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.shop.setting.weapon.hint"),
        scope: "world",
        config: true,
        type: String,
        default: "world.oggdudeweapons,world.oggdudeweaponattachments",
    });
}

/*
Configures the socket listener used for purchasing items
 */
export function ready() {
    log(module_name, "Setting up socket listener");
    game.socket.on("module.ffg-star-wars-enhancements", socket_listener);
}

/*
Socket data handler which transfers items to the purchaser
 */
async function socket_listener(data) {
    if (data.type === "buy") {
        log(module_name, "Detected buy request");
        /* is the packet meant for us? */
        if (game.user.id === data.gm_id) {
            log(module_name, "This packet is intended for me, decoding");
            // pull out basic information we'll be referencing a bunch
            let buyer = game.actors.get(data.buyer_id._id);
            let seller = game.actors.get(data.seller_id);
            if (data.compendium_item) {
                var item = await seller.getEmbeddedDocument("Item", data.item_id);
            } else {
                var item = await game.packs.get(data.compendium).getDocument(data.item_id);
            }
            // check to see if the buyer has enough credits to afford the item
            if (buyer.system.stats.credits.value < parseInt(data.price)) {
                ChatMessage.create({
                    content:
                        '<a class="content-link" draggable="true" data-type="Actor" data-uuid="' +
                        buyer.uuid +
                        '" data-id="' +
                        data.buyer_id._id +
                        '">' +
                        buyer.name +
                        "</a> tried to buy " +
                        item.name +
                        " from " +
                        '<a class="content-link" draggable="true" data-entity="Actor" data-uuid="' +
                        seller.uuid +
                        '" data-id="' +
                        data.seller_id +
                        '">' +
                        seller.name +
                        "</a> but couldn't afford the price of " +
                        data.price +
                        " credits!",
                });
            } else {
                await buyer.createEmbeddedDocuments("Item", [item]);
                await seller.deleteEmbeddedDocuments("Item", [data.item_id]);
                /* this doesn't seem to actually get reflected on the character sheet */
                buyer.system.stats.credits.value -= parseInt(data.price);
                ChatMessage.create({
                    content:
                        '<a class="content-link" draggable="true" data-entity="Actor" data-uuid="' +
                        buyer.uuid +
                        '" data-id="' +
                        data.buyer_id._id +
                        '">' +
                        buyer.name +
                        "</a> bought " +
                        item.name +
                        " from " +
                        '<a class="content-link" draggable="true" data-entity="Actor" data-uuid="' +
                        buyer.uuid +
                        '" data-id="' +
                        data.seller_id +
                        '">' +
                        seller.name +
                        "</a> for " +
                        data.price +
                        " credits! (make sure to deduct the credits from your sheet)",
                });
            }
        } else {
            log(module_name, "rejected message as it isn't for us");
        }
    }
}

/*
Helper function to convert an item name to the item ID
 */
async function find_item_id(actor_id, item_name) {
    let vendor = game.actors.get(actor_id);
    let items = vendor.items.filter((item) => item);
    for (let x = 0; x < items.length; x++) {
        if (items[x].name === item_name) {
            return items[x].id;
        }
    }
    return null;
}

/*
Sets up a sheet for rendering our wonderful shop
 */
export class Vendor extends ActorSheetFFGV2 {
    /* based extensively on https://github.com/jopeek/fvtt-loot-sheet-npc-5e/blob/master/lootsheetnpc5e.js */
    static get defaultOptions() {
        const options = super.defaultOptions;

        foundry.utils.mergeObject(options, {
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
        const sheetData = await super.getData();
        let vendor_data = this.document.getFlag("ffg-star-wars-enhancements", "vendor-data");
        // validate that we got flag data before trying to index into it
        if (vendor_data === undefined || vendor_data === null) {
            var vendor_meta_data = {
                base_price: 100,
                price_modifier: 1,
            };
            vendor_data = {};
        } else {
            // temporary to avoid having to refactor a bunch of code below
            var vendor_meta_data = vendor_data["meta"];
            vendor_data = vendor_data["items"];
        }
        log(module_name, "Retrieving data for " + this.document.id);

        let inventory_data = [];
        let items = this.document.items.filter((item) => item);
        for (let x = 0; x < items.length; x++) {
            /* merge the flag data with the inventory data so we can render it in the template */
            let item = items[x];
            if (item.name in vendor_data) {
                log(module_name, "Detected item with flag data set");
                log(module_name, JSON.stringify(item));
                log(module_name, JSON.stringify(vendor_data[item.name]));
                inventory_data.push({
                    name: item.name,
                    id: vendor_data[item.name].flagged_id,
                    compendium: vendor_data[item.name].compendium,
                    image: vendor_data[item.name].image,
                    price: vendor_data[item.name].price,
                    msrp: vendor_data[item.name].msrp,
                    roll: vendor_data[item.name].roll,
                    type: item.type,
                    restricted: vendor_data[item.name].restricted,
                    flagged: true,
                });
            } else {
                log(module_name, "Detected item with NO flag data set");
                log(module_name, JSON.stringify(item));
                // this was a drag-and-dropped item. figure out the price on the fly
                let price =
                    parseInt(item.system.price.value) *
                    vendor_meta_data["price_modifier"] *
                    (vendor_meta_data["base_price"] / 100);
                let id = item.id;
                inventory_data.push({
                    name: item.name,
                    id: id,
                    image: item.img,
                    price: price,
                    msrp: item.system.price.value,
                    roll: "Manually Added",
                    type: item.type,
                    restricted: item.system.rarity.isrestricted,
                    flagged: false,
                });
            }
        }
        // thought of adding this stuff later on. could have refactored the code to make it more first-class, but I'm too lazy
        let tmp_sheet_data = {
            inventory: inventory_data,
            meta: {
                is_gm: game.user.isGM,
            },
        };
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
        html.find(".item-buy").click((ev) => this._buy_item(ev));
        // remove item from inventory
        html.find(".item-remove").click((ev) => this._remove_item(ev));
        // refresh inventory
        html.find(".refresh").click((ev) => this._refresh_stock(ev));

        // Copied code from the character sheet, because original item-edit
        // handler is only applied if the user is an owner of the actor. Since
        // vendors are assigned as observers, not owners, we need to duplicate
        // the code in this hook.
        html.find(".item-view").click(async (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const li = $(ev.currentTarget).parents(".item");
            let itemId = li.data("itemId");
            let item = this.actor.items.get(itemId);
            if (!item) {
                item = game.items.get(itemId);

                if (!item) {
                    item = await ImportHelpers.findCompendiumEntityById("Item", itemId);
                }
            }
            if (item?.sheet) {
                item.sheet.render(true);
            }
        });
    }

    /**
     * Handle buy item
     * @private
     */
    async _buy_item(event, all = 0) {
        event.preventDefault();
        log(module_name, "Detected buy item attempt");

        /* validate that the game is set up on a good manner */
        let target_gm = null;
        game.users.forEach((user) => {
            if (user.isGM && user.active) {
                target_gm = user;
            }
        });
        if (!target_gm) {
            return ui.notifications.error("No active GM on your scene, they must be online to purchase an item.");
        }

        if (!game.user.character) {
            return ui.notifications.error(`No active character for user.`);
        }

        // read item data from the HTML
        // VERY secure :p
        let item_name = $(event.currentTarget).parents(".item").attr("data-item-name");
        let item_price = $(event.currentTarget).parents(".item").attr("data-item-price");
        let compendium_item = $(event.currentTarget).parents(".item").attr("data-item-type");
        let compendium = $(event.currentTarget).parents(".item").attr("data-item-compendium");

        let item_id = await find_item_id(this.document.id, item_name);

        let buy_packet = {
            type: "buy",
            buyer_id: game.user.character,
            seller_id: this.document.id,
            price: item_price,
            item_id: item_id,
            quantity: 1,
            gm_id: target_gm.id,
            compendium_item: compendium_item,
            compendium: compendium,
        };
        log(module_name, "Sending buy packet with contents");
        log(module_name, buy_packet);
        game.socket.emit("module.ffg-star-wars-enhancements", buy_packet);
    }

    /**
     * Handle delete item
     * @private
     */
    async _remove_item(event, all = 0) {
        event.preventDefault();
        let item_name = $(event.currentTarget).parents(".item").attr("data-item-name");
        let item_id = await find_item_id(this.document.id, item_name);
        await game.actors.get(this.document.id).deleteEmbeddedDocuments("Item", [item_id]);
    }

    async _refresh_stock(event, all = 0) {
        log(module_name, "refreshing stock for " + this.document.id);
        open_shop_generator(this.document.id);
    }
}
