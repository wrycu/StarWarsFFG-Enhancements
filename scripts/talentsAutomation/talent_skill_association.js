import { log_msg as log } from "../util.js";

let feature_name = "talent_skill_association";

/**
 * Get the list of skills available in the current game system.
 * Reads from the actor's skill data at runtime rather than importing the static default list,
 * since GMs can customize skills.
 */
export function get_skill_options() {
    // Try to get skills from an existing actor to capture any custom skills
    let skills = null;
    const actors = game.actors?.contents;
    if (actors && actors.length > 0) {
        for (const actor of actors) {
            if (actor.system?.skills && Object.keys(actor.system.skills).length > 0) {
                skills = actor.system.skills;
                break;
            }
        }
    }

    // Fallback: use the system's default skill list
    if (!skills) {
        const theme = game.settings.get("starwarsffg", "skilltheme") || "starwars";
        try {
            const defaultSkillList = game.ffg?.config?.defined_skill_list;
            if (defaultSkillList) {
                const themeEntry = defaultSkillList.find(entry => entry.id === theme);
                if (themeEntry) {
                    skills = themeEntry.skills;
                }
            }
        } catch (e) {
            log(feature_name, "Could not load default skill list: " + e);
        }
    }

    if (!skills) {
        return [];
    }

    // Build sorted options array
    let options = Object.keys(skills).sort().map(skillName => {
        return { value: skillName, label: skillName };
    });

    return options;
}

/**
 * Get skills grouped by their type (e.g., Combat, General, Social, Knowledge).
 * Returns an object mapping group name to an array of skill name strings.
 */
export function get_skill_groups() {
    let skills = null;
    const actors = game.actors?.contents;
    if (actors && actors.length > 0) {
        for (const actor of actors) {
            if (actor.system?.skills && Object.keys(actor.system.skills).length > 0) {
                skills = actor.system.skills;
                break;
            }
        }
    }

    if (!skills) {
        return {};
    }

    const groups = {};
    for (const [skillName, skillData] of Object.entries(skills)) {
        const type = skillData.type || "Other";
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(skillName);
    }

    // Sort skill names within each group
    for (const type of Object.keys(groups)) {
        groups[type].sort();
    }

    return groups;
}

