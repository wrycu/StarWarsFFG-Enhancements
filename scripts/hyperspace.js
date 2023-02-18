import { log_msg as log } from "./util.js";

/**
 * Register settings used by hyperspace.
 */
export function init() {
    log("hyperspace", "Initialized");
}

/**
 * Ready handler that listens on the ffg-star-wars-enhancements socket.
 */
export function ready() {
    log("hyperspace", "ready");
    game.socket.on("module.ffg-star-wars-enhancements", socket_listener);
}

/**
 * Launch hyperspace.
 * @param {object} data
 */
export function launch_hyperspace(data) {
    log("hyperspace", "launching");

    data = mergeObject(data, {
        type: "hyperspace",
    });
    game.socket.emit("module.ffg-star-wars-enhancements", data);
    socket_listener(data);
    log("hyperspace", "event emmitted");
}

/**
 * Listener for the ffg-star-wars-enhancements socket that launches the
 * scene transitions if the message type is "hyperspace"
 *
 * @param {object} data object passed to HyperspaceApplication
 */
function socket_listener(data) {
    log("socket", data);
    if (data.type == "hyperspace") {
        run_hyperspace(data);
    }
}

export function select_hyperspace() {
    new HyperspaceSelectApplication().render(true);
}

class HyperspaceSelectApplication extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/ffg-star-wars-enhancements/templates/hyperspace_select.html",
            id: "ffg-star-wars-enhancements-hyperspace-select",
            title: game.i18n.localize("ffg-star-wars-enhancements.controls.hyperspace.title"),
        });
    }
    async getData() {
        const scenes = game.scenes.map((scene) => {
            return {
                id: scene.id,
                name: scene.name,
                enter: scene.name == "Hyperspace (Enter)",
                exit: scene.name == "Hyperspace (Exit)",
            };
        });
        return { scenes };
    }

    _updateObject(event, data) {
        launch_hyperspace(data);
        log("hyperspace", "select");
    }
}

/**
 * Transition between the selected scenes.
 * @param {object} data
 */
async function run_hyperspace(data) {
    log("hyperspace", data);
    let enter_scene = game.scenes.get(data.hyperspace_enter);
    let exit_scene = game.scenes.get(data.hyperspace_exit);
    let target_scene = game.scenes.get(data.target_scene);

    // preload the scenes
    let enter_preload = game.scenes.preload(enter_scene.id);
    let exit_preload = game.scenes.preload(exit_scene.id);
    let target_preload = game.scenes.preload(target_scene.id);
    await Promise.all([enter_preload, exit_preload, target_preload]);

    // create the video element object
    let video = undefined;

    // Hide the loading bar
    $("#loading").css({ left: -10000 });

    // Checking negation to enter hyperspace for both enter and quick jump
    if (data.transition_type !== "exit_hyperspace") {
        log("hyperspace", "Entering hyperspace");
        // change to the hyperspace enter scene
        await enter_scene.view();
        video = find_video_layer(canvas);
        video.loop = false;
        video.currentTime = 0;
        await video.play();

        // wait for the video to end
        await new Promise((resolve) => {
            log("hyperspace", "Enter adding on-end hook");
            video.onended = () => {
                log("hyperspace", "Enter video ended");
                resolve();
            };
        });
    }
    // Checking negation to exit hyperspace for both exit and quick jump
    if (data.transition_type !== "enter_hyperspace") {
        log("hyperspace", "Exiting hyperspace");
        // change to the hyperspace enter scene
        await exit_scene.view();
        video = find_video_layer(canvas);
        video.loop = false;
        video.currentTime = 0;
        await video.play();

        // wait for the video to end
        await new Promise((resolve) => {
            log("hyperspace", "Exit adding on-end hook");
            video.onended = () => {
                log("hyperspace", "Exit video ended");
                resolve();
            };
        });
    }

    // Transitioning to final scene
    await target_scene.view();

    // Restore the loading bar
    $("#loading").css("left", "");
}

/**
 * Search the PIXI layers for the specified layer
 * @param {object} canvas canvas object
 */
function find_video_layer(canvas) {
    let to_search = ["RenderedCanvasGroup", "EnvironmentCanvasGroup", "PrimaryCanvasGroup"];
    let layer = canvas.app.stage.children;

    for (let i = 0; i < to_search.length; i++) {
        layer = _find_layer(layer, to_search[i])["children"];
    }
    // find the SpiteMesh layer, where the actual video is
    layer = _find_layer(layer, "SpriteMesh");
    if (!layer.isVideo) {
        // this is not a video, ignore it
        return false;
    } else {
        // return the HTML5 video element
        return layer.sourceElement;
    }
}

/**
 * Given a list of layers, find a specific layer
 * this is a bit brittle (it assumes the layer exists) but oh well. not worth the effort to fix it
 * @param layers  layers within the canvas, e.g. canvas.app.stage.children
 * @param layer_name name of the layer to look for
 * @private
 */
function _find_layer(layers, layer_name) {
    return layers.filter((i) => i.constructor.name === layer_name)[0];
}
