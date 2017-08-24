# mal-scrape
scrapes info from myanimelist

## installation
```
npm install --save mal-scrape
```

## usage

when there is a function that takes options give it an Object with the uri GET params you want to give it, example:
`
client.topAnime({limit: 50})
`
will become:
`
https://myanimelist.net/topanime.php?limit=50
`


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

// search for boku no in anime and get the second page
client.search("boku no", "anime", {show:50})
  .then(data => console.log(data));

// get the details from the anime with the id 5114
client.getDetails(5114, "anime")
  .then(details => console.log(details));

// get videos from topAnime or topManga
client.topAnime()
  .then(anime => anime[0].getVideos())
  .then(videos => console.log(videos));

// get images from searches
client.search("boku no")
  .then(data => data[0].getImages())
  .then(images => console.log(images));

```

#### there are more examples in the examples folder

## todo list
- [x] get top list
- [x] get details page
- [x] get images from anime and manga
- [x] get videos from anime and manga

# docs
<a name="MAL"></a>

## MAL
the class that has all the functionality stuff

**Kind**: global class  

* [MAL](#MAL)
    * [new MAL(url)](#new_MAL_new)
    * [.topAnime(options)](#MAL+topAnime) ⇒ <code>promise</code>
    * [.topManga(options)](#MAL+topManga) ⇒ <code>promise</code>
    * [.top(type, options)](#MAL+top) ⇒ <code>promise</code>
    * [.getDetails(id, type)](#MAL+getDetails) ⇒ <code>promise</code>
    * [.search(q, type, options)](#MAL+search) ⇒ <code>promise</code>

<a name="new_MAL_new"></a>

### new MAL(url)
constructor, instantiates the object


| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | the base url to use, default: https://myanimelist.net |

<a name="MAL+topAnime"></a>

### mal.topAnime(options) ⇒ <code>promise</code>
get 50 of the top anime

**Kind**: instance method of [<code>MAL</code>](#MAL)  
**Returns**: <code>promise</code> - - a promise with the data  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | the GET options to give to the page |

<a name="MAL+topManga"></a>

### mal.topManga(options) ⇒ <code>promise</code>
get 50 of the top manga

**Kind**: instance method of [<code>MAL</code>](#MAL)  
**Returns**: <code>promise</code> - - a promise with the data  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | the GET options to give to the page |

<a name="MAL+top"></a>

### mal.top(type, options) ⇒ <code>promise</code>
get a top 50

**Kind**: instance method of [<code>MAL</code>](#MAL)  
**Returns**: <code>promise</code> - - a promise with the data  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| type | <code>string</code> | <code>&quot;anime&quot;</code> | the type of the top list: anime or manga |
| options | <code>object</code> |  | the GET options to give to the page |

<a name="MAL+getDetails"></a>

### mal.getDetails(id, type) ⇒ <code>promise</code>
get the details of an anime or manga

**Kind**: instance method of [<code>MAL</code>](#MAL)  
**Returns**: <code>promise</code> - - a promise with the data  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>number</code> |  | the id of the anime or manga |
| type | <code>string</code> | <code>&quot;anime&quot;</code> | the type of the thing you want the details from: anime or manga |

<a name="MAL+search"></a>

### mal.search(q, type, options) ⇒ <code>promise</code>
search for anime or manga, might also work for other things but I didn't test that

**Kind**: instance method of [<code>MAL</code>](#MAL)  
**Returns**: <code>promise</code> - - a promise with the data  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| q | <code>number</code> |  | the query/search terms |
| type | <code>string</code> | <code>&quot;anime&quot;</code> | the type of the thing you want to search: anime or manga |
| options | <code>string</code> |  | the GET options to give to the page |
