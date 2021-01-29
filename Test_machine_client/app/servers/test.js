const fs = require('fs');

var linesArray = fs.readFileSync('app/Controllers/Logs/currentlyConnectedMachine.txt', "utf8").split('\n');
console.log(linesArray);