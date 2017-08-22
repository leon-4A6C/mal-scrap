const MAL = require("../");
const client = new MAL();

client.topAnime({limit: 50})
  .then(output => console.log(output))

client.topManga({limit: 50})
  .then(output => output[0].getDetails())
  .then(details => console.log(details))
