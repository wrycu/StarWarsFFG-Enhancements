describe("empty spec", () => {
   it("passes", () => {
     cy.visit("/");
     cy.url().should('be.equal', `${Cypress.config("baseUrl")}/license`);
   });
 });
