# mal-scrape
scrapes info from myanimelist

## installation
```
npm install --save mal-scrape
```

## usage
```javascript

const MAL = require("mal-scrape");
const client = new MAL();

// get the top anime from rank 51-100
client.topAnime({limit: 50})
  .then(output => console.log(output));

// get the top manga and get the details of the number 1 ranked
client.topManga()
  .then(output => output[0].getDetails())
  .then(details => console.log(details));

// search for stuff
client.search("boku no", "anime")
  .then(data => console.log(data));

// get the details from the anime with the id 5114
client.getDetails(5114, "anime")
  .then(details => console.log(details))

```

#### there are more examples in the examples folder

## todo list
- [x] get top list
- [x] get details page
- [x] search for items
