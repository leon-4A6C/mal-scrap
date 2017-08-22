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
    let res = "";
    for (var opt in options) {
      res += `&${opt}=${options[opt]}`;
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
    console.log(this.base + this._parsePathParam(path, param) + this._genOptions(options));
    return fetch(this.base + this._parsePathParam(path, param) + this._genOptions(options))
      .then(res => res.text())
  }

  topAnime(options) {
    return this._get(endpoints.topAnime, options)
      .then(text => {

        const output = [];

        const $ = cheerio.load(text);
        $(".top-ranking-table tbody").children().each(function(i, elem) {
          const tr = $(this);
          if (tr.hasClass("ranking-list")) {
            const out = {
              ranking: tr.find(".top-anime-rank-text").text(),
              title: tr.find(".di-ib .hoverinfo_trigger").text().replace(/\s\s+/g, ' ').trim(),
              href: tr.find(".hoverinfo_trigger").attr("href"),
              score: tr.find(".score .text").text(),
              posters: tr.find("img").data()
            };
            const posters = {};
            const x = out.posters.srcset.split(",");
            for (let src in x) {
              const piece = x[src].trim().split(" ");
              posters[piece[1]] = piece[0];
            }
            out.posters.srcset = posters;
            output.push(out);
          }
        });
        console.log(output);
      });
  }
}

const client = new MAL();
client.topAnime();
