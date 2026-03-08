import { log_msg as log } from "./util.js";

let feature_name = "talent_skill_association";

/**
 * Get the list of skills available in the current game system.
 * Reads from the actor's skill data at runtime rather than importing the static default list,
 * since GMs can customize skills.
 */
function get_skill_options() {
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

export function talent_skill_association_ready() {
    if (!game.settings.get("ffg-star-wars-enhancements", "talent-skill-association")) {
        return;
    }

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

        const talents = find_associated_talents(actor, skill);
        if (talents.length === 0) {
            return;
        }

        const pillDivs = build_talent_pills_html(talents);

        let specials = html.find(".specials");
        if (specials.length > 0) {
            specials.append(pillDivs);
        }

        const htmlString =
            `<div class="item-display">
            <div class="specials">
                <h5>
                  ${pillDivs}
                </h5>
            </div>
        </div>`;

        html.append(htmlString);

        // item card tooltips
        html.find(".item-display .specials .hover-tooltip").on("mouseover", (event) => {
            itemPillHover(event);
        });
    });
}

/**
 * Inject an "Associated Skill" dropdown into the talent sheet header.
 */
function inject_skill_dropdown(item, html) {
    const currentValue = item.getFlag("ffg-star-wars-enhancements", "associatedSkill") || "";
    const skillOptions = get_skill_options();

    // Build the dropdown HTML to match the system's ffg-block style
    let optionsHtml = `<option value="">${game.i18n.localize("ffg-star-wars-enhancements.talent-skill-association-none")}</option>`;
    for (const skill of skillOptions) {
        const selected = skill.value === currentValue ? "selected" : "";
        optionsHtml += `<option value="${skill.value}" ${selected}>${skill.label}</option>`;
    }

    const blockHtml = `
        <div class="resource single effg-associated-skill">
            <div class="attribute flex-group-center">
                <div class="block-background">
                    <div class="block-title">
                        ${game.i18n.localize("ffg-star-wars-enhancements.talent-skill-association-label")}
                    </div>
                    <div class="block-attribute">
                        <select style="text-align: center;" class="effg-skill-select">
                            ${optionsHtml}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Find the last container in the header-fields and append our block
    const headerFields = html.find(".header-fields");
    if (headerFields.length === 0) {
        // Try alternative: find in the element itself (Foundry v13 compatibility)
        const altHeader = html.is(".header-fields") ? html : html.find(".header-fields");
        if (altHeader.length === 0) {
            log(feature_name, "Could not find header-fields in talent sheet");
            return;
        }
    }

    // Insert after the last .container in header-fields
    const containers = headerFields.find(".container.flex-group-center");
    if (containers.length > 0) {
        const wrapper = $(`<div class="container flex-group-center">${blockHtml}</div>`);
        containers.last().after(wrapper);

        // Attach change handler
        wrapper.find(".effg-skill-select").on("change", async (event) => {
            const newValue = event.target.value;
            if (newValue === "") {
                await item.unsetFlag("ffg-star-wars-enhancements", "associatedSkill");
            } else {
                await item.setFlag("ffg-star-wars-enhancements", "associatedSkill", newValue);
            }
        });
    } else {
        log(feature_name, "Could not find containers in talent sheet header");
    }
}

/**
 * Find talents on an actor that are associated with a given skill name.
 * Returns an array of { name, rank, description } objects.
 */
export function find_associated_talents(actor, skillName) {
    if (!actor || !skillName) {
        return [];
    }

    const talents = actor.items.filter(item => item.type === "talent");
    const results = [];

    for (const talent of talents) {
        const associatedSkill = talent.getFlag("ffg-star-wars-enhancements", "associatedSkill");
        if (!associatedSkill) {
            continue;
        }

        // Case-insensitive comparison to handle localization differences
        if (associatedSkill.toLowerCase() === skillName.toLowerCase()) {
            const isRanked = talent.system?.ranks?.ranked;
            const rank = isRanked ? (talent.system?.ranks?.current || 0) : null;
            // Get the short description (first 200 chars of description text)
            let description = "";
            if (talent.system?.description) {
                // Strip HTML tags for tooltip
                const tmp = document.createElement("div");
                tmp.innerHTML = talent.system.description;
                description = tmp.textContent || tmp.innerText || "";
                if (description.length > 200) {
                    description = description.substring(0, 200) + "...";
                }
            }

            results.push({
                name: talent.name,
                rank: rank,
                description: description,
            });
        }
    }

    return results;
}

/**
 * Give a custom, Star Wars FFG talent description on hover
 * @param event
 */
export function itemPillHover(event) {
    event.preventDefault();

    const li = $(event.currentTarget);
    const itemName = li.data("item-embed-name");
    let desc = li.data("desc");
    
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

    let html = `<span class="effg-talent-pills-label">${game.i18n.localize("ffg-star-wars-enhancements.talent-skill-association-talents")}:</span> `;

    for (const talent of talents) {
        const rankDisplay = talent.rank !== null ? ` ${talent.rank}` : "";
        const talentDesc = talent.description
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        html += `<div class="item-pill-hover hover-tooltip" data-item-embed-name="${talent.name}" data-desc="${talentDesc}" data-item-ranks="${talent.rank}" data-tooltip="Loading...">`;
        html += `${talent.name}`;
        if (talent.rank !== null) {
            html += ` ${talent.rank}`;
        }
        html += `</div>`;
    }

    return html;
}