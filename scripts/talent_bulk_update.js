import { log_msg as log } from "./util.js";
import { get_skill_options } from "./talent_skill_association.js";

let feature_name = "talent_bulk_update";

/**
 * Open the bulk talent skill association dialog.
 */
export function open_bulk_update_dialog() {
    new TalentBulkUpdateApp().render(true);
}

class TalentBulkUpdateApp extends FormApplication {
    constructor() {
        super();
        this.rows = [{ talentName: "", skills: [""] }];
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "effg-talent-bulk-update",
            title: game.i18n.localize("ffg-star-wars-enhancements.talent-bulk-update.title"),
            template: "modules/ffg-star-wars-enhancements/templates/talent_bulk_update.html",
            width: 600,
            height: "auto",
            resizable: true,
            closeOnSubmit: false,
        });
    }

    getData() {
        const skillOptions = get_skill_options();

        // Build source options
        const sources = [];

        // Compendium packs that contain items
        for (const pack of game.packs) {
            if (pack.metadata.type === "Item") {
                sources.push({
                    value: `compendium:${pack.collection}`,
                    label: `${game.i18n.localize("ffg-star-wars-enhancements.talent-bulk-update.source-compendium")}: ${pack.metadata.label}`,
                    group: "compendium",
                });
            }
        }

        // Actors
        for (const actor of game.actors) {
            sources.push({
                value: `actor:${actor.id}`,
                label: `${game.i18n.localize("ffg-star-wars-enhancements.talent-bulk-update.source-actor")}: ${actor.name}`,
                group: "actor",
            });
        }

        // Build template-ready rows with pre-built optionsHtml
        const templateRows = this.rows.map((row, rowIndex) => {
            const skillRows = row.skills.map((skillValue, skillIndex) => {
                let optionsHtml = `<option value="">${game.i18n.localize("ffg-star-wars-enhancements.talent-skill-association-none")}</option>`;
                for (const skill of skillOptions) {
                    const selected = skill.value === skillValue ? "selected" : "";
                    optionsHtml += `<option value="${skill.value}" ${selected}>${skill.label}</option>`;
                }
                return {
                    rowIndex: rowIndex,
                    skillIndex: skillIndex,
                    optionsHtml: optionsHtml,
                    showRemove: row.skills.length > 1,
                };
            });
            return {
                talentName: row.talentName,
                skillRows: skillRows,
            };
        });

        return {
            rows: templateRows,
            sources: sources,
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Add talent row
        html.find(".effg-bulk-add-row").on("click", (event) => {
            event.preventDefault();
            this.rows.push({ talentName: "", skills: [""] });
            this.render();
        });

        // Remove talent row
        html.on("click", ".effg-bulk-remove-row", (event) => {
            event.preventDefault();
            const index = parseInt($(event.currentTarget).data("row-index"));
            if (this.rows.length > 1) {
                this.rows.splice(index, 1);
                this.render();
            }
        });

        // Add skill to a row
        html.on("click", ".effg-bulk-add-skill", (event) => {
            event.preventDefault();
            const rowIndex = parseInt($(event.currentTarget).data("row-index"));
            this.rows[rowIndex].skills.push("");
            this.render();
        });

        // Remove skill from a row
        html.on("click", ".effg-bulk-remove-skill", (event) => {
            event.preventDefault();
            const rowIndex = parseInt($(event.currentTarget).data("row-index"));
            const skillIndex = parseInt($(event.currentTarget).data("skill-index"));
            if (this.rows[rowIndex].skills.length > 1) {
                this.rows[rowIndex].skills.splice(skillIndex, 1);
                this.render();
            }
        });

        // Sync input changes back to this.rows before re-render
        html.on("change", ".effg-bulk-talent-name", (event) => {
            const rowIndex = parseInt($(event.target).data("row-index"));
            this.rows[rowIndex].talentName = event.target.value;
        });

        html.on("change", ".effg-bulk-skill-select", (event) => {
            const rowIndex = parseInt($(event.target).data("row-index"));
            const skillIndex = parseInt($(event.target).data("skill-index"));
            this.rows[rowIndex].skills[skillIndex] = event.target.value;
        });
    }

    async _updateObject(event, formData) {
        // Read current state from form
        this._syncFormData(this.element);

        const source = formData.source;
        if (!source) {
            ui.notifications.warn(game.i18n.localize("ffg-star-wars-enhancements.talent-bulk-update.no-source"));
            return;
        }

        // Filter out rows with empty talent names
        const mappings = this.rows.filter(r => r.talentName.trim() !== "");
        if (mappings.length === 0) {
            ui.notifications.warn(game.i18n.localize("ffg-star-wars-enhancements.talent-bulk-update.no-mappings"));
            return;
        }

        // Filter out empty skills from each mapping
        const cleanMappings = mappings.map(m => ({
            talentName: m.talentName.trim(),
            skills: m.skills.filter(s => s !== ""),
        }));

        const [sourceType, sourceId] = source.split(":", 2);
        let updatedCount = 0;

        if (sourceType === "compendium") {
            updatedCount = await this._updateCompendium(sourceId, cleanMappings);
        } else if (sourceType === "actor") {
            updatedCount = await this._updateActor(sourceId, cleanMappings);
        }

        ui.notifications.info(
            game.i18n.localize("ffg-star-wars-enhancements.talent-bulk-update.success")
                .replace("{count}", updatedCount)
        );
    }

    /**
     * Sync form data back to this.rows from the current DOM state.
     */
    _syncFormData(html) {
        html.find(".effg-bulk-talent-name").each((i, el) => {
            const rowIndex = parseInt($(el).data("row-index"));
            if (this.rows[rowIndex]) {
                this.rows[rowIndex].talentName = el.value;
            }
        });
        html.find(".effg-bulk-skill-select").each((i, el) => {
            const rowIndex = parseInt($(el).data("row-index"));
            const skillIndex = parseInt($(el).data("skill-index"));
            if (this.rows[rowIndex]?.skills) {
                this.rows[rowIndex].skills[skillIndex] = el.value;
            }
        });
    }

    /**
     * Update talents in a compendium pack.
     * Finds the first talent matching each name and sets the associatedSkill flag.
     */
    async _updateCompendium(packId, mappings) {
        const pack = game.packs.get(packId);
        if (!pack) {
            log(feature_name, "Compendium not found: " + packId);
            return 0;
        }

        const documents = await pack.getDocuments();
        let count = 0;

        for (const mapping of mappings) {
            const talent = documents.find(
                doc => doc.type === "talent" && doc.name.toLowerCase() === mapping.talentName.toLowerCase()
            );
            if (talent) {
                await talent.setFlag("ffg-star-wars-enhancements", "associatedSkill", mapping.skills);
                count++;
                log(feature_name, `Updated compendium talent "${talent.name}" with skills: ${mapping.skills.join(", ")}`);
            } else {
                log(feature_name, `Talent "${mapping.talentName}" not found in compendium ${packId}`);
            }
        }

        return count;
    }

    /**
     * Update talents on an actor's specialization trees.
     * Finds all specializations on the actor, then updates matching talents as embedded items.
     */
    async _updateActor(actorId, mappings) {
        const actor = game.actors.get(actorId);
        if (!actor) {
            log(feature_name, "Actor not found: " + actorId);
            return 0;
        }

        let count = 0;

        // Update standalone talent items on the actor
        const talentItems = actor.items.filter(item => item.type === "talent");
        for (const mapping of mappings) {
            const matchingTalents = talentItems.filter(
                t => t.name.toLowerCase() === mapping.talentName.toLowerCase()
            );
            for (const talent of matchingTalents) {
                await talent.setFlag("ffg-star-wars-enhancements", "associatedSkill", mapping.skills);
                count++;
                log(feature_name, `Updated actor talent "${talent.name}" with skills: ${mapping.skills.join(", ")}`);
            }
        }

        // Update talents within specialization items on the actor
        const specializations = actor.items.filter(item => item.type === "specialization");
        for (const spec of specializations) {
            if (!spec.system?.talents) continue;

            const talentKeys = Object.keys(spec.system.talents);
            const updates = {};
            let hasUpdates = false;

            for (const key of talentKeys) {
                const specTalent = spec.system.talents[key];
                if (!specTalent?.name) continue;

                for (const mapping of mappings) {
                    if (specTalent.name.toLowerCase() === mapping.talentName.toLowerCase()) {
                        updates[`system.talents.${key}.flags.ffg-star-wars-enhancements.associatedSkill`] = mapping.skills;
                        hasUpdates = true;
                        count++;
                        log(feature_name, `Updated specialization "${spec.name}" talent "${specTalent.name}" with skills: ${mapping.skills.join(", ")}`);
                    }
                }
            }

            if (hasUpdates) {
                await spec.update(updates);
            }
        }

        return count;
    }
}
