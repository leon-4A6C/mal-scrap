const MAL = require("../");
const client = new MAL();

client.topAnime({limit: 50})
  .then(output => console.log(output))
