import { log_msg as log } from './util.js'

let module_name = 'vehicle_roller';

export function init() {
    log(module_name, 'Initializing');
    // TODO: register a setting for the feature
    log(module_name, 'Initialized');
}

export async function intercept_vehicle_roll(...args) {
    // TODO: check if the feature is enabled
    let actor_type = args[0].actor.type;
    if (actor_type !== 'vehicle') {
        // TODO: we don't want to return, we want to allow the hook to continue
        log(module_name, 'Found roll from non-vehicle; ignoring')
        return args;
    }
    let skill = args[3];
    let roll = args[1];
    var actor = await configure_vehicle_roller(skill, roll);
    // TODO: handle if they close out of the actor selection dialog
    while (!actor.hasOwnProperty('pool')) {
        await sleep(50);
    }
    args[1] = actor.pool;
    return args;
}

class SelectVehicleActor extends FormApplication {
    constructor(skill, roll) {
        super();
        this.skill = skill;
        this.roll = roll;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/ffg-star-wars-enhancements/templates/vehicle_roller.html",
            id: "ffg-star-wars-enhancements-vehicle-roller-configure",
            title: "Select Actor",
        });
    }

    async getData() {
        // list of actors in the game
        let tmp_actors = game.actors.contents.filter(actor => actor.isOwner === true);
        // list of actors to pass to the formapplication
        let actors = [];
        /* step over all owned actors */
        for (var x=0; x < tmp_actors.length; x++) {
            if (tmp_actors[x].type !== 'vehicle') {
                actors.push({
                    'id': tmp_actors[x]['id'],
                    'name': tmp_actors[x]['name'],
                });
            }
        }

        return {
            actors: actors,
        };
    }

    async _updateObject(event, data) {
        var pool = get_dice_pool(data['actor'], this.skill, this.roll);
        this.pool = pool;
    }
}

export async function configure_vehicle_roller(skill, roll) {
    return await new SelectVehicleActor(skill, roll).render(true);
}

function get_dice_pool(actor_id, skill_name, incoming_roll) {
    let actor = game.actors.get(actor_id);
    var parsed_skill_name = convert_skill_name(skill_name);
    var skill = actor.data.data.skills[parsed_skill_name];
    var characteristic = actor.data.data.characteristics[skill.characteristic];

    let dicePool = new DicePoolFFG({
        ability: (Math.max(characteristic.value, skill.rank) + incoming_roll.ability) - (Math.min(characteristic.value, skill.rank) + incoming_roll.proficiency),
        proficiency: Math.min(characteristic.value, skill.rank) + incoming_roll.proficiency,
        boost: skill.boost + incoming_roll.boost,
        setback: skill.setback + status.setback + incoming_roll.setback,
        force: skill.force + incoming_roll.force,
        advantage: skill.advantage + incoming_roll.advantage,
        dark: skill.dark + incoming_roll.dark,
        light: skill.light + incoming_roll.light,
        failure: skill.failure + incoming_roll.failure,
        threat: skill.threat + incoming_roll.threat,
        success: skill.success + incoming_roll.success,
        triumph: skill.triumph + incoming_roll.triumph,
        despair: skill.despair + incoming_roll.despair,
        difficulty:  + incoming_roll.difficulty,
    });
    return dicePool;
}

function convert_skill_name(pool_skill_name) {
    log(module_name, 'Converting ' + pool_skill_name + ' to skill name');
    let skills = CONFIG.FFG.skills;
    for (var skill in skills) {
        if (skills[skill]['label'] === pool_skill_name) {
            log(module_name, 'Found mapping to ' + skill);
            return skill
        }
    }
    log(module_name, 'WARNING: Found no mapping!');
    return null;
}

/**
 * Helper function to delay code execution by an arbitrary amount
 * @param ms - number of MS to delay by
 * @returns {Promise<unknown>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
