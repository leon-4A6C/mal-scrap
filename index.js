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

  _parseTopTr(tr, type="anime") {
    const out = {
      id: parseInt(tr.find(".detail .hoverinfo_trigger").attr("id").replace("#area", "")),
      ranking: parseInt(tr.find(".top-anime-rank-text").text()),
      title: tr.find(".detail .hoverinfo_trigger").text().replace(/\s\s+/g, ' ').trim(),
      href: tr.find(".hoverinfo_trigger").attr("href"),
      score: parseFloat(tr.find(".score .text").text()),
      posters: tr.find("img").data()
    };

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
    out.type = info.type;
    // add the info to the out
    out.info = info;

    return out;
  }

  topAnime(options) {
    return this._get(endpoints.topAnime, options)
      .then(text => {
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
    return this._get(endpoints.topManga, options)
      .then(text => {
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
}

module.exports = MAL
