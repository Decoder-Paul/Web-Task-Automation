var path = require("path");
var fs = require("fs");

this.externalInjection = function (filename) {
  return new Promise((resolve, reject) => {
      //console.log("reading file from" + process.cwd());
      var filepath = path.join(process.cwd(), filename);
      fs.readFile(filepath, 'utf8', (err, data) => {
          if (err) return reject(err);
          resolve(data);
      });
  });
}