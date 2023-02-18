import { log_msg as log } from "./util.js";

let feature_name = "dice_helper";

export function init() {
    log(feature_name, "Initializing");
    game.settings.register("ffg-star-wars-enhancements", "dice-helper", {
        name: game.i18n.localize("ffg-star-wars-enhancements.dice-helper"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.dice-helper-hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register("ffg-star-wars-enhancements", "dice-helper-data", {
        name: game.i18n.localize("ffg-star-wars-enhancements.dice-helper-data"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.dice-helper-data-hint"),
        scope: "world",
        config: true,
        type: String,
        default: "dice_helper",
    });
    log(feature_name, "Initialized");
}

/*
Socket data handler which transfers items to the purchaser
 */
async function socket_listener(data) {
    if (data.type === "dice") {
        if (game.user.isGM) {
            dice_helper_clicked(data.object);
        }
    }
}

export function dice_helper() {
    game.socket.on("module.ffg-star-wars-enhancements", socket_listener);
    Hooks.on("createChatMessage", (messageData, meta_data, id) => {
        if (game.settings.get("ffg-star-wars-enhancements", "dice-helper")) {
            if (is_roll(messageData) === true) {
                // as of some v10 version, chat messages can contain >1 roll. let's just read the first
                messageData["_roll"] = messageData.rolls[0];
                let skill = messageData["flavor"]
                    .replace(game.i18n.localize("SWFFG.Rolling") + " ", "")
                    .replace("...", "")
                    .replace(/\s/g, " ");
                let roll_result = {
                    advantage: messageData["_roll"]["ffg"]["advantage"],
                    triumph: messageData["_roll"]["ffg"]["triumph"],
                    threat: messageData["_roll"]["ffg"]["threat"],
                    despair: messageData["_roll"]["ffg"]["despair"],
                    success: messageData["_roll"]["ffg"]["success"],
                    failure: messageData["_roll"]["ffg"]["failure"],
                };
                if (
                    roll_result["advantage"] > 0 ||
                    roll_result["triumph"] > 0 ||
                    roll_result["threat"] > 0 ||
                    roll_result["despair"] > 0
                ) {
                    log(feature_name, "Die roll had relevant results, generating new message");
                    // do we have a helper for this skill?
                    let data = load_data();
                    if (!is_supported_skill(skill.toLowerCase(), data)) {
                        log(feature_name, "Unable to find helper contents in journal, quitting");
                        return;
                    }

                    var msg = {
                        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                        content:
                            '<button class="effg-die-result" ' +
                            'data-ad="' +
                            roll_result["advantage"] +
                            '" ' +
                            'data-tr="' +
                            roll_result["triumph"] +
                            '" ' +
                            'data-th="' +
                            roll_result["threat"] +
                            '" ' +
                            'data-de="' +
                            roll_result["despair"] +
                            '" ' +
                            'data-su="' +
                            roll_result["success"] +
                            '" ' +
                            'data-fa="' +
                            roll_result["failure"] +
                            '" ' +
                            'data-sk="' +
                            skill +
                            '"' +
                            ">" +
                            game.i18n.localize("ffg-star-wars-enhancements.dice-helper-button-text") +
                            "!</button>",
                    };
                    log(feature_name, "New message content: " + msg["content"]);
                    ChatMessage.create(msg);
                }
            } else {
                log(feature_name, "Detected message without roll; ignoring");
            }
        }
    });

    Hooks.on("renderChatMessage", (app, html, messageData) => {
        /*
        this is slightly less performant than doing the settings check outside of the hook, but if we do it above the
        hook and the user enables it after the game starts, it doesn't actually enable

        we can probably overcome that, but it requires a bunch more work and who has time for that?!
         */
        if (game.settings.get("ffg-star-wars-enhancements", "dice-helper")) {
            // this would need to remain in renderchatmessage since we don't have easy access to the HTML later
            html.on("click", ".effg-die-result", async function () {
                await dice_helper_clicked(messageData);
            });
        }
    });
}

function is_roll(message_data) {
    if (game.user.isGM && message_data["rolls"].length > 0) {
        if (message_data["flavor"] === undefined) {
            return false;
        }
        return true;
        if (
            message_data.message.content.search("Initiative") === -1 ||
            message_data.message.content.search(
                game.i18n.localize("ffg-star-wars-enhancements.dice-helper-button-text")
            ) === -1 ||
            message_data.message.content.search(
                game.i18n.localize("ffg-star-wars-enhancements.dice-helper-message-content-3")
            ) === -1
        ) {
            return true;
        }
    }
    return false;
}

async function dice_helper_clicked(object) {
    /**
     * update the content of the "help me spend results" button based on results of the dice roll
     *
     * @param {object} ChatMessage object passed in by the hook we're listened to
     */
    log(feature_name, "Detected button click; converting to results");

    if (!game.user.isGM) {
        // user isn't a GM, send a packet to the GM to do it instead
        game.socket.emit("module.ffg-star-wars-enhancements", {
            type: "dice",
            object: object,
        });
        return;
    }

    var data = determine_data(object.message.content);
    log(feature_name, JSON.stringify(data));

    let skill = data["skill"];
    let suggestions = await fetch_suggestions(data);

    var msg = new ChatMessage(object.message);
    let context = {
        suggestions: suggestions,
        skill: skill,
    };
    object.message.content = (await getTemplate("modules/ffg-star-wars-enhancements/templates/dice_helper.html"))(
        context
    );
    msg.update(object.message);
    log(feature_name, "Updated the message");
}

function determine_data(incoming_data) {
    /**
     * read the button metadata to determine results from the associated dice roll
     *
     * @param {incoming_data} html created by dice_helper
     */
    let data = $(incoming_data);
    return {
        ad: data.data("ad"),
        tr: data.data("tr"),
        th: data.data("th"),
        de: data.data("de"),
        su: data.data("su"),
        fa: data.data("fa"),
        skill: data.data("sk"),
    };
}

async function fetch_suggestions(results) {
    // categories suggestions can exist for
    let suggestion_categories = ["su", "fa", "ad", "th", "tr", "de"];

    let skill = results["skill"].toLowerCase().replace("&", "&amp;").replace(" ", " ");
    let data = load_data();

    if (!is_supported_skill(skill, data)) {
        // we don't have any suggestions for this skill
        log(feature_name, "Not rendering suggestion; unable to find " + skill + " in " + JSON.stringify(data));
        return [];
    }

    // build out an array of the suggestions
    let suggestions = [];
    for (var x = 0; x < suggestion_categories.length; x++) {
        let category = suggestion_categories[x];
        // build an array of the suggestions for the specific category we're looking at now
        if ((category === "ad" && results["tr"] > 0) || (category === "th" && results["de"] > 0)) {
            var tmp_suggestions = data[skill][category];
        } else {
            var tmp_suggestions = data[skill][category].filter(
                (suggestion) => suggestion.required <= results[category]
            );
        }
        // only add the array if it's been populated
        if (tmp_suggestions.length > 0) {
            suggestions.push({
                category: category,
                suggestions: tmp_suggestions,
            });
        }
    }
    return suggestions;
}

function is_supported_skill(skill, data) {
    /**
     * read the button metadata to determine results from the associated dice roll
     *
     * @param {skill} string, lowercase, of the skill being checked for
     * @param {data} JSON blob with the result helpers (from load_data())
     * returns true/false
     */
    log(feature_name, "Checking if " + skill + " has any helpers");
    return skill in data;
}

function load_data() {
    /**
     * Load dice helper data from the Journal
     * Returns a dict in the format of:
     *  {
     *      'cool': {
     *          'su': [
     *              {
     *                  'text': 'pass the check',
     *                  'required': 1,
     *              },
     *              ...
     *          ],
     *          ...
     *      },
     *      ...
     *  }
     */
    let journal_name = game.settings.get("ffg-star-wars-enhancements", "dice-helper-data");
    let journal = game.journal.filter((journal) => journal.name === journal_name);

    if (journal.length <= 0) {
        ui.notifications.warn("Failed to find journal - make sure it's created or something");
        log(feature_name, "Unable to find journal with the name " + journal_name);
        return {};
    }
    log(feature_name, "Found journal " + journal_name);

    let journal_pages = journal[0].pages.filter((i) => i.name === "dice_helper");
    if (journal_pages.length <= 0) {
        ui.notifications.warn("Failed to find journal with correct pages - make sure it's created or something");
        log(feature_name, "Unable to find journal with correct pages");
        return {};
    }

    try {
        let data = journal_pages[0].text.content.replace("<p>", "").replace("</p>", "");
        let jsondata = JSON.parse(data.replace('"', '"'));
        // Let translate the skill names if possible
        Object.keys(jsondata).forEach((skillname) => {
            if (skillname.includes("SWFFG.")) {
                let localizedskill = game.i18n.localize(skillname).toLowerCase().replace(" ", " ");
                Object.defineProperty(jsondata, localizedskill, Object.getOwnPropertyDescriptor(jsondata, skillname));
                delete jsondata[skillname];
            }
        });
        return jsondata;
    } catch (err) {
        ui.notifications.warn("Dice helper: invalid data detected in journal");
        return {};
    }
}

export async function create_and_populate_journal() {
    // if the feature is not enabled, don't do anything
    log(feature_name, "checking status of journal");
    if (!game.settings.get("ffg-star-wars-enhancements", "dice-helper")) {
        return;
    }

    // otherwise check to see if the journal already exists
    let journal_name = game.settings.get("ffg-star-wars-enhancements", "dice-helper-data");
    let journal = game.journal.filter((journal) => journal.name === journal_name);

    if (journal.length === 0) {
        // journal doesn't exist

        // let's search for a translated one (will probably show an error in console, can't avoid it)
        let jsonFilePath = "modules/ffg-star-wars-enhancements/content/dice_helper_" + game.i18n.lang + ".json";
        let logFileStatus = "translated";
        await fetch(jsonFilePath).then((response) => {
            if (!response.ok) {
                logFileStatus = "default";
                jsonFilePath = "modules/ffg-star-wars-enhancements/content/dice_helper.json";
            }
        });

        // then create journal
        log(feature_name, `creating ${logFileStatus} journal`);
        let suggestions = await $.getJSON(jsonFilePath);
        let data = {
            name: journal_name,
            content: JSON.stringify(suggestions),
        };
        JournalEntry.create(data);
    }
}
