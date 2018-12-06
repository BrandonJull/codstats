/**
 * Calculate a player's kill:death ratio.
 * 
 * @param {*} kills The number of kills.
 * @param {*} deaths The number of deaths.
 */
let calcKDR = (kills, deaths) => {
    if (kills < 1 && deaths < 1) return 0;
    if (kills > 0 && deaths < 1) return kills;

    return (kills / deaths).toFixed(2);
}

/**
 * Calculate a team's win:loss ratio.
 * 
 * @param {*} wins The number of wins.
 * @param {*} losses The number of losses.
 */
let calcWLR = (wins, losses) => {
    if (wins < 1 && losses < 1) return 0;
    if (wins > 0 && losses < 1) return wins;

    return (wins / losses).toFixed(2);
}

module.exports = {
    calcKDR,
    calcWLR
}