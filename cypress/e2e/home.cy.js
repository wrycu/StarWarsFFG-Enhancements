describe.only("initialization", () => {
  it.only("completes", () => {
    cy.visit("/");

    // Accept the license agreement
    cy.url().then((url) => {
      if (url == `${Cypress.config("baseUrl")}/license`) {
        cy.get("#eula-agree").check();
        cy.get("#sign").click();
      }
    })

    // Enter the Admin key if not already logged in
    cy.url().then((url) => {
      if (url == `${Cypress.config("baseUrl")}/auth`) {
        cy.get('#key').type("test-admin-key{enter}");
      }
    })

    cy.url().then((url) => {
      if (url == `${Cypress.config("baseUrl")}/setup`) {
        // Install FFG System
        cy.get('.sheet-tabs > .active').then((el) => {
          if (el[0].dataset.tab == 'systems') {
            // Click Install System
            cy.get('.active > .setup-footer > .install-package').click();

            // Click Install for Star Wars FFG system
            cy.get('[data-package-id="starwarsffg"] > .package-controls > .install').click();

            cy.get('#notifications > .notification').contains('installed successfully', {timeout: 10000});
            // Close dialog
            cy.get('.header-button').click();
          }
        });

        // Navigate to install modules
        cy.get('.sheet-tabs > [data-tab="modules"]').click();

        // Cilck Install modules
        cy.get('.active > .setup-footer > .install-package').click();

        // Install fxmaster
        cy.get('[data-package-id="fxmaster"] > .package-controls > .install').click();
        cy.get('[data-package-id="lib-wrapper"] > .package-controls > .install').click();
        cy.get('[data-package-id="statuscounter"] > .package-controls > .install').click();

        cy.get('.sheet-tabs > [data-tab="worlds"]').click();

        // Open create world dialog
        cy.get('#create-world > label').click();

        // Name the system
        cy.get(':nth-child(1) > .form-fields > input').type('Integration Test World', {force: true});

        // Select the system
        cy.get('form > :nth-child(3) > .form-fields > select').select('Star Wars FFG');

        // Create the world
        cy.get('form > [type="submit"]').click();

        // Launch the world
        cy.get('.package-controls > [name="action"]').click();
      }
    });

    cy.visit(`${Cypress.config("baseUrl")}/join`);
    cy.url().should('eq', `${Cypress.config("baseUrl")}/join`);

    // Select game master
    cy.get('select').select("Gamemaster");

    // Join Game Session
    cy.get(':nth-child(1) > button').click();

    cy.url().should('eq', `${Cypress.config("baseUrl")}/game`);

    // Clear welcome message if it exists
    cy.get('.step-header > .step-button > .far').click();

    // Close warning
    cy.get('.dialog-button').click();

    // Close all notifications
    //cy.get('#notifications .close').click({ multiple: true })

    // Activate modules
    cy.get('[data-tab="settings"] > .fas').click();

    cy.get('[data-action="modules"]').click();

    cy.get('.package-overview > .package-title > .active').click({multiple: true});

    cy.get('footer.flexrow > [type="submit"]').click();

    cy.get('.window-content > .dialog-buttons > .yes').click({multiple: true});

    cy.get('[data-control="ffg-star-wars-enhancements"] > .fa').click();
  });
});