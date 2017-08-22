const MAL = require("../");
const client = new MAL();

// client.topAnime()
//   .then(output => output[0].getDetails())
//   .then(details => console.log(details))

client.getDetails(32281, "anime")
  .then(details => console.log(details))
