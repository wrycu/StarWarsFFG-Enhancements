describe("ffg-star-wars-enhancements quench", () => {
    before(() => {
        cy.setup();
    });
    beforeEach(() => {
        cy.join();
        cy.initializeWorld();
        cy.waitUntilReady();
    });

    it("passes quench tests", () => {
        cy.window().should("have.property", "quench");
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
});
