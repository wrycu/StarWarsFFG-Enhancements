import {log_msg as log} from "./util.js";

export function init() {
    log('dice_helper', 'Initializing');
    game.settings.register("ffg-star-wars-enhancements", "dice-helper", {
        name: game.i18n.localize('ffg-star-wars-enhancements.dice-helper'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.dice-helper-hint'),
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });
    game.settings.register("ffg-star-wars-enhancements", "dice-helper-data", {
        name: game.i18n.localize('ffg-star-wars-enhancements.dice-helper-data'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.dice-helper-data-hint'),
        scope: "world",
        config: true,
        type: String,
        default: true
    });
    log('dice_helper', 'Initialized');
}

export function dice_helper() {
    Hooks.on("renderChatMessage", (app, html, messageData) => {
        /*
        this is slightly less performant than doing the settings check outside of the hook, but if we do it above the
        hook and the user enables it after the game starts, it doesn't actually enable

        we can probably overcome that, but it requires a bunch more work and who has time for that?!
         */
        if (game.settings.get("ffg-star-wars-enhancements", "dice-helper")) {
            html.on("click", ".effg-die-result", async function () {
                await dice_helper_clicked(messageData);
            });
            if (game.user.isGM && app.roll && (messageData.message.content.search('Initiative') === -1 || messageData.message.content.search('Help spending results') === -1 || messageData.message.content.search('for spending results') === -1)) {
                let combat_skills = [
                    /* melee animations */
                    game.i18n.localize('SWFFG.SkillsNameBrawl'),
                    game.i18n.localize('SWFFG.SkillsNameLightsaber'),
                    game.i18n.localize('SWFFG.SkillsNameMelee'),
                    /* ranged animations */
                    game.i18n.localize('SWFFG.SkillsNameGunnery'),
                    game.i18n.localize('SWFFG.SkillsNameRangedHeavy').replace(' ', ' '),
                    game.i18n.localize('SWFFG.SkillsNameRangedLight').replace(' ', ' '),
                ];

                let skill = messageData['message']['flavor'].replace(game.i18n.localize('SWFFG.Rolling'), '').replace('...', '').replace(' ', ' ').replace(' ', '');
                let roll_result = {
                    'advantage': app.roll.ffg.advantage,
                    'triumph': app.roll.ffg.triumph,
                    'threat': app.roll.ffg.threat,
                    'despair': app.roll.ffg.despair,
                    'success': app.roll.ffg.success,
                    'failure': app.roll.ffg.failure,
                };
                if (roll_result['advantage'] > 0 || roll_result['triumph'] > 0 || roll_result['threat'] > 0 || roll_result['despair'] > 0) {
                    log('dice_helper', 'Die roll had relevant results, generating new message');
                    var msg = {
                        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                        'content': '<button class="effg-die-result" ' +
                            'data-ad="' + roll_result['advantage'] + '" ' +
                            'data-tr="' + roll_result['triumph'] + '" ' +
                            'data-th="' + roll_result['threat'] + '" ' +
                            'data-de="' + roll_result['despair'] + '" ' +
                            'data-su="' + roll_result['success'] + '" ' +
                            'data-fa="' + roll_result['failure'] + '" ' +
                            'data-sk="' + skill + '"' +
                            '>Help spending results!</button>',
                    };
                    log('dice_helper', 'New message content: ' + msg['content']);
                    ChatMessage.create(msg);
                }

            } else {
                log('dice_helper', 'Detected relevant die roll but the message has already been modified; ignoring');
            }
        }
    });
}

async function dice_helper_clicked(object) {
    /**
     * update the content of the "help me spend results" button based on results of the dice roll
     *
     * @param {object} ChatMessage object passed in by the hook we're listened to
     */
    log('dice_helper', 'Detected button click; converting to results');
    var data = determine_data(object.message.content);
    log('dice_helper', JSON.stringify(data));

    let skill = data['skill'];
    let suggestions = await fetch_suggestions(data);

    var msg = new ChatMessage(object.message);
    let context = {
        suggestions: suggestions,
        skill: skill,
    };
    object.message.content = (await getTemplate('modules/ffg-star-wars-enhancements/templates/dice_helper.html'))(context);
    object.message.id = object.message._id;
    msg.update(object.message);
    log('dice_helper', 'Updated the message');
}

function determine_data(incoming_data) {
    /**
     * read the button metadata to determine results from the associated dice roll
     *
     * @param {incoming_data} html created by dice_helper
     */
    let data = $(incoming_data);
    return {
        'ad': data.data('ad'),
        'tr': data.data('tr'),
        'th': data.data('th'),
        'de': data.data('de'),
        'su': data.data('su'),
        'fa': data.data('fa'),
        'skill': data.data('sk'),
    };
}

async function fetch_suggestions(results) {
    let suggestion_categories = [
        'su',
        'fa',
        'ad',
        'th',
        'tr',
        'de',
    ];

    let skill = results['skill'].toLowerCase();

    let data = await $.getJSON("modules/ffg-star-wars-enhancements/content/dice_helper.json");
    // todo: handle localized skill names
    if (!skill in data) {
        // todo: update return data to match whatever we come up with
        return [];
    }
    let suggestions = [];

    for (var x=0; x < suggestion_categories.length; x++) {
        let category = suggestion_categories[x];
        let tmp_suggestions = data[skill][category].filter(suggestion => suggestion.required <= results[category]);
        if (tmp_suggestions.length > 0) {
            suggestions.push({
                'category': category,
                'suggestions': tmp_suggestions,
            });
        }
    }
    return suggestions;
}
