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

client.topAnime({limit: 50})
  .then(output => console.log(output))

client.topManga()
  .then(output => console.log(output))

```

## todo list
- [x] get top list
- [x] get details page
- [x] search for items
