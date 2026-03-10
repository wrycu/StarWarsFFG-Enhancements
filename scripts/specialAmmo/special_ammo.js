import { log_msg as log } from "../util.js";

const MODULE_ID = "ffg-star-wars-enhancements";
const FLAG_SPECIAL_AMMO = "special-ammo";
const FLAG_AMMO_DATA = "ammo-data";

const SETTING_ENABLE = "special-ammo-enable";
const SETTING_AUTO_DEPLETE = "special-ammo-auto-deplete";

export function init() {
    log("special_ammo", "Initializing");
    game.settings.register(MODULE_ID, SETTING_ENABLE, {
        name: game.i18n.localize("ffg-star-wars-enhancements.special-ammo.enable"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.special-ammo.enable-hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });
    game.settings.register(MODULE_ID, SETTING_AUTO_DEPLETE, {
        name: game.i18n.localize("ffg-star-wars-enhancements.special-ammo.auto-deplete"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.special-ammo.auto-deplete-hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });
    log("special_ammo", "Initialized");
}

export function ready() {
    log("special_ammo", "Ready");

    Hooks.on("renderItemSheet", async (app, html, data) => {
        if (!game.settings.get(MODULE_ID, SETTING_ENABLE)) return;
        const item = app.item ?? app.document;
        if (!item) return;

        if (item.type === "weapon") {
            await _injectWeaponAmmoUI(item, html);
        } else if (item.type === "gear") {
            await _injectGearAmmoUI(item, html);
        }
    });

    Hooks.on("renderChatMessage", async (message, html, messageData) => {
        if (!game.settings.get(MODULE_ID, SETTING_ENABLE)) return;
        if (!message.rolls || message.rolls.length === 0) return;
        // Prevent processing the same message twice
        if (html.find(".special-ammo-chat").length > 0) return;

        const roll = message.rolls[0];
        if (!roll.data || jQuery.isEmptyObject(roll.data)) return;

        const itemId = roll.data._id;
        if (!itemId) return;

        // Get actor from speaker
        const speakerActorId = message.speaker?.actor;
        if (!speakerActorId) return;

        const speakerTokenId = message.speaker?.token;
        let actor = speakerTokenId ? game.actors.tokens[speakerTokenId] : null;
        if (!actor) {
            actor = game.actors.get(speakerActorId);
        }
        if (!actor) return;

        const weapon = actor.items.get(itemId);
        if (!weapon || weapon.type !== "weapon") return;

        const flagData = weapon.getFlag(MODULE_ID, FLAG_SPECIAL_AMMO);
        if (!flagData?.hasSpecialAmmo) return;

        const selectedAmmoId = flagData.selectedAmmo;
        if (!selectedAmmoId) return;

        const ammoItem = actor.items.get(selectedAmmoId);
        if (!ammoItem) {
            log("special_ammo", "Selected ammo item no longer exists in inventory");
            return;
        }

        const ammoData = ammoItem.getFlag(MODULE_ID, FLAG_AMMO_DATA);
        if (!ammoData || !ammoData.canBeUsedAsAmmo) return;

        const description = ammoItem.system?.description || "";
        let newCurrent;
        let outOfAmmo = false;

        if (ammoData.ammoCurrent <= 0) {
            outOfAmmo = true;
            newCurrent = 0;
            log("special_ammo", `Out of ammo for ${ammoItem.name}`);
        } else {
            // Only decrement if this is our own roll (prevent other clients from decrementing too)
            if (message.author?.id === game.user.id) {
                newCurrent = ammoData.ammoCurrent - 1;
                ammoItem.setFlag(MODULE_ID, FLAG_AMMO_DATA, {
                    ...ammoData,
                    ammoCurrent: newCurrent,
                });
                log("special_ammo", `Used 1 ammo from ${ammoItem.name}. Remaining: ${newCurrent}/${ammoData.ammoMax}`);

                // Auto-deplete: if ammo reached 0, decrease item quantity and clear weapon selection
                if (newCurrent <= 0 && game.settings.get(MODULE_ID, SETTING_AUTO_DEPLETE)) {
                    const currentQty = ammoItem.system?.quantity?.value ?? ammoItem.system?.quantity ?? 0;
                    if (currentQty > 1) {
                        // Decrease quantity by 1, reset ammo to max
                        await ammoItem.update({ "system.quantity.value": currentQty - 1 });
                        await ammoItem.setFlag(MODULE_ID, FLAG_AMMO_DATA, {
                            ...ammoData,
                            ammoCurrent: ammoData.ammoMax,
                        });
                        log("special_ammo", `Depleted magazine for ${ammoItem.name}. Quantity: ${currentQty - 1}. Ammo reset to ${ammoData.ammoMax}.`);
                    } else {
                        // Last one — decrease quantity to 0
                        await ammoItem.update({ "system.quantity.value": 0 });
                        log("special_ammo", `Last magazine depleted for ${ammoItem.name}.`);
                    }
                }
            } else {
                newCurrent = ammoData.ammoCurrent;
            }
        }

        const templateData = {
            ammoName: ammoItem.name,
            ammoImg: ammoItem.img,
            description: description,
            ammoCurrent: newCurrent,
            ammoMax: ammoData.ammoMax,
            weaponName: weapon.name,
            outOfAmmo: outOfAmmo,
        };
        const ammoHtml = await renderTemplate(
            `modules/${MODULE_ID}/templates/specialAmmo/ammo_chat_message.html`,
            templateData
        );
        html.append(ammoHtml);
    });
}

/**
 * Get valid ammo items for a weapon from its owning actor.
 */
function _getValidAmmoItems(weapon) {
    const actor = weapon.actor;
    if (!actor) return [];

    const flagData = weapon.getFlag(MODULE_ID, FLAG_SPECIAL_AMMO);
    if (!flagData?.hasSpecialAmmo) return [];

    const filterStr = flagData.ammoFilter || "";
    const allowedNames = filterStr
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0);

    if (allowedNames.length === 0) return [];

    return actor.items.filter((item) => {
        if (item.type !== "gear") return false;
        const ammoData = item.getFlag(MODULE_ID, FLAG_AMMO_DATA);
        if (!ammoData?.canBeUsedAsAmmo) return false;
        return allowedNames.includes(item.name.toLowerCase());
    });
}

/**
 * Inject special ammo UI into weapon item sheet configuration tab.
 */
async function _injectWeaponAmmoUI(weapon, html) {
    const flagData = weapon.getFlag(MODULE_ID, FLAG_SPECIAL_AMMO) || {};
    const hasSpecialAmmo = flagData.hasSpecialAmmo || false;
    const ammoFilter = flagData.ammoFilter || "";
    let selectedAmmo = flagData.selectedAmmo || "";

    // Validate selected ammo still exists and is valid
    if (selectedAmmo && weapon.actor) {
        const validItems = _getValidAmmoItems(weapon);
        const stillValid = validItems.find((i) => i.id === selectedAmmo);
        if (!stillValid) {
            selectedAmmo = "";
            // Persist the cleared selection
            await weapon.setFlag(MODULE_ID, FLAG_SPECIAL_AMMO, {
                ...flagData,
                selectedAmmo: "",
            });
        }
    }

    // Get valid ammo items for the selector
    const ammoItems = hasSpecialAmmo ? _getValidAmmoItems(weapon) : [];

    const templateData = {
        hasSpecialAmmo,
        ammoFilter,
        selectedAmmo,
        ammoItems,
    };

    const rendered = await renderTemplate(
        `modules/${MODULE_ID}/templates/specialAmmo/weapon_special_ammo.html`,
        templateData
    );

    // Inject into configuration tab
    const configTab = html.find('.tab[data-tab="configuration"]');
    if (configTab.length) {
        configTab.append(rendered);
    }

    // Activate listeners
    const container = html.find(".special-ammo-settings");

    container.find('input[name="flags.special-ammo.hasSpecialAmmo"]').on("change", async (ev) => {
        const checked = ev.currentTarget.checked;
        await weapon.setFlag(MODULE_ID, FLAG_SPECIAL_AMMO, {
            ...weapon.getFlag(MODULE_ID, FLAG_SPECIAL_AMMO),
            hasSpecialAmmo: checked,
        });
    });

    container.find('input[name="flags.special-ammo.ammoFilter"]').on("change", async (ev) => {
        const value = ev.currentTarget.value;
        await weapon.setFlag(MODULE_ID, FLAG_SPECIAL_AMMO, {
            ...weapon.getFlag(MODULE_ID, FLAG_SPECIAL_AMMO),
            ammoFilter: value,
        });
    });

    container.find('select[name="flags.special-ammo.selectedAmmo"]').on("change", async (ev) => {
        const value = ev.currentTarget.value;
        await weapon.setFlag(MODULE_ID, FLAG_SPECIAL_AMMO, {
            ...weapon.getFlag(MODULE_ID, FLAG_SPECIAL_AMMO),
            selectedAmmo: value,
        });
    });
}

/**
 * Inject ammo data UI into gear item sheet.
 */
async function _injectGearAmmoUI(gear, html) {
    const flagData = gear.getFlag(MODULE_ID, FLAG_AMMO_DATA) || {};
    const canBeUsedAsAmmo = flagData.canBeUsedAsAmmo || false;
    const ammoMax = flagData.ammoMax ?? 0;
    const ammoCurrent = flagData.ammoCurrent ?? 0;

    const templateData = {
        canBeUsedAsAmmo,
        ammoMax,
        ammoCurrent,
    };

    const rendered = await renderTemplate(
        `modules/${MODULE_ID}/templates/specialAmmo/gear_ammo.html`,
        templateData
    );

    // Inject after the weapon-values container in gear sheet
    const weaponValues = html.find(".weapon-values").last();
    if (weaponValues.length) {
        weaponValues.after(rendered);
    } else {
        // Fallback: inject before sheet-body tabs
        const sheetBody = html.find(".sheet-body");
        if (sheetBody.length) {
            sheetBody.prepend(rendered);
        }
    }

    // Activate listeners
    const container = html.find(".gear-ammo-settings");

    container.find('input[name="flags.ammo-data.canBeUsedAsAmmo"]').on("change", async (ev) => {
        const checked = ev.currentTarget.checked;
        await gear.setFlag(MODULE_ID, FLAG_AMMO_DATA, {
            ...gear.getFlag(MODULE_ID, FLAG_AMMO_DATA),
            canBeUsedAsAmmo: checked,
        });
    });

    container.find('input[name="flags.ammo-data.ammoMax"]').on("change", async (ev) => {
        const value = parseInt(ev.currentTarget.value) || 0;
        await gear.setFlag(MODULE_ID, FLAG_AMMO_DATA, {
            ...gear.getFlag(MODULE_ID, FLAG_AMMO_DATA),
            ammoMax: value,
        });
    });

    container.find('input[name="flags.ammo-data.ammoCurrent"]').on("change", async (ev) => {
        const value = parseInt(ev.currentTarget.value) || 0;
        await gear.setFlag(MODULE_ID, FLAG_AMMO_DATA, {
            ...gear.getFlag(MODULE_ID, FLAG_AMMO_DATA),
            ammoCurrent: value,
        });
    });
}
