/**
 * Use this function as a setting's type to add a file-picker.
 * @param {object} val
 * @returns val
 */
export function setting_image(val) {
    return val;
}

/**
 * Use this function as a setting's type to add a file-picker.
 * @param {object} val
 * @returns val
 */
export function setting_audio(val) {
    return val;
}

/**
 * Register SettingsConfig hook to render file-picker buttons.
 */
export function init() {
    libWrapper.register("ffg-star-wars-enhancements", "SettingsConfig.prototype.activateListeners", (wrapper, ...args) => {
        var html = args[0];
        html.find('[data-dtype^="setting"]').each((idx, input) => {
            input = $(input);
            const button = $('<button type="button" class="file-picker"><i class="fas fa-file-import"/></button>');
            button.attr('data-type', input.data('dtype').replace(/^setting_/, ""));
            button.attr('data-target', input.attr('name'));
            input.after(button);
        });
        wrapper(...args);
    }, "WRAPPER");
}
