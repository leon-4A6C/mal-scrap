const MAL = require("../");
const client = new MAL();

client.topAnime()
  .then(output => console.log(output))
