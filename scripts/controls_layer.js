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
        tools: [
            {
                name: game.i18n.localize("ffg-star-wars-enhancements.controls.opening-crawl.name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.controls.opening-crawl.title"),
                icon: "fas fa-journal-whills",
                button: true,
                onClick: () => {
                    select_opening_crawl();
                },
            },
            {
                name: game.i18n.localize("ffg-star-wars-enhancements.controls.title-cards.name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.controls.title-cards.title"),
                icon: "fas fa-book",
                button: true,
                onClick: () => {
                    title_cards_dialog();
                },
            },
            {
                name: game.i18n.localize("ffg-star-wars-enhancements.controls.new-journal-template.name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.controls.new-journal-template.title"),
                icon: "fas fa-book-medical",
                button: true,
                onClick: () => {
                    create_datapad_journal();
                },
            },
            {
                name: game.i18n.localize("ffg-star-wars-enhancements.shop.html.scene.name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.shop.html.scene.title"),
                icon: "fas fa-shopping-cart",
                button: true,
                onClick: () => {
                    shop_creator();
                },
            },
            {
                name: game.i18n.localize("ffg-star-wars-enhancements.controls.hyperspace.name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.controls.hyperspace.title"),
                icon: "fas fa-rocket",
                button: true,
                onClick: () => {
                    select_hyperspace();
                },
            },
            {
                name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.button-name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.custom.button-title"),
                icon: "fas fa-bullseye",
                button: true,
                onClick: async () => {
                    await configure_attack_animation();
                },
            },
            {
                name: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.global-custom.button-name"),
                title: game.i18n.localize("ffg-star-wars-enhancements.attack-animation.global-custom.button-title"),
                icon: "fa-duotone fa-bow-arrow",
                button: true,
                onClick: async () => {
                    await configure_custom_attack_animation();
                },
            },
        ],
    };

    // grab the existing scene controls
    let additional_token_controls = controls[controls.findIndex((e) => e.name === "token")];
    // add the hologram button
    additional_token_controls["tools"].push({
        name: game.i18n.localize("ffg-star-wars-enhancements.controls.holo.name"),
        title: game.i18n.localize("ffg-star-wars-enhancements.controls.holo.title"),
        icon: "fas fa-globe",
        button: true,
        onClick: () => {
            convert_to_hologram();
        },
    });

    // create the enhancements control section
    //controls.splice(controls.findIndex(e => e.name === 'notes') + 1, 0, ffg_sw_enhancements_controls)
    // update the built-in token section
    controls.splice(
        controls.findIndex((e) => e.name === "token"),
        1,
        additional_token_controls
    );
    controls.push(ffg_sw_enhancements_controls);
};
