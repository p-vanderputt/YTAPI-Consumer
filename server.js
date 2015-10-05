var port = process.env.port || 1337;

var express = require('express');
var app = express();
var server = app.listen(port);

app.use("/Content", express.static(__dirname + "/Content"));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/apitest.html");
});

console.log("server listening on port %s", port);