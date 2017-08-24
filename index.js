const fetch = require("node-fetch");
const cheerio = require("cheerio");
const endpoints = require("./endpoints");

class MAL {
  constructor() {
    this.base = "https://myanimelist.net";
  }
  // options can look like this
  // {limit: 50}
  _genOptions(options) {
    let i = 0;
    let res = "";
    for (let opt in options) {
      if (i === 0) {
        res += `?${opt}=${options[opt]}`;
      } else {
        res += `&${opt}=${options[opt]}`;
      }
      i++;
    }
    return res;
  }

  _parsePathParam(path, param) {
    const reg = /{(.*?)}/g; // get the stuff between the {}
    const arr = path.match(reg) || []; // array with the results of the regexp
    for (var i = 0; i < arr.length; i++) {
      let par = param[arr[i].substr(1, arr[i].length-2)];
      if (par) {
        path = path.replace(arr[i], par);
      } else {
        path = path.replace(arr[i], "");
      }
    }

    path = path.replace(/\/\/+/g, "/"); // remove double slashes
    return path;
  }

  _get(path, options, param) {
    return fetch(this.base + this._parsePathParam(path, param) + this._genOptions(options))
      .then(res => res.text())
  }

  // gets posters from poster data
  _parsePosters(out, type) {
    // get small posters
    const posters = {};
    const x = out.posters.srcset.split(", ");
    for (let src in x) {
      const piece = x[src].split(" ");
      posters[piece[1]] = piece[0];
    }
    out.posters.srcset = posters;

    // get big poster
    const posterBase = `https://myanimelist.cdn-dena.com/images/${type}`
    const pos = (out.posters.src.indexOf(`${type}/`)+type.length);
    const posterId = out.posters.src.substring(pos, out.posters.src.indexOf(".", pos)+4);
    out.posters.id = posterId;
    out.posters.big = posterBase + posterId;

    // doesn't return anything, because out is 'linked'
  }

  // gets posters from poster data
  _getPosters(elem, type) {
    // get small posters
    const posters = {};
    const data = elem.find("img").data()
    const x = data.srcset.split(", ");
    for (let src in x) {
      const piece = x[src].split(" ");
      posters[piece[1]] = piece[0];
    }
    data.srcset = posters;

    // get big poster
    const posterBase = `https://myanimelist.cdn-dena.com/images/${type}`
    const pos = (data.src.indexOf(`${type}/`)+type.length);
    const posterId = data.src.substring(pos, data.src.indexOf(".", pos)+4);
    data.id = posterId;
    data.big = posterBase + posterId;
    data.huge = posterBase + posterId.replace(".", "l.");

    return data;
  }

  _parseTopTr(tr, type="anime") {
    const out = {
      id: parseInt(tr.find(".detail .hoverinfo_trigger").attr("id").replace("#area", "")),
      ranking: parseInt(tr.find(".top-anime-rank-text").text()),
      title: tr.find(".detail .hoverinfo_trigger").text().replace(/\s\s+/g, ' ').trim(),
      href: tr.find(".hoverinfo_trigger").attr("href"),
      score: parseFloat(tr.find(".score .text").text()),
      posters: this._getPosters(tr, type),
      type: type
    };

    // parse information
    let info = tr.find(".information").text()
      .trim()
      .split("\n")
      .map(x => x.replace(/\s\s+/g, " "))

    info = {
      runtime: info[1].trim(),
      members: parseInt(info[2].replace(" members", "").replace(",", "").trim()),
      episodes: parseInt(info[0].replace(/[a-zA-Z()?]/g, "").trim()) || 0,
      type: info[0].replace(/[0-9()?]/g, "").replace(type == "anime" ? "eps" : "vols", "").trim()
    }
    // add the info to the out
    out.info = info;

    // add functions
    out.getDetails = () => this.getDetails(out.id, out.type);
    this._addFunctionsToOutput(out);

    return out;
  }

  _addFunctionsToOutput(output) {
    // add functions
    output.getPictures = () => this._getPictures(output.href);
    output.getPics = () => this._getPictures(output.href); // added a synonym
    output.getImages = () => this._getPictures(output.href); // added a synonym
    output.getVideos = () => this._getVideos(output.href);
  }

