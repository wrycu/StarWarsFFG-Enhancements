import { log_msg as log } from "./util.js";
import { update_status } from "./talent_checker.js";

let module_name = "stim_sync";

export function stim_sync(source, ...args) {
    // check if the user is a GM and that the setting is enabled
    if (game.user.isGM && game.settings.get("ffg-star-wars-enhancements", "stimpack-sync-enable")) {
        try {
            // pull the path of the status to apply
            let status = game.settings.get("ffg-star-wars-enhancements", "stimpack-sync-status");
            /*
                We can't modify tokens that aren't currently rendered, so we hook the update actor AND scene load calls
                (and handle each a different way)
             */
            if (source === "updateActor") {
                let our_args = args[1]; // medical use info
                if (
                    our_args &&
                    our_args.hasOwnProperty("system") &&
                    our_args["system"].hasOwnProperty("stats") &&
                    our_args["system"]["stats"].hasOwnProperty("medical")
                ) {
                    // this is a stimpack update
                    log(
                        module_name,
                        "caught stimpack usage, new count: " + our_args["system"]["stats"]["medical"]["uses"]
                    );

                    // look up relevant info
                    let actor_id = our_args["_id"];
                    let stimpack_usage = our_args["system"]["stats"]["medical"]["uses"];
                    let tokens = canvas.tokens.placeables.filter((token) => token.document.actorId === actor_id);

                    // update the tokens
                    for (var x = 0; x < tokens.length; x++) {
                        update_status(tokens[x], stimpack_usage, status);
                    }
                }
            } else if (source === "canvasReady") {
                log(module_name, "caught scene-transition, looking for tokens");
                let tokens = canvas.tokens.placeables.filter((token) => token);
                for (var x = 0; x < tokens.length; x++) {
                    let token = tokens[x];
                    let actor = game.actors.get(token.document.actorId);
                    let stimpack_usage = actor?.system?.stats?.medical?.uses;
                    if (stimpack_usage !== undefined) {
                        log(
                            module_name,
                            "found token for " + actor.name + " with " + stimpack_usage + " stimpack uses"
                        );

                        // update the tokens
                        update_status(token, stimpack_usage, status);
                    }
                }
            }
        } catch (exception) {
            // something went wrong, bail (silently)
            log(module_name, "Failed to sync stimpack usage: " + exception);
        }
    }
}
