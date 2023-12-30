import { log_msg as log } from "./util.js";
import { update_status } from "./talent_checker.js";

let module_name = "minionsize_sync";

export function minionsize_sync(source, ...args) {
    // check if the user is a GM and that the setting is enabled
    if (game.user.isGM && game.settings.get("ffg-star-wars-enhancements", "minionsize-sync-enable")) {
        try {
            /*
                We can't modify tokens that aren't currently rendered, so we hook the update actor AND scene load calls AND token creation
                (and handle each a different way)
             */
            let minionSize = null;

            if (source === "createToken") {
                let tokenDoc = args[0]; // minion info
                if (tokenDoc.actor.type === "minion") {
                    minionSize = tokenDoc?.actor?.system?.quantity?.value;
                    update_minion_status(tokenDoc.object, minionSize);
                }
            } else if (source === "updateActor") {
                let actor = args[0]; //actor info
                minionSize = actor?.system?.quantity?.value;
                if (minionSize !== undefined) {
                    let tokens;

                    // check if token is linked or unlinked to the main actor
                    if (actor.prototypeToken.actorLink) {
                        log(module_name, "Updating every linked tokens on canvas");
                        tokens = canvas.tokens.placeables.filter(
                            (searchedtoken) =>
                                searchedtoken.document.actorId === actor.id && searchedtoken.document.actorLink
                        );
                        // Updating every token related
                        for (var x = 0; x < tokens.length; x++) {
                            log(module_name, `found token for ${tokens[x].name}`);
                            update_minion_status(tokens[x], minionSize);
                        }
                    } else {
                        log(module_name, "Updating an unlinked token");
                        let token = canvas.tokens.placeables.find(
                            (searchedtoken) => searchedtoken.actor._id === actor._id
                        );
                        update_minion_status(token, minionSize);
                    }
                } else {
                    log(module_name, "Minion size not found.");
                }
            } else if (source === "canvasReady") {
                log(module_name, "caught scene-transition, looking for minions");
                let tokens = canvas.tokens.placeables.filter(
                    (searchedtoken) => searchedtoken.document.actor.type == "minion"
                );
                for (var x = 0; x < tokens.length; x++) {
                    let token = tokens[x];
                    minionSize = token?.document?._actor?.system?.quantity.value;
                    update_minion_status(token, minionSize);
                }
            } else {
                log(module_name, "Unidentified source for minionsize update");
            }
        } catch (exception) {
            // something went wrong, bail (silently)
            log(module_name, "Failed to sync minionsize : " + exception);
        }
    }
}

// Update the status icon for a minion
async function update_minion_status(token, minionSize) {
    // pull the path of the status to apply
    let status = game.settings.get("ffg-star-wars-enhancements", "minionsize-sync-status");
    let status_zero = game.settings.get("ffg-star-wars-enhancements", "minionsize-sync-status-zero");

    if (minionSize !== undefined) {
        // If no minions are left, let's show a special status icon and remove it otherwise
        if (minionSize < 1) {
            await update_status(token, 0, status);
            //re-creates status_zero for no value "1" be shown on update
            await update_status(token, 1, status_zero);
        } else {
            await update_status(token, 0, status_zero);
            if (minionSize === 1) {
                // Sometimes, Rivals are imported as minions (swa,...) if quantity is one, no icons are set
                await update_status(token, 0, status);
            } else {
                await update_status(token, minionSize, status);
            }
        }
        log(module_name, `Updating token with ${minionSize} minionsize uses`);
    }
}
