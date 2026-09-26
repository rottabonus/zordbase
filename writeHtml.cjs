const fs = require("fs/promises");
const path = require("path");

const environment = process.argv[2]

const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link href="app.css" rel="stylesheet">
    <title>Project budgeting</title>
  </head>
  <body>
    <div id="root" data-environment="${environment}"></div>
    <script src="app.js"></script>
  </body>
</html>`;

fs.writeFile(path.join(__dirname, "www", "index.html"), html);
