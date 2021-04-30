import { ActorSheetFFGV2 } from "../../../systems/starwarsffg/modules/actors/actor-sheet-ffg-v2.js"
import {log_msg as log} from "./util.js";

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
            console.log(data.seller_id)
            console.log(data.item_id)
            let item = await game.actors.get(data.seller_id).getEmbeddedEntity("OwnedItem", data.item_id);
            console.log(item)
            await game.actors.get(data.buyer_id).createEmbeddedEntity("OwnedItem", item);
            // todo: remove the item from the inventory
            console.log("removing item from vendor")
            await game.actors.get(data.seller_id).deleteEmbeddedEntity("OwnedItem", data.item_id);
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

class Vendor extends ActorSheetFFGV2 {
    /* based extensively on https://github.com/jopeek/fvtt-loot-sheet-npc-5e/blob/master/lootsheetnpc5e.js */
    static get defaultOptions() {
        const options = super.defaultOptions;

        mergeObject(options, {
            classes: ["starwarsffg", "sheet", "actor", "v2", "ffg-sw-enhanced", "vendor"],
            template: "modules/ffg-star-wars-enhancements/templates/shop_generator_inventory_vendor.html",
            //template: "systems/starwarsffg/templates/actors/ffg-character-sheet.html",
            width: 710,
            height: 650,
            //tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "characteristics" }],
            scrollY: [".tableWithHeader", ".tab", ".skillsGrid"],
        });
        return options;
    }

    get template() {
        return "modules/ffg-star-wars-enhancements/templates/shop_generator_inventory_vendor.html";
    }

    async getData() {
        const sheetData = super.getData();

        // Prepare GM Settings
        //this._prepareGMSettings(sheetData.actor);

        // Prepare isGM attribute in sheet Data

        //console.log("game.user: ", game.user);
        //if (game.user.isGM) sheetData.isGM = true;
        //else sheetData.isGM = false;
        //console.log("sheetData.isGM: ", sheetData.isGM);
        //console.log(this.actor);

        /*
        let lootsheettype = await this.actor.getFlag("lootsheetnpc5e", "lootsheettype");
        if (!lootsheettype) await this.actor.setFlag("lootsheetnpc5e", "lootsheettype", "Loot");
        lootsheettype = await this.actor.getFlag("lootsheetnpc5e", "lootsheettype");
        */

        /*
        let priceModifier = 1.0;
        if (lootsheettype === "Merchant") {
            priceModifier = await this.actor.getFlag("lootsheetnpc5e", "priceModifier");
            if (typeof priceModifier !== 'number') await this.actor.setFlag("lootsheetnpc5e", "priceModifier", 1.0);
            priceModifier = await this.actor.getFlag("lootsheetnpc5e", "priceModifier");
        }
         */

        /*
        let totalWeight = 0;
        this.actor.data.items.forEach((item)=>totalWeight += Math.round((item.data.quantity * item.data.weight * 100) / 100));

        let totalPrice = 0;
        this.actor.data.items.forEach((item)=>totalPrice += Math.round((item.data.quantity * item.data.price * priceModifier * 100) / 100));

        let totalQuantity = 0;
        this.actor.data.items.forEach((item)=>totalQuantity += Math.round((item.data.quantity * 100) / 100));

        sheetData.lootsheettype = lootsheettype;
        sheetData.totalItems = this.actor.data.items.length;
        sheetData.totalWeight = totalWeight.toLocaleString('en');
        sheetData.totalPrice = totalPrice.toLocaleString('en') + " gp";
        sheetData.totalQuantity = totalQuantity;
        sheetData.priceModifier = priceModifier;
        sheetData.rolltables = game.tables.entities;
        sheetData.lootCurrency = game.settings.get("lootsheetnpc5e", "lootCurrency");
        sheetData.lootAll = game.settings.get("lootsheetnpc5e", "lootAll");
        */
        let store_inventory = [{"item":{"id":"PuZpoQ526x16hDGH","name":"Mon Calamari Spear Blaster (Spear)","image":"icons/svg/mystery-man.svg","type":"weapon","compendium":"world.oggdudeweapons","restricted":false},"price":1350,"roll":"<span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span>","dice_string":"6da+2dd"},{"item":{"id":"AK1zQdj959n4FM6E","name":"Jet Pack","image":"worlds/dev/images/packs/oggdudegear/GearJETPACK.png","type":"gear","compendium":"world.oggdudegear","restricted":false},"price":4500,"roll":"<span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span>","dice_string":"6da"},{"item":{"id":"QFKbITdF2LkE61ct","name":"Corellian Compound Bow (Stun)","image":"worlds/dev/images/packs/oggdudeweapons/WeaponCOMPBOWSTUN.png","type":"weapon","compendium":"world.oggdudeweapons","restricted":false},"price":200,"roll":"<span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span>","dice_string":"6da+2dd"},{"item":{"id":"NLvVkgtkA85pkImj","name":"Extra Reloads (Model 77 SmartTranq Rounds)","image":"icons/svg/mystery-man.svg","type":"gear","compendium":"world.oggdudegear","restricted":false},"price":500,"roll":"<span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span>","dice_string":"6da"},{"item":{"id":"tVhsOOJMbcxqVxvA","name":"Dolina Ring Seeds","image":"icons/svg/mystery-man.svg","type":"gear","compendium":"world.oggdudegear","restricted":false},"price":18000,"roll":"<span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span>","dice_string":"6da"},{"item":{"id":"g4UmqEiJAcKrkiAy","name":"Top-Loading Magazine","image":"/systems/starwarsffg/images/mod-weapon.png","type":"itemattachment","compendium":"world.oggdudeitemattachments"},"price":50,"roll":"<span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span>","dice_string":"6da"}];
        sheetData.inventory = store_inventory;
        // Return data for rendering
        return sheetData;
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers
    /* -------------------------------------------- */

    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
        super.activateListeners(html);
        // buy item
        html.find('.item-buy').click(ev => this._buyItem(ev));
        // refresh inventory
        html.find('.refresh').click(ev => this._refresh_stock(ev));
    }

