/**
 * Visits document root and accepts the license if redirected to the accept
 * license page.
 */
function acceptsLicense() {
    cy.visit("/");
    cy.url().then((url) => {
        if (url != `${Cypress.config("baseUrl")}/license`) {
            return;
        }
        cy.get("#eula-agree").check();
        cy.get("#sign").click();
    });
}

/**
 * Visits document root and authenticates as an admin if redirected.
 */
function authenticatesAsAdmin() {
    cy.visit("/");
    cy.url().then((url) => {
        if (url != `${Cypress.config("baseUrl")}/auth`) {
            return;
        }
        cy.get("#key").type("test-admin-key{enter}");
    });
}

/**
 * Installs module, but it assumes already on the add-on modules tab of setup.
 */
function installsModule($moduleList, module) {
    // Module already installed
    if ($moduleList.find(`[data-package-id="${module}"]`).length) {
        return;
    }
    cy.get(`[data-package-id="${module}"] > .package-controls > .install`).click();
    cy.get("#notifications > .notification").contains("installed successfully", { timeout: 25000 });
}

/**
 * Handles setup of the system, modules, and world.
 */
function handlesSetup() {
    acceptsLicense();
    authenticatesAsAdmin();

    cy.visit("/");
    cy.url().then((url) => {
        if (url != `${Cypress.config("baseUrl")}/setup`) {
            return;
        }

        cy.get('.sheet-tabs > [data-tab="systems"]').click();
        cy.get("#system-list").then(($systemList) => {
            // System already installed
            if ($systemList.find('[data-package-id="starwarsffg"]').length) {
                return;
            }

            cy.get(".active > .setup-footer > .install-package").click();

            cy.get('[data-package-id="starwarsffg"] > .package-controls > .install').click();

            cy.get("#notifications > .notification").contains("installed successfully", { timeout: 25000 });

            cy.get(".header-button.close").click();
        });

        cy.get('.sheet-tabs > [data-tab="modules"]').click();
        cy.get("#module-list").then(($moduleList) => {
            cy.get(".active > .setup-footer > .install-package").click();

            cy.get(".package-list").should("have.length.gt", 1);

            installsModule($moduleList, "fxmaster");
            installsModule($moduleList, "lib-wrapper");
            installsModule($moduleList, "statuscounter");

            // For Quench tests
            installsModule($moduleList, "quench");

            // There's a quirk here where the close button isn't immediately ready to go. Double clicking just to hide it.
            cy.get("#install-package .header-button.close").dblclick();
            //cy.pause();
        });

        cy.get('.sheet-tabs > [data-tab="worlds"]').click();
        cy.get("#world-list").then(($worldList) => {
            // World already exists
            if ($worldList.find('[data-package-id="integration-test-world"]').length) {
                return;
            }

            cy.get("#create-world").click();

            // Something interrupts focus during the load, so forcing the typing
            cy.get('#world-config form input[name="title"]').type("Integration Test World", { force: true });

            cy.get('#world-config form select[name="system"]').select("Star Wars FFG");

            cy.get('#world-config form [type="submit"]').click();
        });

        // Launch the world
        cy.get('[data-package-id="integration-test-world"] button[data-action="launchWorld"]').click();
    });
}

/** Promise chain until notifications are closed */
function closeNotifications() {
    cy.get("#notifications").then(($notifications) => {
        if ($notifications.children().length) {
            // Clicking them in reverse order, because (I think) it avoids a problem
            // with the notification jumping up after the click.
            cy.get("#notifications .close").last().click();

            // Might introduce some brittleness, but I don't know a better way to work around this check right now.
            cy.wait(100);

            closeNotifications();
        }
    });
}

/**
 * This is a bit of a pain because these windows could not exist.
 */
function closeInitialPopups() {
    cy.get("body").then(($body) => {
        // Dismiss the initial tour on the world
        if ($body.find(".tour").length) {
            cy.get(".tour > .step-header > .step-button").click();
        }

        $body.find(".app > .window-header > .window-title").each((_, titleEl) => {
            const title = Cypress.$(titleEl).text();

            // Dismiss the warning related to not having all the plugins required
            // enabled. This matters on initial world load.
            if (title === "FFG Star Wars Enhancements") {
                cy.get(".app > .window-header > .window-title")
                    .contains("FFG Star Wars Enhancements")
                    .parent()
                    .parent()
                    .find(".dialog-button")
                    .click({ force: true }) // Forced because dialogs can overlap
                    .should("not.exist");

                // The above triggers a page reload due to it setting animations to off.
                cy.visit("/game");
                cy.url().should("eq", `${Cypress.config("baseUrl")}/game`);
                waitUntilReady();
            }

            // Dismiss a warning about running head of the foundry codebase
            if (title === "Warning") {
                cy.get(".app > .window-header > .window-title")
                    .contains("Warning")
                    .parent()
                    .parent()
                    .find(".dialog-button")
                    .click({ force: true }); // Forced because dialogs can overlap
            }
        });
    });
}

/**
 * Log in as a user
 */
