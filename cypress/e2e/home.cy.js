describe.only("empty spec", () => {
   it.only("passes", () => {
     cy.visit("/");
     cy.url().should('be.equal', `${Cypress.config("baseUrl")}/license`);
     // Temporary wait statement to make sure license page actually loads
     cy.wait(1000);
   });
 });