  topAnime(options) {
    return this._get(endpoints.topAnime, options).then(text => {
      return new Promise((resolve, reject) => {
        try {
          const output = [];

          const $ = cheerio.load(text);
          $(".top-ranking-table tbody").children().each((i, elem) => {
            const tr = $(elem);
            if (tr.hasClass("ranking-list")) {

              // push it to the output
              output.push(this._parseTopTr(tr));
            }
          });
          resolve(output);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  topManga(options) {
    return this._get(endpoints.topManga, options).then(text => {
      return new Promise((resolve, reject) => {
        try {
          const output = [];

          const $ = cheerio.load(text);
          $(".top-ranking-table tbody").children().each((i, elem) => {
            const tr = $(elem);
            if (tr.hasClass("ranking-list")) {

              // push it to the output
              output.push(this._parseTopTr(tr, "manga"));
            }
          });
          resolve(output);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  _getPictures(baseUrl) {
    const url = baseUrl+"/pics";
    return fetch(url)
      .then(data => data.text())
      .then(html => {
        return new Promise((resolve, reject) => {
          try {
            const $ = cheerio.load(html);
            const output = [];
            $(".js-picture-gallery").each((i, elem) => {
              output.push({
                huge: $(elem).attr("href"),
                big: $(elem).attr("href").replace("l.", ".")
              })
            });
            resolve(output);
          } catch (e) {
            reject(e);
          }
        });
      });
  }

  _getVideos(baseUrl) {
    const url = baseUrl+"/video";
    return fetch(url)
      .then(data => data.text())
      .then(html => {
        return new Promise((resolve, reject) => {
          try {
            const $ = cheerio.load(html);
            const output = [];
            $(".video-list-outer .video-list").each((i, elem) => {
              elem = $(elem);
              const youtubeHref = $(elem).attr("href");
              const out = {
                href: youtubeHref,
                youtube: youtubeHref.substring(youtubeHref.indexOf("/embed/")+"/embed/".length, youtubeHref.indexOf("?")),
                thumbnail: elem.find(".thumbs").data()
              };
              out.id = out.thumbnail.animeId;
              delete out.thumbnail.pinNoHover; // unneeded data, is for the site or something
              output.push(out);
            });
            resolve(output);
          } catch (e) {
            reject(e);
          }
        });
      });
  }

  getDetails(id, type="anime") {
    return this._get(endpoints.details, {}, {type: type, id: id}).then(text => {
      return new Promise((resolve, reject) => {
        try {
          const $ = cheerio.load(text);

          const youtubeHref = $(".video-promotion .video-unit").attr("href") || "";

          let output = {
            title: $("#contentWrapper h1 [itemProp=name]").text(),
            type: type,
            score: parseFloat($(".score").text().replace(/\s\s+/g, " ").trim()),
            rank: parseInt($(".ranked strong").text().replace("#", "")),
            popularity: parseInt($(".popularity strong").text().replace("#", "")),
            members: parseInt($(".members strong").text().replace(",", "")),
            synopsis: $("[itemProp=description]").text(),
            poster: $(".js-scrollfix-bottom img.ac").attr("src"),
            video: {
              href: youtubeHref,
              youtube: youtubeHref.substring(youtubeHref.indexOf("/embed/")+"/embed/".length, youtubeHref.indexOf("?"))
            },
            href: $("#horiznav_nav ul").children().find("a").attr("href")

          };

          output = Object.assign({}, output, getInfo());

          this._addFunctionsToOutput(output);

          function getInfo() {
            const out = {};
            $(".js-scrollfix-bottom h2").each((i, elem) => {

              let infoElem = $(elem).nextUntil("h2");
              const info = infoElem.text()
                         .replace(/\s\s+/g, " ")
                         .trim()
                         .split(/\w*: /g) /* gets the info tested on http://regexr.com/ with this text:
                                             English: Your Name. Japanese: 君の名は。
                                             Type: Movie Episodes: 1 Status: Finished Airing Aired: Aug 26, 2016 Producers: Kadokawa Shoten, Toho, Sound Team Don Juan, Lawson HMV Entertainment, Amuse, East Japan Marketing & Communications Licensors: Funimation Studios: CoMix Wave Films Source: Original Genres: Supernatural, Drama, Romance, School Duration: 1 hr. 46 min. Rating: PG-13 - Teens 13 or older
                                             Score: 9.261 (scored by 276,745 users) 1 indicates a weighted score. Please note that 'Not yet aired' titles are excluded. Ranked: #12 2 based on the top anime page. Please note that 'Not yet aired' and 'R18+' titles are excluded. Popularity: #60 Members: 469,007 Favorites: 22,690*/
                         .map(x => x.trim()) // trims it again
                         .filter(x => x !== ""); //remove empty strings
              const key = [];
              infoElem.text()
                      .replace(/\s\s+/g, " ")
                      .trim()
                      .replace(/\w*: /g, (match) => {
                        key.push(match);
                      })
              out[camelize(clean($(elem).text()))] = mapArrayToObject(key, info);

            });

            function clean(str) {
              return str.replace(/\s\s+/g, " ").trim().replace(":", "").trim()
            }

            // maps two arrays to one object
            function mapArrayToObject(key, items) {
              const output = {};

              for (var i = 0; i < key.length; i++) {
                output[camelize(clean(key[i]))] = items[i]
              }

              return output;
            }
            // turns a string into camelCase
            function camelize(str) {
              return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
                return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
              }).replace(/\s+/g, '');
            }

            return out;
          }

          resolve(output);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  _parseSearchItems(elem, type="anime") {
    const out = {
      title: elem.find(".hoverinfo_trigger strong").text(),
      href: elem.find("a.hoverinfo_trigger").attr("href"),
      id: parseInt(elem.find("a.hoverinfo_trigger").attr("id").replace("sarea", "")),
      type: type,
      synopsis: elem.find(".pt4").text().replace("read more.", ""),
      posters: this._getPosters(elem, type),
      // info: { // WIP
      //   type : "TV",
      //   score: 10,
      //   episodes: 13
      // }
    }

    this._addFunctionsToOutput(out);

    out.getDetails = () => this.getDetails(out.id, out.type);
    return out;
  }

  search(q, type="anime", options) {
    if (typeof type === "object") {
      options = type;
      type = "anime";
    }
    return this._get(endpoints.search, Object.assign({}, {q}, options), {type}).then(text => {
      return new Promise((resolve, reject) => {
        try {
          const $ = cheerio.load(text);

          const output = [];

          $(".js-block-list tbody").children().each((i, elem) => {
            if (i != 0) {
              output.push(this._parseSearchItems($(elem), type));
            }
          });

          resolve(output);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

}

module.exports = MAL
