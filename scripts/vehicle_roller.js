import { log_msg as log } from './util.js'

let module_name = 'vehicle_roller';

export function init() {
    log(module_name, 'Initializing');
    // TODO: register a setting for the feature
    game.settings.register("ffg-star-wars-enhancements", "vehicle-roller", {
        name: game.i18n.localize('ffg-star-wars-enhancements.vehicle-roller'),
        hint: game.i18n.localize('ffg-star-wars-enhancements.vehicle-roller-hint'),
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });
    log(module_name, 'Initialized');
}

/**
 * Monkey patches rolls from a vehicle character sheet in order to build the dice pool for the user
 * @param args - actor the roll was made from, roll object, window title, skill of the roll, item being used by roll
 * @returns modified args
 */
export async function intercept_vehicle_roll(...args) {
    if (!game.settings.get("ffg-star-wars-enhancements", "vehicle-roller")) {
        return args;
    }
    let actor_type = args[0].actor.type;
    if (actor_type !== 'vehicle') {
        log(module_name, 'Found roll from non-vehicle; ignoring');
        return args;
    }
    let skill = args[3];
    let roll = args[1];
    let vehicle_actor = args[0].actor;
    // get possible actors
    let possible_actors = get_actors(vehicle_actor);

    if (possible_actors.length > 1) {
        log(module_name, 'Found >1 candidate actor, presenting options to user');
        // display a dialog to let the user pick between the actors
        var actor = await configure_vehicle_roller(skill, roll, possible_actors);
        // TODO: handle if they close out of the actor selection dialog
        while (!actor.hasOwnProperty('pool')) {
            await sleep(50);
        }
        // update the pool with the stuff added by the actor
        args[1] = actor.pool;
        // update the title to show the user who is making the roll
        args[2] = actor.actor_name + ' ' + args[2];
        // update the entity so the chat shows it properly
        args[0].actor = game.actors.get(actor.actor_id);
    } else if (possible_actors.length === 1) {
        log(module_name, 'Found exactly one candidate actor, updating pool');
        // only one potential actor was detected, just use it
        // update the pool with the stuff added by the actor
        args[1] = get_dice_pool(possible_actors[0].id, skill, roll);
        // update the title to show the user who is making the roll
        args[2] = game.actors.get(possible_actors[0].id).name + ' ' + args[2];
        // update the entity so the chat shows it properly
        args[0].actor = game.actors.get(possible_actors[0].id);
    }
    return args;
}

class SelectVehicleActor extends FormApplication {
    constructor(skill, roll, possible_actors) {
        super();
        this.skill = skill;
        this.roll = roll;
        this.possible_actors = possible_actors;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/ffg-star-wars-enhancements/templates/vehicle_roller.html",
            id: "ffg-star-wars-enhancements-vehicle-roller-configure",
            title: "Select Actor",
        });
    }

    async getData() {
        // list of actors to pass to the template for user selection
        let actors = [];
        /* step over detected actors (detected via the get_actors function) */
        for (var x=0; x < this.possible_actors.length; x++) {
            if (this.possible_actors[x].type !== 'vehicle') {
                actors.push({
                    'id': this.possible_actors[x]['id'],
                    'name': this.possible_actors[x]['name'],
                });
            }
        }

        return {
            actors: actors,
        };
    }

    async _updateObject(event, data) {
        var pool = get_dice_pool(data['actor'], this.skill, this.roll);
        var actor = game.actors.get(data['actor']);
        this.actor_name = actor.name;
        this.actor_id = actor.id;
        this.pool = pool;
    }
}

export async function configure_vehicle_roller(skill, roll, possible_actors) {
    return await new SelectVehicleActor(skill, roll, possible_actors).render(true);
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
            return skill;
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

/**
 * Capture a drag-and-drop event (used to capture adding crew members via a flag)
 * @param args - actor receiving the event, actor being dropped onto the recipient, ID of the actor being dropped on
 * @returns args - the input args (unmodified)
 */
export function register_crew(...args) {
    if (!game.settings.get("ffg-star-wars-enhancements", "vehicle-roller")) {
        return args;
    }
    // check if this is an actor being dragged onto a vehicle
    let vehicle_actor = args[0];
    let drag_actor = game.actors.get(args[2].id);
    if (vehicle_actor.data.type !== 'vehicle' || drag_actor.data.type === 'vehicle') {
        // the target is not a vehicle or the actor being dragged onto it is a vehicle
        return args;
    }
    // set up the flag data
    let flag_data = [];
    flag_data.push({
        'actor_id': drag_actor.id,
        'actor_name': drag_actor.name,
    });

    let existing_data = vehicle_actor.getFlag('ffg-star-wars-enhancements', 'crew');
    if (existing_data !== undefined && existing_data !== null) {
        // we already have crew data defined, check if this actor is already in the data
        let overlapping_data = existing_data.filter(existing => existing.actor_id === drag_actor.id);
        if (overlapping_data.length !== 0) {
            // this actor is already in the crew; bail
            return args;
        }
        flag_data = flag_data.concat(existing_data);
    }
    // set the flag data
    vehicle_actor.setFlag('ffg-star-wars-enhancements', 'crew', flag_data);
    return args;
}

/**
 * Given a vehicle actor, return a list of possible actors which could roll a weapon
 * @param vehicle - an FFGActor entity of type vehicle
 * @returns [FFGActor]
 */
function get_actors(vehicle) {
    log(module_name, 'Looking up possible actors for roll on ' + vehicle.name);
    // lookup flag data
    let actors = [];
    let vehicle_actor = game.actors.get(vehicle._id);
    let flag_data = vehicle_actor.getFlag('ffg-star-wars-enhancements', 'crew');
    if (flag_data !== undefined && flag_data !== null) {
        // crew has been defined, let's try to build a list
        for (var x=0; x < flag_data.length; x++) {
            let tmp_actor = game.actors.get(flag_data[x].actor_id);
            if (tmp_actor.isOwner) {
                // we found an owner
                actors.push(tmp_actor);
                log(module_name, 'Found candidate actor ' + tmp_actor.name + ' via crew settings');
            }
        }
    }
    if (actors.length === 0) {
        // either there's no crew or the person trying to roll doesn't own any of the actors on the crew
        // in either case, build a list of owned actors
        actors = game.actors.contents.filter(actor => actor.isOwner === true && actor.data.type !== 'vehicle');
        log(module_name, 'Found the following candidate actors via owned actors: ' + actors.map(actor_name => actor_name.name));
    }
    return actors;
}
