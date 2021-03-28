export function log_msg(feature, message) {
    if (game.settings.get('starwarsffg', 'enableDebug')) {
        console.log('ffg-star-wars-enhancements | ' + feature + ' | ' + message)
    }
}
