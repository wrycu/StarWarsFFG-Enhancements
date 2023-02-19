import { batch as datapad_batch } from "./datapads.test.js";

function registerQuenchTests(quench) {
    quench.registerBatch("ffg-star-wars-enhancements.datapads", datapad_batch);
}

export function init() {
    // Use Quench's ready hook to add our tests. This hook will never be triggered if Quench isn't loaded.
    Hooks.on("quenchReady", registerQuenchTests);
}
