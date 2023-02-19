describe("ffg-star-wars-enhancements opening crawl", () => {
    before(() => {
        cy.setup();
    });
    beforeEach(() => {
        cy.join();
        cy.initializeWorld();
        cy.waitUntilReady();
    });

    it("creates and launches an opening crawl", () => {
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