export function init() {
    log(feature_name, "Initializing");
    game.settings.register("ffg-star-wars-enhancements", "talent-skill-association", {
        name: game.i18n.localize("ffg-star-wars-enhancements.talent-skill-association"),
        hint: game.i18n.localize("ffg-star-wars-enhancements.talent-skill-association-hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });
    log(feature_name, "Initialized");
}

export function talent_skill_association_hooks() {
    // Inject dropdown into talent item sheets
    Hooks.on("renderItemSheet", (app, html, data) => {
        if (!game.settings.get("ffg-star-wars-enhancements", "talent-skill-association")) {
            return;
        }

        const item = app.item || app.object;
        if (!item || item.type !== "talent") {
            return;
        }

        inject_skill_dropdown(item, html);
    });

    Hooks.on("renderChatMessage", async (message, html, messageData) => {
        // Inject talent pills into roll messages
        if (!game.settings.get("ffg-star-wars-enhancements", "talent-skill-association")) {
            return;
        }
        if (!message.rolls || message.rolls.length === 0) {
            return;
        }
        if (html.find(".effg-talent-pills").length > 0) {
            return;
        }

        const flavor = message.flavor;
        if (!flavor) {
            return;
        }
        const rollingPrefix = game.i18n.localize("SWFFG.Rolling") + " ";
        if (!flavor.startsWith(rollingPrefix)) {
            return;
        }
        const skill = flavor
            .replace(rollingPrefix, "")
            .replace("...", "")
            .replace(/\s/g, " ");

        const speakerActorId = message.speaker?.actor;
        if (!speakerActorId) {
            return;
        }
        const actor = game.actors.get(speakerActorId);
        if (!actor) {
            return;
        }

        // For GM-owned actors, only show talent pills to the GM
        if (!actor.hasPlayerOwner && !game.user.isGM) {
            return;
        }

        const talents = find_associated_talents(actor, skill);
        if (talents.length === 0) {
            return;
        }

        const pillDivs = build_talent_pills_html(talents);
        html.append(pillDivs);

        // item card tooltips
        html.find(".hover-tooltip").on("mouseover", (event) => {
            itemPillHover(event);
        });
    });
}

/**
 * Get the current associated skills array from an item, handling backward compatibility
 * with the old single-string format.
 */
function get_associated_skills(item) {
    const flagValue = item.getFlag("ffg-star-wars-enhancements", "associatedSkill");
    if (!flagValue) {
        return [""];
    }
    // Backward compatibility: convert old string format to array
    if (typeof flagValue === "string") {
        return [flagValue];
    }
    if (Array.isArray(flagValue)) {
        return flagValue.length > 0 ? flagValue : [""];
    }
    return [""];
}

/**
 * Build the HTML for a single skill dropdown row.
 */
function build_skill_row(skillOptions, currentValue, index, totalRows) {
    let optionsHtml = `<option value="">${game.i18n.localize("ffg-star-wars-enhancements.talent-skill-association-none")}</option>`;
    for (const skill of skillOptions) {
        const selected = skill.value === currentValue ? "selected" : "";
        optionsHtml += `<option value="${skill.value}" ${selected}>${skill.label}</option>`;
    }

    let buttonsHtml = `<a class="effg-skill-add" title="${game.i18n.localize("ffg-star-wars-enhancements.talent-skill-association-add")}"><i class="fas fa-plus"></i></a>`;
    if (totalRows > 1) {
        buttonsHtml += ` <a class="effg-skill-remove" data-index="${index}" title="${game.i18n.localize("ffg-star-wars-enhancements.talent-skill-association-remove")}"><i class="fas fa-minus"></i></a>`;
    }

    return `
        <div class="effg-skill-row" data-index="${index}" style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <select style="text-align: center; flex: 1;" class="effg-skill-select" data-index="${index}">
                ${optionsHtml}
            </select>
            ${buttonsHtml}
        </div>
    `;
}

/**
 * Inject an "Associated Skill" dropdown into the talent sheet header.
 */
function inject_skill_dropdown(item, html) {
    const currentValues = get_associated_skills(item);
    const skillOptions = get_skill_options();

    let rowsHtml = "";
    for (let i = 0; i < currentValues.length; i++) {
        rowsHtml += build_skill_row(skillOptions, currentValues[i], i, currentValues.length);
    }

    const blockHtml = `
        <div class="resource single effg-associated-skill">
            <div class="attribute flex-group-center">
                <div class="block-background">
                    <div class="block-title">
                        ${game.i18n.localize("ffg-star-wars-enhancements.talent-skill-association-label")}
                    </div>
                    <div class="block-attribute effg-skill-rows">
                        ${rowsHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Find the last container in the header-fields and append our block
    const headerFields = html.find(".header-fields");
    if (headerFields.length === 0) {
        const altHeader = html.is(".header-fields") ? html : html.find(".header-fields");
        if (altHeader.length === 0) {
            log(feature_name, "Could not find header-fields in talent sheet");
            return;
        }
    }

    const containers = headerFields.find(".container.flex-group-center");
    if (containers.length > 0) {
        const wrapper = $(`<div class="container flex-group-center">${blockHtml}</div>`);
        containers.last().after(wrapper);

        // Change handler for dropdowns
        wrapper.on("change", ".effg-skill-select", async (event) => {
            const index = parseInt($(event.target).data("index"));
            const newValue = event.target.value;
            const skills = get_associated_skills(item);
            skills[index] = newValue;
            await item.setFlag("ffg-star-wars-enhancements", "associatedSkill", skills);
        });

        // Add button handler
        wrapper.on("click", ".effg-skill-add", async (event) => {
            event.preventDefault();
            const skills = get_associated_skills(item);
            skills.push("");
            await item.setFlag("ffg-star-wars-enhancements", "associatedSkill", skills);
        });

        // Remove button handler
        wrapper.on("click", ".effg-skill-remove", async (event) => {
            event.preventDefault();
            const index = parseInt($(event.currentTarget).data("index"));
            const skills = get_associated_skills(item);
            skills.splice(index, 1);
            if (skills.length === 0) {
                skills.push("");
            }
            await item.setFlag("ffg-star-wars-enhancements", "associatedSkill", skills);
        });
    } else {
        log(feature_name, "Could not find containers in talent sheet header");
    }
}

/**
 * Check if a flag value matches the given skill name.
 */
function flag_matches_skill(talentAssociatedSkills, skillName) {
    if (!talentAssociatedSkills) return false;
    const associatedSkills = Array.isArray(talentAssociatedSkills) ? talentAssociatedSkills : [talentAssociatedSkills];
    return associatedSkills.some(s => s && s.toLowerCase() === skillName.toLowerCase());
}

/**
 * Truncate a description string for tooltip display.
 */
function truncate_description(descHtml) {
    if (!descHtml) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = descHtml;
    let text = tmp.textContent || tmp.innerText || "";
    if (text.length > 200) {
        text = text.substring(0, 200) + "...";
    }
    return text;
}

/**
 * Build a map of talent name (lowercase) -> associatedSkill flag value
 * by scanning standalone talent items and specialization tree talents.
 */
function build_associated_skill_map(actor) {
    const map = new Map();

    // Standalone talent items (flags accessed via getFlag)
    for (const talent of actor.items.filter(item => item.type === "talent")) {
        const flagValue = talent.getFlag("ffg-star-wars-enhancements", "associatedSkill");
        if (flagValue) {
            map.set(talent.name.toLowerCase(), flagValue);
        }
    }

    // Specialization tree talents (flags stored in plain data)
    for (const spec of actor.items.filter(item => item.type === "specialization")) {
        if (!spec.system?.talents) continue;
        for (const key of Object.keys(spec.system.talents)) {
            const specTalent = spec.system.talents[key];
            if (!specTalent?.name || !specTalent.islearned) continue;
            if (map.has(specTalent.name.toLowerCase())) continue;
            const flagValue = specTalent.flags?.["ffg-star-wars-enhancements"]?.associatedSkill;
            if (flagValue) {
                map.set(specTalent.name.toLowerCase(), flagValue);
            }
        }
    }

    return map;
}

/**
 * Find talents on an actor that are associated with a given skill name.
 * Uses the system's pre-computed talentList for correct accumulated ranks.
 * Returns an array of { name, rank, description } objects.
 */
export function find_associated_talents(actor, skillName) {
    if (!actor || !skillName) {
        return [];
    }

    const talentList = actor.talentList;
    if (!talentList || talentList.length === 0) {
        return [];
    }

    const skillMap = build_associated_skill_map(actor);
    const results = [];

    for (const talent of talentList) {
        const flagValue = skillMap.get(talent.name.toLowerCase());
        if (!flag_matches_skill(flagValue, skillName)) continue;

        const rank = talent.isRanked && talent.rank !== "N/A" ? talent.rank : null;

        results.push({ name: talent.name, rank: rank, description: talent.description });
    }

    return results;
}

/**
 * Give a custom, Star Wars FFG talent description on hover
 * @param event
 */
export async function itemPillHover(event) {
    event.preventDefault();

    const li = $(event.currentTarget);
    const itemName = li.data("item-embed-name");
    let desc = li.data("desc");
    desc = await foundry.applications.ux.TextEditor.enrichHTML(desc);
    
    let embeddedContent = `
    <section class="chat-msg-tooltip content">
      <section class="header">
        <div class="title">${itemName}</div>
      </section>
      <section class="description">
        ${desc}
      </section>
    </section>
  `;
    
    li.attr("data-tooltip", embeddedContent);
}

/**
 * Build HTML for talent pills to display in chat messages.
 */
export function build_talent_pills_html(talents) {
    if (!talents || talents.length === 0) {
        return "";
    }
    
    let html = `<details>
        <summary><span class="effg-talent-pills-label">${game.i18n.localize("ffg-star-wars-enhancements.talent-skill-association-talents")}:<br></span> </summary>`;

    for (const talent of talents) {
        const rankDisplay = talent.rank !== null ? ` ${talent.rank}` : "";
        const talentDesc = talent.description
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        html += `<div class="effg-talent-pill item-pill-hover hover-tooltip" data-item-embed-name="${talent.name}" data-desc="${talentDesc}" data-item-ranks="${rankDisplay}" data-tooltip="Loading...">`;
        html += `${talent.name}`;
        if (talent.rank !== null) {
            html += ` ${rankDisplay}`;
        }
        html += `</div> <br> `;
    }
    
    html+= `</details>`

    return html;
}