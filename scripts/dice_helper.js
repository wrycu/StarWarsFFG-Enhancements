import {log_msg as log} from "./util.js";

export function dice_helper_init() {
    game.settings.register("ffg-star-wars-enhancements", "dice-helper", {
        name: game.i18n.localize('ffg-star-wars-enhancements.dice-helper'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.dice-helper-hint'),
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });
}

function determine_data(incoming_data) {
    var match = incoming_data.match('.*data-ad=\"([0-9])+\" data-tr=\"([0-9])+\" data-th=\"([0-9])+\" data-de=\"([0-9])+\".*');
    var outgoing_data = {
        'advantage': match[1],
        'triumph': match[2],
        'threat': match[3],
        'despair': match[4],
    };

    return outgoing_data;
}

async function dice_helper_clicked(object) {
    console.log("HUGE SUCCESS")
    console.log(object)
    var data = determine_data(object.message.content);
    object.message.content = (await getTemplate('modules/ffg-star-wars-enhancements/templates/dice_helper.html'))(data);
    object.message.id = object.message._id;
    var msg = new ChatMessage(object.message);
    // TODO: this only updates the rendered message, not the logged message (a refresh will delete it)
    ui.chat.updateMessage(msg);
}

export function dice_helper() {
    Hooks.on("renderChatMessage", (app, html, messageData) => {
        /*
        this is slightly less performant than doing the settings check outside of the hook, but if we do it above the
        hook and the user enables it after the game starts, it doesn't actually enable

        we can probably overcome that, but it requires a bunch more work and who has time for that?!
         */
        if (game.settings.get("ffg-star-wars-enhancements", "dice-helper")) {
            // TODO: this only updates the rendered message, not the logged message (a refresh will delete it)
            html.on("click", ".effg-die-result", async function () {
                await dice_helper_clicked(messageData)
            });
            console.log("DICE HELPER")
            console.log(app)
            console.log(html)
            console.log(messageData)
            if (app.roll && (messageData.message.content.search('Initiative') === -1 || messageData.message.content.search('Help spending results') === -1 || messageData.message.content.search('for spending results') === -1)) {
                console.log("PARSING")
                var data = {
                    'advantage': app.roll.ffg.advantage,
                    'triumph': app.roll.ffg.triumph,
                    'threat': app.roll.ffg.threat,
                    'despair': app.roll.ffg.despair,
                };
                if (data['advantage'] > 0 || data['triumph'] > 0 || data['threat'] > 0 || data['despair'] > 0) {
                    var msg = {
                        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                        'content': '<button class="effg-die-result" ' +
                            'data-ad="' + data['advantage'] + '" ' +
                            'data-tr="' + data['triumph'] + '" ' +
                            'data-th="' + data['threat'] + '" ' +
                            'data-de="' + data['despair'] + '"' +
                            '>Help spending results!</button>',
                    };
                    ChatMessage.create(msg);
                }
            } else {
                console.log("refusing to run because it's already been modified")
            }
        }
    });
}
