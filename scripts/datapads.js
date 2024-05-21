import { log_msg as log } from "./util.js";

export async function create_datapad_journal() {
    const templates = {
        datapad: '<div class="swdatapad"><p></p></div>',
        datapadlarge: '<div class="swdatapadlarge"><p></p></div>',
        bounty: (await getTemplate("modules/ffg-star-wars-enhancements/templates/datapads_bounty.html"))(),
    };

    const datapad_template = game.i18n.localize("ffg-star-wars-enhancements.datapads.datapad-template");
    const datapad = game.i18n.localize("ffg-star-wars-enhancements.datapads.datapad");
    const datapad_large = game.i18n.localize("ffg-star-wars-enhancements.datapads.datapad-large");
    const bounty = game.i18n.localize("ffg-star-wars-enhancements.datapads.bounty");
    return new Dialog({
        title: game.i18n.localize("ffg-star-wars-enhancements.datapads.title"),
        content: `
            <form>
                <div class="form-group">
                    <label>${datapad_template}</label>
                    <select name="template">
                    <option value="datapad">${datapad}</option>
					<option value="datapadlarge">${datapad_large}</option>
                    <option value="bounty">${bounty}</option>
                    </select>
                </div>
            </form>
        `,
        buttons: {
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize("ffg-star-wars-enhancements.datapads.cancel"),
            },
            create: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("ffg-star-wars-enhancements.datapads.create"),
                callback: (html) => {
                    let template = html.find('[name="template"]').val();
                    log("template", template);

                    let data = {
                        name: template,
                        pages: [
                            {
                                name: template,
                                type: "text",
                                text: {
                                    content: templates[template],
                                    format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML,
                                },
                            },
                        ],
                    };

                    JournalEntry.create(data).then((journal) => {
                        journal.sheet.render(true);
                    });
                },
            },
        },
        default: "create",
        close: () => {},
    }).render(true);
}
