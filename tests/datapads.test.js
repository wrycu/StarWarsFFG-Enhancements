import { create_datapad_journal } from "../scripts/datapads.js";

export function batch(context) {
    const { describe, it, beforeEach, expect } = context;

    describe("Create datapad dialog", () => {
        beforeEach(() => {
            // Clean up state from partial test runs
            ["datapad", "bounty"].forEach((option) => {
                const datapad = game.journal.getName(option);
                if (datapad !== undefined) {
                    datapad.delete();
                }
            });
        });

        [
            { option: "datapad", needle: '<div class="swdatapad">' },
            { option: "bounty", needle: '<div class="swdatapad-wanted">' },
        ].forEach(({ option, needle }) => {
            it(`creates a new ${option} journal`, async () => {
                // Hook to capture when our dialog has actually rendered
                const rendered = $.Deferred();
                Hooks.once("renderApplication", (...args) => rendered.resolve(args));

                const dialog = await create_datapad_journal();

                const [application, $html] = await rendered.promise();

                // Sanity check the renderApplication hook returned our dialog
                expect(dialog).to.equal(application);

                // Hook to capture when new Journal has been rendered
                const created = $.Deferred();
                Hooks.once("renderJournalPageSheet", (...args) => created.resolve(args));

                // Dialog API does not expose methods for selection, using dom instead
                $html.find('select[name="template"]').val(option);
                $html.find("button.dialog-button.create").click();

                await created.promise();

                const datapad = game.journal.getName(option);
                expect(datapad).to.not.be.undefined;

                const page = datapad.pages?.values()?.next().value;
                expect(page).to.not.be.undefined;

                expect(page.text?.content).to.have.string(needle);

                datapad.delete();
            });
        });
    });
}
