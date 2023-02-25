import { clear_chat, cleanup_actors } from "../support/common.js";

/***
 * Rolls the specified skill within an open actor sheet
 * @param skill_name
 */
function roll_skill(skill_name) {
    cy.get('.sheet-tabs > [data-tab="items"]').click();
    cy.get(":nth-child(2) > .items-header > .header-name").should("be.visible");
    cy.get('.sheet-tabs > [data-tab="characteristics"]').click();
    // not sure why force is needed, but using just .click results in the characteristics in the sheet disappearing
    cy.get(`[data-ability="${skill_name}"] .roll-button > :nth-child(1)`).click({ force: true });
    cy.get(":nth-child(5) > summary").click(); // expand the fixed results tab
    cy.get(".pool-additional-container > tbody > :nth-child(2) > :nth-child(2) > input")
        .click()
        .click()
        .click()
        .click()
        .click(); // click 5 times to add 5 advantage, so we always have at least 1
    // roll the dice
    cy.get(".btn").click();
}

describe("ffg-star-wars-enhancements dice helper", () => {
    beforeEach(() => {
        cy.join();
        cy.waitUntilReady();
    });

    it("creates and stats an actor, then generates and clicks dice helper button", () => {
        clear_chat();
        cleanup_actors();
        /*
            Create an actor and give it stats, so we can roll
         */
        cy.get("#actors > .directory-header > .header-actions > .create-document").click();
        cy.get(".form-fields > input").type("dice roller test actor", { force: true });
        cy.get(".dialog-button").click();
        cy.get(".window-app.actor").should("exist").and("be.visible");

        cy.get('.sheet-tabs > [data-tab="items"]').click();
        cy.get(":nth-child(2) > .items-header > .header-name").should("be.visible");
        cy.get('.sheet-tabs > [data-tab="characteristics"]').click();

        cy.get('[data-ability="Brawn"] > .characteristic > .characteristic-value > input').type("{backspace}2");
        cy.get('[data-ability="Brawn"] > .characteristic > .characteristic-value > input').blur();

        cy.get('.sheet-tabs > [data-tab="items"]').click();
        cy.get(":nth-child(2) > .items-header > .header-name").should("be.visible");
        cy.get('.sheet-tabs > [data-tab="characteristics"]').click();

        cy.get('[data-ability="Agility"] > .characteristic > .characteristic-value > input').type("{backspace}2");
        cy.get('[data-ability="Agility"] > .characteristic > .characteristic-value > input').blur();

        /*
            Actually perform the rolls and click the resulting button
        */
        roll_skill("Brawl");
        cy.get(".fa-comments").click(); // navigate to the chat tab
        cy.get(".effg-die-result").should("be.visible").click();
        cy.get(".dice_helper").contains("for spending result");

        clear_chat();
        roll_skill("Ranged: Light");
        cy.get(".fa-comments").click();
        cy.get(".effg-die-result").should("be.visible").click();
        cy.get(".dice_helper").contains("for spending result");
        cleanup_actors();
    });
});
