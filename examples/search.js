const MAL = require("../");
const client = new MAL();

client.search("boku no", "manga")
  .then(data => console.log(data));
