const fs = require('fs');
const path = require('path');
const parse = require('csv-parse');
const mkdirp = require('mkdirp');

const statUtil = require('./util/stat-util');

/**
 * Iterate over each CWL event file and calculate
 * cumulitive player stats for each event for each player in
 * the given CWL event.
 * 
 * @param {string} game The game title to process.
 */
let generatePlayerEventStats = (game) => {
    console.time('generatePlayerEventStats');

    return new Promise(function (resolve, reject) {
        let dataPath, outPath, dataColumns;
        let processList = [];
    
        // Set the data file path and output file path based on the game.
        switch(game) {
            case 'wwii':
                dataPath = path.join(__dirname, '..', 'data', 'game', 'wwii/');
                outPath = path.join(__dirname, '..', 'data', 'out', 'game', 'wwii', 'player/');
                dataColumns = statUtil.WWII;
                break;
            case 'bo4':
                dataPath = path.join(__dirname, '..', 'data', 'game', 'bo4/');
                outPath = path.join(__dirname, '..', 'data', 'out', 'game', 'bo4', 'player/');
                dataColumns = statUtil.BO4;
                break;
            default:
                return reject(new Error(`Invalid game parameter: ${game}`));
        }

        // Create the output directory if it doesn't already exist.
        if (!fs.exists(outPath)) mkdirp.sync(outPath, (e) => reject(e));
    
        // Iterate over each file in the data directory synchronously.
        fs.readdirSync(dataPath).forEach((file) => {
            // Ignore any files that are not .CSV data files and directories.
            if (!file.includes('.csv')) return;

            processList.push(new Promise(function (resolve, reject) {
                fs.readFile(dataPath + file, (e, data) => {
                    if (e) return reject(e);
        
                    // The object in which holds each player's statistics for the current event.
                    let players = new Object();
        
                    // Output the current working file.
                    console.info("Processing file:", file);
        
                    // Parse the CSV content, line by line.
                    parse(data, { quote: '"', ltrim: true, rtrim: true, delimiter: ',', from_line: 2 })
                    .on('data', (data) => {
                        let currentPlayer = data[dataColumns.player];
        
                        // A check to see if the current player has been processed.
                        if (players === undefined || players[currentPlayer] === undefined) {      
                            players[currentPlayer] = {
                                id: data[dataColumns.player],
                                kills: 0,
                                deaths: 0,
                                kdr: 0.00,
                                hits: 0,
                                shots: 0,
                                accuracy: 0.00
                            }
                        }

                        players[currentPlayer].kills += parseInt(data[dataColumns.kills]);
                        players[currentPlayer].deaths += parseInt(data[dataColumns.deaths]);
                        players[currentPlayer].kdr = statUtil.calcKDR(players[currentPlayer].kills, players[currentPlayer].deaths);
                        players[currentPlayer].hits += parseInt(data[dataColumns.hits]);
                        players[currentPlayer].shots += parseInt(data[dataColumns.deaths]);
                        players[currentPlayer].accuracy = statUtil.calcAccuracy(players[currentPlayer].hits, players[currentPlayer].shots);
                    })
                    .on('end', () => {                  
                        // Synchronously create the new .json output file.
                        try {
                            fs.writeFileSync(outPath + path.parse(file).name + '.json', JSON.stringify(players));
                            resolve(console.log('Successfully wrote file: ' + path.parse(file).name + '.json'));
                        } catch (e) {
                            return reject(e);
                        }
                    });
                });
            }));
        });

        resolve(Promise.all(processList));
    });
};

/**
 * Iterate over each CWL event file and calculate
 * cumulitive team stats for each event for each team in
 * the given CWL event.
 * 
 * @param {string} game The game title to process.
 */
