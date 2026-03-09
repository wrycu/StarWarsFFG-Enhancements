import { log_msg as log } from "./util.js";
import { get_skill_options } from "./talent_skill_association.js";

const feature_name = "talent_bulk_update";
const MODULE_ID = "ffg-star-wars-enhancements";
const FLAG_ASSOCIATED_SKILL = "associatedSkill";
const CSS_SOURCE_OPTION = ".effg-bulk-source-option";
const CSS_SOURCE_HIGHLIGHT = "effg-bulk-source-highlight";
const DATA_ROW_INDEX = "row-index";
const DATA_SKILL_INDEX = "skill-index";

/**
 * Open the bulk talent skill association dialog.
 */
export function open_bulk_update_dialog() {
    new TalentBulkUpdateApp().render(true);
}

class TalentBulkUpdateApp extends FormApplication {
    constructor() {
        super();
        this.rows = [{ talentNames: [], skills: [""] }];
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
                talentNamesText: row.talentNames.join("\n"),
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

        // Searchable source dropdown
        const searchInput = html.find(".effg-bulk-source-search");
        const sourceList = html.find(".effg-bulk-source-list");
        const sourceHidden = html.find(".effg-bulk-source-value");
        const allOptions = html.find(CSS_SOURCE_OPTION);

        // Restore selected source label if re-rendering
        if (this._selectedSourceLabel) {
            searchInput.val(this._selectedSourceLabel);
        }

        searchInput.on("focus", () => {
            sourceList.show();
            filterSourceOptions(searchInput.val());
        });

        searchInput.on("input", () => {
            sourceList.show();
            filterSourceOptions(searchInput.val());
        });

        // Select an option on click
        allOptions.on("click", (event) => {
            const li = $(event.currentTarget);
            const value = li.data("value");
            const label = li.data("label");
            sourceHidden.val(value);
            searchInput.val(label);
            this._selectedSourceValue = value;
            this._selectedSourceLabel = label;
            sourceList.hide();
        });

        // Hide dropdown when clicking outside
        $(document).on("mousedown.effg-bulk-source", (event) => {
            if (!$(event.target).closest(".effg-bulk-source-wrapper").length) {
                sourceList.hide();
                // If no valid selection, clear input
                if (!this._selectedSourceValue) {
                    searchInput.val("");
                }
            }
        });

        // Keyboard navigation
        searchInput.on("keydown", (event) => {
            const visible = sourceList.find(".effg-bulk-source-option:visible");
            const highlighted = sourceList.find("." + CSS_SOURCE_HIGHLIGHT);

            if (event.key === "ArrowDown") {
                event.preventDefault();
                if (highlighted.length === 0) {
                    visible.first().addClass(CSS_SOURCE_HIGHLIGHT);
                } else {
                    const next = highlighted.nextAll(".effg-bulk-source-option:visible").first();
                    highlighted.removeClass(CSS_SOURCE_HIGHLIGHT);
                    if (next.length) {
                        next.addClass(CSS_SOURCE_HIGHLIGHT);
                    } else {
                        visible.first().addClass(CSS_SOURCE_HIGHLIGHT);
                    }
                }
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                if (highlighted.length === 0) {
                    visible.last().addClass(CSS_SOURCE_HIGHLIGHT);
                } else {
                    const prev = highlighted.prevAll(".effg-bulk-source-option:visible").first();
                    highlighted.removeClass(CSS_SOURCE_HIGHLIGHT);
                    if (prev.length) {
                        prev.addClass(CSS_SOURCE_HIGHLIGHT);
                    } else {
                        visible.last().addClass(CSS_SOURCE_HIGHLIGHT);
                    }
                }
            } else if (event.key === "Enter") {
                event.preventDefault();
                if (highlighted.length) {
                    highlighted.trigger("click");
                }
            } else if (event.key === "Escape") {
                sourceList.hide();
            }
        });

        function filterSourceOptions(query) {
            const lowerQuery = (query || "").toLowerCase();
            allOptions.each((i, el) => {
                const label = $(el).data("label").toLowerCase();
                const match = !lowerQuery || label.includes(lowerQuery);
                $(el).toggle(match);
            });
            allOptions.removeClass(CSS_SOURCE_HIGHLIGHT);
        }

        // Add skill to a row
        html.on("click", ".effg-bulk-add-skill", (event) => {
            event.preventDefault();
            const rowIndex = parseInt($(event.currentTarget).data(DATA_ROW_INDEX));
            this.rows[rowIndex].skills.push("");
            this.render();
        });

        // Remove skill from a row
        html.on("click", ".effg-bulk-remove-skill", (event) => {
            event.preventDefault();
            const rowIndex = parseInt($(event.currentTarget).data(DATA_ROW_INDEX));
            const skillIndex = parseInt($(event.currentTarget).data(DATA_SKILL_INDEX));
            if (this.rows[rowIndex].skills.length > 1) {
                this.rows[rowIndex].skills.splice(skillIndex, 1);
                this.render();
            }
        });

        // Sync input changes back to this.rows before re-render
        html.on("change", ".effg-bulk-talent-names", (event) => {
            const rowIndex = parseInt($(event.target).data(DATA_ROW_INDEX));
            this.rows[rowIndex].talentNames = _parseNames(event.target.value);
        });

        html.on("change", ".effg-bulk-skill-select", (event) => {
            const rowIndex = parseInt($(event.target).data(DATA_ROW_INDEX));
            const skillIndex = parseInt($(event.target).data(DATA_SKILL_INDEX));
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

        // Expand rows: each talent name in a row shares the same skills
        const mappings = [];
        for (const row of this.rows) {
            const skills = [...new Set(row.skills.filter(s => s !== ""))];
            for (const name of row.talentNames) {
                if (name.trim()) {
                    mappings.push({ talentName: name.trim(), skills: skills });
                }
            }
        }

        if (mappings.length === 0) {
            ui.notifications.warn(game.i18n.localize("ffg-star-wars-enhancements.talent-bulk-update.no-mappings"));
            return;
        }

        const [sourceType, sourceId] = source.split(":", 2);
        let updatedCount = 0;

        if (sourceType === "compendium") {
            updatedCount = await this._updateCompendium(sourceId, mappings);
        } else if (sourceType === "actor") {
            updatedCount = await this._updateActor(sourceId, mappings);
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
        html.find(".effg-bulk-talent-names").each((i, el) => {
            const rowIndex = parseInt($(el).data(DATA_ROW_INDEX));
            if (this.rows[rowIndex]) {
                this.rows[rowIndex].talentNames = _parseNames(el.value);
            }
        });
        html.find(".effg-bulk-skill-select").each((i, el) => {
            const rowIndex = parseInt($(el).data(DATA_ROW_INDEX));
            const skillIndex = parseInt($(el).data(DATA_SKILL_INDEX));
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
                await talent.setFlag(MODULE_ID, FLAG_ASSOCIATED_SKILL, mapping.skills);
                count++;
                log(feature_name, `Updated compendium talent "${talent.name}" with skills: ${mapping.skills.join(", ")}`);
            } else {
                log(feature_name, `Talent "${mapping.talentName}" not found in compendium ${packId}`);
            }
        }

        return count;
    }

    /**
     * Update talents on an actor.
     * Updates standalone talent items and talents within specialization trees.
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
                await talent.setFlag(MODULE_ID, FLAG_ASSOCIATED_SKILL, mapping.skills);
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
                        updates[`system.talents.${key}.flags.${MODULE_ID}.${FLAG_ASSOCIATED_SKILL}`] = mapping.skills;
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

/**
 * Parse a multi-line text value into an array of non-empty talent names.
 */
function _parseNames(text) {
    return (text || "").split("\n").map(s => s.trim()).filter(s => s.length > 0);
}