function join(user = "Gamemaster") {
    //  If we try to join, but don't land on the join URL there is a problem
    cy.visit("/join");
    cy.url().should("eq", `${Cypress.config("baseUrl")}/join`);

    cy.get('select[name="userid"]').select(user);
    cy.get('button[name="join"').click();

    cy.url().should("eq", `${Cypress.config("baseUrl")}/game`);
}

function waitUntilReady() {
    // Verify that both the game and canvas are ready before continuing
    cy.window().its("game").and("have.property", "ready").and("be.true");
    cy.window().its("game").should("have.property", "canvas").and("have.property", "ready").and("be.true");

    // Re-add if the FFG system doesn't seem initialized as this is close to the
    // last thing added during initialization
    cy.get("#destinyMenu");

    // Fixed delay: Brittle, but has been used prior to using game.ready
    //cy.wait(10000);

    closeInitialPopups();
    closeNotifications();
}

function activateModules() {
    cy.get('#sidebar-tabs [data-tab="settings"]').click();
    cy.get('[data-action="modules"]').click();
    cy.get("#module-list li").should("have.length.gt", 1);

    cy.get("#module-list").then(($moduleList) => {
        // If things  are already checked, modules are already enabled
        if ($moduleList.find(":checked").length) {
            return;
        }

        cy.get('#module-list [data-module-id="ffg-star-wars-enhancements"]');
        cy.get('#module-list [data-module-id="ffg-star-wars-enhancements"] input[type="checkbox"]').check();

        // Accept the dialog to select all dependencies
        cy.get(".window-content > .dialog-buttons > .yes").click();

        // Enable Quench
        cy.get('#module-list [data-module-id="quench"] input[type="checkbox"]').check();

        // Save
        cy.get('#module-management footer button[type="submit"]').click();

        // Accept the dialog to reload
        cy.get(".window-content > .dialog-buttons > .yes").click();

        // The above triggers a page reload
        cy.visit("/game");
        cy.url().should("eq", `${Cypress.config("baseUrl")}/game`);
        waitUntilReady();
    });
}

/**
 * Initialize the world after logging in as the Gamemaster
 */
function initializeWorld() {
    waitUntilReady();
    activateModules();
}

describe("ffg-star-wars-enhancements", () => {
    before(() => {
        handlesSetup();
    });
    beforeEach(() => {
        join();
        initializeWorld();
    });

    it("passes quench tests", () => {
        waitUntilReady();

        cy.window().then(async (window) => {
            const quenchReports = Cypress.$.Deferred();
            window.Hooks.once("quenchReports", (reports) => {
                quenchReports.resolve(reports);
            });

            const runner = await window.quench.runBatches("**");
            const reports = JSON.parse((await quenchReports.promise()).json);

            console.log(reports);
            const errors = reports.failures.map((failure) => {
                return `${failure.fullTitle} (${failure.duration}ms): ${failure.err?.message}`;
            });
            if (errors.length > 0) {
                throw errors.join("\n");
            }

            expect(runner.stats.failures).to.equal(0); // Shouldn't be reachable
            expect(runner.stats.pending).to.equal(0);
            expect(runner.stats.tests).to.equal(runner.stats.passes);
        });
    });

    it("creates and launches an opening crawl", () => {
        waitUntilReady();

        // Clean-up crawls if they exist
        cy.get('#sidebar-tabs > [data-tab="journal"]').click();
        cy.get("#journal > .directory-list").then(($directoryList) => {
            if ($directoryList.find(".folder").length == 0) {
                return;
            }
            cy.get("#journal > .directory-list header h3").contains("Opening Crawls").rightclick();

            cy.get("#context-menu > .context-items > .context-item").contains("Delete All").click();

            // Confirm
            cy.get(".window-content > .dialog-buttons > .yes").click();
        });

        // Open the crawl dialog
        cy.get('[data-control="ffg-star-wars-enhancements"]').click();
        cy.get('[data-tool="opening-crawl"]').click();

        // Create a folder for the Opening Crawl journals
        cy.get(".window-content .yes").click();

        // Create a crawl
        cy.get("#ffg-star-wars-enhancements-opening-crawl-select .create").click();

        // Can't seem to close the journal at this point, so just minimize it to keep it out of view
        cy.get(".journal-entry > .window-header > .close").dblclick();

        cy.get('[data-control="ffg-star-wars-enhancements"]').click();
        cy.get('[data-tool="opening-crawl"]').click();

        // Launch the opening crawl
        cy.get('#ffg-star-wars-enhancements-opening-crawl-select form button[type="submit"]').each(($button) => {
            if ($button.text() == "Launch") {
                $button.click();
            }
        });

        cy.get("#ffg-star-wars-enhancements-opening-crawl").should("be.visible");

        // Verify the image at the bottom of the crawl exists
        cy.get("#ffg-star-wars-enhancements-opening-crawl .backgroundSpace img").should("exist");

        // Purely to capture some of the crawl on video
        cy.wait(10000);

        cy.get("#ffg-star-wars-enhancements-opening-crawl .header-button.close").click();
    });
});
