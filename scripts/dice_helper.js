import {log_msg as log} from "./util.js";

export function dice_helper_init() {
    Hooks.on("renderChatMessage", (app, html, messageData) => {
        html.on("click", ".effg-die-result", async function() { await dice_helper_clicked(messageData)});
    });
}

function determine_data(incoming_data) {
    var outgoing_data = {
        'advantage': 0,
        'triumph': 0,
        'threat': 0,
        'despair': 0,
    }

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
    libWrapper.register(
        'ffg-star-wars-enhancements',
        'game.ffg.RollFFG.prototype.toMessage',
        function (wrapped, ...args) {
            log('dice_helper', 'Detected FFG dice roll, looking for results');
            console.log(...args)

            return wrapped(...args);
        }
    );
}