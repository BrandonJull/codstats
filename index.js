const stats = require('./lib/stats');

stats.generatePlayerEventStats('wwii').then(() => {
    // Log the time it took for the function to complete.
    console.timeEnd('generatePlayerEventStats');

    console.log('Data processing complete.');

    return stats.generateTeamEventStats('wwii');
}).then(() => {
    // Log the time it took for the function to complete.
    console.timeEnd('generateTeamEventStats');

    console.log('Data processing complete.');
}).catch(e => console.log(e));