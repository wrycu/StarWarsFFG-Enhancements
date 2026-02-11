import { select_opening_crawl } from "./opening_crawl.js";
import { title_cards_dialog } from "./title_cards.js";
import { select_hyperspace } from "./hyperspace.js";
import { create_datapad_journal } from "./datapads.js";
import { shop_creator } from "./shop.js";
import { configure_attack_animation, configure_custom_attack_animation } from "./animation.js";
import { convert_to_hologram } from "./hologram.js";

export const register_controls = (controls) => {
    if (canvas === null) {
        return;
    }
    const ffg_sw_enhancements_controls = {
        name: game.i18n.localize("ffg-star-wars-enhancements.controls.name"),
        title: game.i18n.localize("ffg-star-wars-enhancements.controls.title"),
        layer: "ffgenhancements",
        icon: "fa fa-jedi",
        visible: game.user.isGM,
        tools: {},
        activeTool: "",
        onChange: (event, active) => {
            // maybe need to do here something, idk
        }
    };
    
    // init enhancements controls tools
    {
        let crawlName = game.i18n.localize("ffg-star-wars-enhancements.controls.opening-crawl.name");
        ffg_sw_enhancements_controls.tools[crawlName] = {
            name: crawlName,
            title: game.i18n.localize("ffg-star-wars-enhancements.controls.opening-crawl.title"),
            icon: "fas fa-journal-whills",
            button: true,
            onChange: () => {
                select_opening_crawl();
            }
        };
        let titleCardsName = game.i18n.localize("ffg-star-wars-enhancements.controls.title-cards.name");
        ffg_sw_enhancements_controls.tools[titleCardsName] = {
            name: titleCardsName,
            title: game.i18n.localize("ffg-star-wars-enhancements.controls.title-cards.title"),
            icon: "fas fa-book",
            button: true,
            onChange: () => {
                title_cards_dialog();
            }
        };
        let datapadJournalName = game.i18n.localize("ffg-star-wars-enhancements.controls.new-journal-template.name");
        ffg_sw_enhancements_controls.tools[datapadJournalName] = {
            name: datapadJournalName,
            title: game.i18n.localize("ffg-star-wars-enhancements.controls.new-journal-template.title"),
            icon: "fas fa-book-medical",
            button: true,
            onChange: () => {
                create_datapad_journal();
            }
        };
        let shopToolName = game.i18n.localize("ffg-star-wars-enhancements.shop.html.scene.name");
        ffg_sw_enhancements_controls.tools[shopToolName] = {
            name: shopToolName,
            title: game.i18n.localize("ffg-star-wars-enhancements.shop.html.scene.title"),
            icon: "fas fa-shopping-cart",
            button: true,
            onChange: () => {
                shop_creator();
            }
        };
        let hyperspaceToolName = game.i18n.localize("ffg-star-wars-enhancements.controls.hyperspace.name");
        ffg_sw_enhancements_controls.tools[hyperspaceToolName] = {
            name: hyperspaceToolName,
            title: game.i18n.localize("ffg-star-wars-enhancements.controls.hyperspace.title"),
            icon: "fas fa-rocket",
            button: true,
            onChange: () => {
                select_hyperspace();
            },
        };
        let attackAnimationsToolName = game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.button-name");
        ffg_sw_enhancements_controls.tools[attackAnimationsToolName] = {
            name: attackAnimationsToolName,
            title: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.button-title"),
            icon: "fas fa-bullseye",
            button: true,
            onChange: async () => {
                await configure_attack_animation();
            }
        };
        let customAttackAnimationsToolName = game.i18n.localize("ffg-star-wars-enhancements.attack-animation.global-custom.button-name");
        ffg_sw_enhancements_controls.tools[customAttackAnimationsToolName] = {
            name: customAttackAnimationsToolName,
            title: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.global-custom.button-title"),
            icon: "fa-duotone fa-bow-arrow",
            button: true,
            onChange: async () => {
                await configure_custom_attack_animation();
            },
        };
    }
    // grab the existing scene controls
    // update the built-in token section
    let additional_token_controls = controls.tokens;
    // add the hologram button
    let holo_name = game.i18n.localize("ffg-star-wars-enhancements.controls.holo.name");
    additional_token_controls.tools[holo_name] = {
        name: holo_name,
        title: game.i18n.localize("ffg-star-wars-enhancements.controls.holo.title"),
        icon: "fas fa-globe",
        button: true,
        onChange: () => {
            convert_to_hologram();
        },
    };

    // create the enhancements control section
    let ffg_enhancements_name = game.i18n.localize("ffg-star-wars-enhancements.controls.name");
    controls[ffg_enhancements_name] = ffg_sw_enhancements_controls;
};