    /* -------------------------------------------- */

    /**
     * Handle merchant settings change
     * @private
     */
     async _merchantSettingChange(event, html) {

    }

     /* -------------------------------------------- */

    /**
     * Handle merchant inventory update
     * @private
     */
     async _merchantInventoryUpdate(event, html) {

    }

        /* -------------------------------------------- */

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

        let item_id = await find_item_id(this.entity.id, item_name);
        console.log("(buy): detected buy attempt for item " + item_name + "; found ID: " + item_id)
        //const item = this.actor.getEmbeddedEntity("OwnedItem", item_id);

        let buy_packet = {
            type: "buy",
            buyer_id: game.user.data.character,
            seller_id: this.entity.id,
            price: item_price,
            item_id: item_id,
            quantity: 1,
            gm_id: target_gm.id,
        };
        console.log("sending buy packet")
        game.socket.emit('module.ffg-star-wars-enhancements', buy_packet);
    }

    async _refresh_stock(event, all = 0) {
        let store_inventory = [{"item":{"id":"PuZpoQ526x16hDGH","name":"Mon Calamari Spear Blaster (Spear)","image":"icons/svg/mystery-man.svg","type":"weapon","compendium":"world.oggdudeweapons","restricted":false},"price":1350,"roll":"<span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span>","dice_string":"6da+2dd"},{"item":{"id":"AK1zQdj959n4FM6E","name":"Jet Pack","image":"worlds/dev/images/packs/oggdudegear/GearJETPACK.png","type":"gear","compendium":"world.oggdudegear","restricted":false},"price":4500,"roll":"<span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span>","dice_string":"6da"},{"item":{"id":"QFKbITdF2LkE61ct","name":"Corellian Compound Bow (Stun)","image":"worlds/dev/images/packs/oggdudeweapons/WeaponCOMPBOWSTUN.png","type":"weapon","compendium":"world.oggdudeweapons","restricted":false},"price":200,"roll":"<span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span>","dice_string":"6da+2dd"},{"item":{"id":"NLvVkgtkA85pkImj","name":"Extra Reloads (Model 77 SmartTranq Rounds)","image":"icons/svg/mystery-man.svg","type":"gear","compendium":"world.oggdudegear","restricted":false},"price":500,"roll":"<span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span>","dice_string":"6da"},{"item":{"id":"tVhsOOJMbcxqVxvA","name":"Dolina Ring Seeds","image":"icons/svg/mystery-man.svg","type":"gear","compendium":"world.oggdudegear","restricted":false},"price":18000,"roll":"<span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span>","dice_string":"6da"},{"item":{"id":"g4UmqEiJAcKrkiAy","name":"Top-Loading Magazine","image":"/systems/starwarsffg/images/mod-weapon.png","type":"itemattachment","compendium":"world.oggdudeitemattachments"},"price":50,"roll":"<span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars success\">s</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span><span class=\"dietype starwars advantage\">a</span>","dice_string":"6da"}];
        console.log("REFRESHING STOCK LULZ")
        let vendor = game.actors.get(this.entity.id);
        console.log(vendor)
        // todo: see if we want to do this or if there's a better way to do it
        // it's being done because the ID of an item changes once you create it on a person from a compendium

        for (let x = 0; x < store_inventory.length; x++) {
            console.log("checking to see if we need to create item #" + x)
            let item = await game.packs.get(store_inventory[x].item.compendium).getEntity(store_inventory[x].item.id);
            console.log(item)
            if (vendor.getEmbeddedEntity("OwnedItem", item.id) === null) {
                console.log("creating item " + item.name)
                vendor.createEmbeddedEntity("OwnedItem", item);
            }
        }
    }
}
