const MAL = require("../");
const client = new MAL();

// search for stuff
client.search("boku no", "anime")
  .then(data => console.log(data));
