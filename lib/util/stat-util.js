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
};

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
};

/**
 * Calculate a player's accuracy percentage.
 * 
 * @param {*} hits The amount of bullets that hit.
 * @param {*} shots The total amount of shots.
 */
let calcAccuracy = (hits, shots) => {
    if (hits < 1 || shots < 1) return 0;

    return ((hits / shots) * 100).toFixed(2);
};

/**
 * WWII - Declare a list of indexes for each statistic based on the game
 * title. Activision does not keep fully consistent formatting in
 * the CSV files, so we must predefine the indexes for each title.
 */
let WWII = {
    team: 6,
    player: 7,
    wl: 8,
    kills: 10,
    deaths: 11,
    hits: 22,
    shots: 23
}

/**
 * BO4 - Declare a list of indexes for each statistic based on the game
 * title. Activision does not keep fully consistent formatting in
 * the CSV files, so we must predefine the indexes for each title.
 */
let BO4 = {
    team: 6,
    player: 7,
    wl: 8,
    kills: 10,
    deaths: 11,
    hits: 25,
    shots: 26
}

module.exports = {
    calcKDR,
    calcWLR,
    calcAccuracy,
    WWII,
    BO4
}