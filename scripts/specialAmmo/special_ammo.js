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

export function hooks() {
    log("special_ammo", "Registering hooks");

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

        const rawDescription = ammoItem.system?.description || "";
        const description = rawDescription
            ? await TextEditor.enrichHTML(rawDescription)
            : "";
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

        const magazinesLeft = ammoItem.system?.quantity?.value ?? ammoItem.system?.quantity ?? 0;
        const qualities = (ammoItem.system?.itemmodifier || []).map((mod) => {
            const name = mod.name || "";
            const rank = parseInt(mod.system?.rank) || 0;
            return {
                label: rank ? `${name} ${rank}` : name,
                qualityId: mod._id || "",
            };
        });
        const templateData = {
            ammoName: ammoItem.name,
            ammoImg: ammoItem.img,
            description: description,
            ammoCurrent: newCurrent,
            ammoMax: ammoData.ammoMax,
            weaponName: weapon.name,
            outOfAmmo: outOfAmmo,
            magazinesLeft: magazinesLeft,
            qualities: qualities,
            ammoItemId: ammoItem.id,
            actorId: actor.id,
        };
        const ammoHtml = await renderTemplate(
            `modules/${MODULE_ID}/templates/specialAmmo/ammo_chat_message.html`,
            templateData
        );
        html.append(ammoHtml);

        // Lazy-load quality descriptions on hover
        html.find(".special-ammo-quality-pill").on("mouseenter", async function () {
            const pill = $(this);
            if (pill.data("tooltip-loaded")) return;
            const qualityId = pill.data("quality-id");
            const ammoId = pill.data("ammo-id");
            const actId = pill.data("actor-id");
            const act = game.actors.get(actId);
            if (!act) return;
            const ammo = act.items.get(ammoId);
            if (!ammo) return;
            const mod = (ammo.system?.itemmodifier || []).find((m) => m._id === qualityId);
            if (!mod) return;
            const desc = mod.system?.description || "";
            if (desc) {
                const enriched = await TextEditor.enrichHTML(desc);
                pill.attr("data-tooltip", enriched);
                pill.attr("data-tooltip-direction", "UP");
            }
            pill.data("tooltip-loaded", true);
        });
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

    // Inject qualities list when "can be used as ammo" is enabled
    if (canBeUsedAsAmmo) {
        await _injectGearQualities(gear, html);
    }
}

/**
 * Build summarized qualities from a gear item's itemmodifier array.
 */
function _summarizeQualities(gear) {
    const modifiers = gear.system?.itemmodifier || [];
    const qualities = [];

    for (let i = 0; i < modifiers.length; i++) {
        const mod = modifiers[i];
        const name = mod.name || "";
        const rank = parseInt(mod.system?.rank) || 0;
        const description = mod.system?.description || "";

        const existing = qualities.find((q) => q.name === name);
        if (existing) {
            existing.totalRanks += rank;
            existing.summarizedRanks["mods"] = (existing.summarizedRanks["mods"] || 0) + rank;
        } else {
            qualities.push({
                name: name,
                description: description,
                modId: mod._id || i.toString(),
                itemIndex: i,
                totalRanks: rank,
                summarizedRanks: { mods: rank },
                includeControls: true,
            });
        }
    }

    return qualities;
}

/**
 * Inject qualities list into gear item sheet and handle drag-drop + delete.
 */
async function _injectGearQualities(gear, html) {
    const qualities = _summarizeQualities(gear);

    const rendered = await renderTemplate(
        `modules/${MODULE_ID}/templates/specialAmmo/gear_qualities.html`,
        { qualities }
    );

    // Inject into the attributes tab
    const attributesTab = html.find('.tab[data-tab="attributes"]');
    if (attributesTab.length) {
        attributesTab.prepend(rendered);
    }

    // Handle edit quality
    html.find(".gear-ammo-quality-edit").on("click", async (ev) => {
        ev.stopPropagation();
        const li = $(ev.currentTarget).closest(".item");
        const clickedId = li.data("item-id");
        const clickedType = li.data("item-type");
        const parentObject = await fromUuid(gear.uuid);
        let clickedObject = parentObject.system[clickedType].find(i => i._id === clickedId);
        if (!clickedObject) {
            clickedObject = parentObject.system[clickedType].find(i => i.name === li.data("upgrade-name"));
        }
        const { itemEditor } = await import("../../../../systems/starwarsffg/modules/items/item-editor.js"); // TODO: if item-editor can be exported, we could've used less fragile import method, but should work so far
        const typeChoices = {};
        for (const key of Object.keys(CONFIG.FFG.itemmodifier_types)) {
            const entry = CONFIG.FFG.itemmodifier_types[key];
            typeChoices[entry.value] = game.i18n.localize(entry.label);
        }
        const data = {
            sourceObject: gear,
            clickedObject: clickedObject,
            typeChoices: typeChoices,
        };
        new itemEditor(data).render(true);
    });

    // Handle delete quality
    html.find(".gear-ammo-quality-delete").on("click", async (ev) => {
        const li = $(ev.currentTarget).closest(".item");
        const itemIndex = parseInt(li.data("item-index"));
        if (isNaN(itemIndex)) return;

        const modifiers = [...(gear.system.itemmodifier || [])];
        modifiers.splice(itemIndex, 1);
        await gear.update({ "system.itemmodifier": modifiers });
    });

    // Handle drag-drop for adding qualities
    const dropTarget = html.find(".gear-ammo-qualities")[0];
    if (dropTarget) {
        dropTarget.addEventListener("dragover", (ev) => {
            ev.preventDefault();
            ev.dataTransfer.dropEffect = "copy";
        });

        dropTarget.addEventListener("drop", async (ev) => {
            ev.preventDefault();
            let data;
            try {
                data = JSON.parse(ev.dataTransfer.getData("text/plain"));
            } catch (e) {
                return;
            }

            const droppedItem = await fromUuid(data.uuid);
            if (!droppedItem || droppedItem.type !== "itemmodifier") return;

            const modifiers = [...(gear.system.itemmodifier || [])];
            const existing = modifiers.find((m) => m.name === droppedItem.name);
            if (existing) {
                existing.system.rank = (
                    parseInt(existing.system.rank) + parseInt(droppedItem.system.rank)
                ).toString();
            } else {
                const newMod = droppedItem.toObject();
                newMod._id = foundry.utils.randomID();
                modifiers.push(newMod);
            }
            await gear.update({ "system.itemmodifier": modifiers });
        });
    }
}