let generateTeamEventStats = (game) => {
    console.time('generateTeamEventStats');

    return new Promise(function (resolve, reject) {
        let dataPath, outPath;
        let processList = [];
    
        // Set the data file path and output file path based on the game.
        switch(game) {
            case 'wwii':
                dataPath = path.join(__dirname, '..', 'data', 'game', 'wwii/');
                outPath = path.join(__dirname, '..', 'data', 'out', 'game', 'wwii', 'team/')
                dataColumns = statUtil.WWII;
                break;
            case 'bo4':
                dataPath = path.join(__dirname, '..', 'data', 'game', 'bo4/');
                outPath = path.join(__dirname, '..', 'data', 'out', 'game', 'bo4', 'team/');
                dataColumns = statUtil.BO4;
                break;
            default:
                return reject(new Error(`Invalid game parameter: ${game}`));
        }

        // Create the output directory if it doesn't already exist.
        if (!fs.exists(outPath)) mkdirp.sync(outPath, (e) => reject(e));

        // Iterate over each file in the data directory synchronously.
        fs.readdirSync(dataPath).forEach((file) => {
            // Ignore any files that are not .CSV data files and directories.
            if (!file.includes('.csv')) return;

            processList.push(new Promise(function (resolve, reject) {
                fs.readFile(dataPath + file, (e, data) => {
                    if (e) return reject(e);
        
                    // The object in which holds each player's statistics for the current event.
                    let teams = new Object();
        
                    // Output the current working file.
                    console.info("Processing file:", file);
        
                    // Parse the CSV content, line by line.
                    parse(data, { quote: '"', ltrim: true, rtrim: true, delimiter: ',', from_line: 2 })
                    .on('data', (data) => {
                        let currentTeam = data[data];
        
                        // A check to see if the current team has been processed.
                        if (teams === undefined || teams[currentTeam] === undefined) {
                            // Initialize the current team as it does not exist.       
                            teams[currentTeam] = {
                                id: data[dataColumns.team],
                                wins: 0,
                                losses: 0,
                                wlr: 0.00,
                                players: []
                            }

                            // Add the first player encountered to the team's player array.
                            teams[currentTeam].players.push({
                                id: data[7],
                                kills: parseInt(data[dataColumns.kills]),
                                deaths: parseInt(data[dataColumns.deaths]),
                                kdr: statUtil.calcKDR(parseInt(data[10]), parseInt(data[11]))
                            });
                        } else {
                            // The team is already initialzed, add or update the current player in the players array.
                            let playerIndex = -1, player;

                            // If the player has already been pushed to the team's player array, find the index.
                            teams[currentTeam].players.forEach((e, index) => {
                                if (e.id === data[dataColumns.player]) {
                                    playerIndex = index;
                                    return;
                                }
                            });

                            // Set the player object dependant on whether or not the player exists or not.
                            if (playerIndex > -1)
                                player = teams[currentTeam].players[playerIndex];
                            else {
                                teams[currentTeam].players.push({
                                    id: data[dataColumns.player],
                                    kills: 0,
                                    deaths: 0,
                                    kdr: 0.00
                                });

                                player = teams[currentTeam].players[teams[currentTeam].players.length - 1];
                            }

                            // Add to the player's wins or losses and recalculate the win:loss ratio.
                            player.kills += parseInt(data[dataColumns.kills]);
                            player.deaths += parseInt(data[dataColumns.deaths]);
                            player.kdr = statUtil.calcKDR(player.kills, player.deaths);
                        }

                        // Add to the current team's wins or losses property and recalculate the win:loss ratio.
                        if (data[dataColumns.wl] === 'W') teams[currentTeam].wins++; else teams[currentTeam].losses++;
                        teams[currentTeam].wlr = statUtil.calcWLR(teams[currentTeam].wins, teams[currentTeam].losses);
                    })
                    .on('end', () => {                  
                        // Synchronously create the new .json output file.
                        try {
                            fs.writeFileSync(outPath + path.parse(file).name + '.json', JSON.stringify(teams));
                            resolve(console.log('Successfully wrote file: ' + path.parse(file).name + '.json'));
                        } catch (e) {
                            return reject(e);
                        }
                    });
                });
            }));
        });

        resolve(Promise.all(processList));
    });
};

module.exports = {
    generatePlayerEventStats,
    generateTeamEventStats
}