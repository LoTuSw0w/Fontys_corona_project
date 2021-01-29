const allMacAddresses = [
  "00:A0:C9:14:C8:29",
  "00:A0:C9:14:C8:30",
  "00:A0:C9:14:C8:31",
  "00:A0:C9:14:C8:32",
];


exports.getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

exports.getRandomMac = () => {
  return allMacAddresses[this.getRandomIntInclusive(0,4)];
}


console.log(this.getRandomMac());

//Source: https://bost.ocks.org/mike/shuffle/
// exports.shuffleMacAddress = (array) => {
//   var m = array.length,
//     t,
//     i;

//   // While there remain elements to shuffle…
//   while (m) {
//     // Pick a remaining element…
//     i = Math.floor(Math.random() * m--);

//     // And swap it with the current element.
//     t = array[m];
//     array[m] = array[i];
//     array[i] = t;
//   }

//   return array;
// };