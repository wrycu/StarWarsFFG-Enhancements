import { log_msg as log } from "../util.js";
import { get_skill_options, get_skill_groups } from "./talent_skill_association.js";

const feature_name = "talent_bulk_update";
const MODULE_ID = "ffg-star-wars-enhancements";
const FLAG_ASSOCIATED_SKILL = "associatedSkill";
const CSS_SOURCE_OPTION = ".effg-bulk-source-option";
const CSS_SOURCE_HIGHLIGHT = "effg-bulk-source-highlight";
const DATA_ROW_INDEX = "row-index";
const DATA_SKILL_INDEX = "skill-index";
const DATA_SOURCE_INDEX = "source-index";

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
        this.selectedSources = [{ value: "", label: "" }];
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "effg-talent-bulk-update",
            title: game.i18n.localize("ffg-star-wars-enhancements.talent-bulk-update.title"),
            template: "modules/ffg-star-wars-enhancements/templates/talentsAutomation/talent_bulk_update.html",
            width: 600,
            height: "auto",
            resizable: true,
            closeOnSubmit: false,
        });
    }

    getData() {
        const skillOptions = get_skill_options();

        // Build source options list
        const sourceOptions = [];

        for (const pack of game.packs) {
            if (pack.metadata.type === "Item") {
                sourceOptions.push({
                    value: `compendium:${pack.collection}`,
                    label: `${game.i18n.localize("ffg-star-wars-enhancements.talent-bulk-update.source-compendium")}: ${pack.metadata.label}`,
                });
            }
        }

        for (const actor of game.actors) {
            sourceOptions.push({
                value: `actor:${actor.id}`,
                label: `${game.i18n.localize("ffg-star-wars-enhancements.talent-bulk-update.source-actor")}: ${actor.name}`,
            });
        }

        // Build source rows for template
        const sourceRows = this.selectedSources.map((src, idx) => ({
            value: src.value,
            label: src.label,
            showRemove: this.selectedSources.length > 1,
        }));

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

        // Build skill group presets
        const skillGroups = get_skill_groups();
        const presets = Object.keys(skillGroups).sort().map(groupName => ({
            name: groupName,
            skills: skillGroups[groupName],
        }));

        return {
            rows: templateRows,
            sourceOptions: sourceOptions,
            sourceRows: sourceRows,
            presets: presets,
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Searchable source dropdowns
        html.on("focus", ".effg-bulk-source-search", (event) => {
            const wrapper = $(event.target).closest(".effg-bulk-source-wrapper");
            wrapper.find(".effg-bulk-source-list").show();
            _filterSourceList(wrapper, $(event.target).val());
        });

        html.on("input", ".effg-bulk-source-search", (event) => {
            const wrapper = $(event.target).closest(".effg-bulk-source-wrapper");
            wrapper.find(".effg-bulk-source-list").show();
            _filterSourceList(wrapper, $(event.target).val());

            // Clear the stored value if user edits the text
            const idx = parseInt($(event.target).data(DATA_SOURCE_INDEX));
            this.selectedSources[idx].value = "";
        });

        // Select a source option
        html.on("click", CSS_SOURCE_OPTION, (event) => {
            const li = $(event.currentTarget);
            const value = li.data("value");
            const label = li.data("label");
            const wrapper = li.closest(".effg-bulk-source-wrapper");
            const input = wrapper.find(".effg-bulk-source-search");
            const idx = parseInt(input.data(DATA_SOURCE_INDEX));

            input.val(label);
            wrapper.find(".effg-bulk-source-list").hide();
            this.selectedSources[idx] = { value: value, label: label };
        });

        // Hide dropdowns when clicking outside
        $(document).on("mousedown.effg-bulk-source", (event) => {
            if (!$(event.target).closest(".effg-bulk-source-wrapper").length) {
                html.find(".effg-bulk-source-list").hide();
            }
        });

        // Keyboard navigation for source dropdowns
        html.on("keydown", ".effg-bulk-source-search", (event) => {
            const wrapper = $(event.target).closest(".effg-bulk-source-wrapper");
            const list = wrapper.find(".effg-bulk-source-list");
            const visible = list.find(CSS_SOURCE_OPTION + ":visible");
            const highlighted = list.find("." + CSS_SOURCE_HIGHLIGHT);

            if (event.key === "ArrowDown") {
                event.preventDefault();
                if (highlighted.length === 0) {
                    visible.first().addClass(CSS_SOURCE_HIGHLIGHT);
                } else {
                    const next = highlighted.nextAll(CSS_SOURCE_OPTION + ":visible").first();
                    highlighted.removeClass(CSS_SOURCE_HIGHLIGHT);
                    (next.length ? next : visible.first()).addClass(CSS_SOURCE_HIGHLIGHT);
                }
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                if (highlighted.length === 0) {
                    visible.last().addClass(CSS_SOURCE_HIGHLIGHT);
                } else {
                    const prev = highlighted.prevAll(CSS_SOURCE_OPTION + ":visible").first();
                    highlighted.removeClass(CSS_SOURCE_HIGHLIGHT);
                    (prev.length ? prev : visible.last()).addClass(CSS_SOURCE_HIGHLIGHT);
                }
            } else if (event.key === "Enter") {
                event.preventDefault();
                if (highlighted.length) {
                    highlighted.trigger("click");
                }
            } else if (event.key === "Escape") {
                list.hide();
            }
        });

        // Add source row
        html.on("click", ".effg-bulk-add-source", (event) => {
            event.preventDefault();
            this._syncFormData(html);
            this.selectedSources.push({ value: "", label: "" });
            this.render();
        });

        // Remove source row
        html.on("click", ".effg-bulk-remove-source", (event) => {
            event.preventDefault();
            this._syncFormData(html);
            const idx = parseInt($(event.currentTarget).data(DATA_SOURCE_INDEX));
            if (this.selectedSources.length > 1) {
                this.selectedSources.splice(idx, 1);
                this.render();
            }
        });

        // Skill group preset buttons
        html.on("click", ".effg-bulk-preset", (event) => {
            event.preventDefault();
            this._syncFormData(html);
            const skills = $(event.currentTarget).data("skills").split(",");
            this.rows[0].skills = skills;
            this.render();
        });

        // Clear all skills
        html.on("click", ".effg-bulk-clear-skills", (event) => {
            event.preventDefault();
            this._syncFormData(html);
            this.rows[0].skills = [""];
            this.render();
        });

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
        this._syncFormData(this.element);

        // Collect valid sources
        const validSources = this.selectedSources.filter(s => s.value);
        if (validSources.length === 0) {
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

        let updatedCount = 0;

        for (const source of validSources) {
            const [sourceType, sourceId] = source.value.split(":", 2);
            if (sourceType === "compendium") {
                updatedCount += await this._updateCompendium(sourceId, mappings);
            } else if (sourceType === "actor") {
                updatedCount += await this._updateActor(sourceId, mappings);
            }
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

    async _updateCompendium(packId, mappings) {
        const pack = game.packs.get(packId);
        if (!pack) {
            log(feature_name, "Compendium not found: " + packId);
            return 0;
        }

        const documents = await pack.getDocuments();
        let count = 0;

        // Update standalone talent items
        for (const mapping of mappings) {
            const talent = documents.find(
                doc => doc.type === "talent" && doc.name.toLowerCase() === mapping.talentName.toLowerCase()
            );
            if (talent) {
                await talent.setFlag(MODULE_ID, FLAG_ASSOCIATED_SKILL, mapping.skills);
                count++;
                log(feature_name, `Updated compendium talent "${talent.name}" with skills: ${mapping.skills.join(", ")}`);
            }
        }

        // Update talents nested inside specialization items
        const specializations = documents.filter(doc => doc.type === "specialization");
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
                        log(feature_name, `Updated compendium specialization "${spec.name}" talent "${specTalent.name}" with skills: ${mapping.skills.join(", ")}`);
                    }
                }
            }

            if (hasUpdates) {
                await spec.update(updates);
            }
        }

        return count;
    }

    async _updateActor(actorId, mappings) {
        const actor = game.actors.get(actorId);
        if (!actor) {
            log(feature_name, "Actor not found: " + actorId);
            return 0;
        }

        let count = 0;

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

function _filterSourceList(wrapper, query) {
    const lowerQuery = (query || "").toLowerCase();
    wrapper.find(CSS_SOURCE_OPTION).each((i, el) => {
        const label = $(el).data("label").toLowerCase();
        $(el).toggle(!lowerQuery || label.includes(lowerQuery));
    });
    wrapper.find("." + CSS_SOURCE_HIGHLIGHT).removeClass(CSS_SOURCE_HIGHLIGHT);
}

function _parseNames(text) {
    return (text || "").split("\n").map(s => s.trim()).filter(s => s.length > 0);
}
