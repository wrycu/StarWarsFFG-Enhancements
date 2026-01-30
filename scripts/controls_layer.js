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
        tools: {
            crawl: {
                name: game.i18n.localize("ffg-star-wars-enhancements.controls.opening-crawl.name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.controls.opening-crawl.title"),
                icon: "fas fa-journal-whills",
                button: true,
                onChange: () => {
                    select_opening_crawl();
                },
            },
            title_cards: {
                name: game.i18n.localize("ffg-star-wars-enhancements.controls.title-cards.name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.controls.title-cards.title"),
                icon: "fas fa-book",
                button: true,
                onChange: () => {
                    title_cards_dialog();
                },
            },
            datapad_journal: {
                name: game.i18n.localize("ffg-star-wars-enhancements.controls.new-journal-template.name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.controls.new-journal-template.title"),
                icon: "fas fa-book-medical",
                button: true,
                onChange: () => {
                    create_datapad_journal();
                },
            },
            shop_tool: {
                name: game.i18n.localize("ffg-star-wars-enhancements.shop.html.scene.name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.shop.html.scene.title"),
                icon: "fas fa-shopping-cart",
                button: true,
                onChange: () => {
                    shop_creator();
                },
            },
            hyperspace: {
                name: game.i18n.localize("ffg-star-wars-enhancements.controls.hyperspace.name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.controls.hyperspace.title"),
                icon: "fas fa-rocket",
                button: true,
                onChange: () => {
                    select_hyperspace();
                },
            },
            attack_animations: {
                name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.button-name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.button-title"),
                icon: "fas fa-bullseye",
                button: true,
                onChange: async () => {
                    await configure_attack_animation();
                },
            },
            custom_attack_animations: {
                name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.global-custom.button-name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.global-custom.button-title"),
                icon: "fa-duotone fa-bow-arrow",
                button: true,
                onChange: async () => {
                    await configure_custom_attack_animation();
                },
            }
        }
    };

    // grab the existing scene controls
    // update the built-in token section
    let additional_token_controls = controls.tokens;
    // add the hologram button
    additional_token_controls.tools["ffg-star-wars-holo"] = {
        name: game.i18n.localize("ffg-star-wars-enhancements.controls.holo.name"),
        title: game.i18n.localize("ffg-star-wars-enhancements.controls.holo.title"),
        icon: "fas fa-globe",
        button: true,
        onChange: () => {
            convert_to_hologram();
        },
    };

    // create the enhancements control section
    controls["ffg-star-wars-enhancement-controls"] = ffg_sw_enhancements_controls;
};
