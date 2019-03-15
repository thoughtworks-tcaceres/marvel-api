var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    request = require("request"),
    CryptoJS = require("crypto-js");
    
if(process.env.NODE_ENV !== "production")
    var api = require("./keys.js");

//default view engine, no longer need to add .ejs
app.set("view engine", "ejs");

//to use bodyParser
app.use(bodyParser.urlencoded({extended:true}));

//public folder for stylesheets
app.use(express.static(__dirname + "/public"));

//index page
app.get("/", (req, res) => {
    res.render("index");
});

//results page
app.get("/results", (req, res) => {
    if(process.env.NODE_ENV !== "production"){
        var apipublickey = api.apiKey.apiPublic;
        var apiprivatekey = api.apiKey.apiPrivate;
    } else {
        var apipublickey = process.env.apiPublic;
        var apiprivatekey = process.env.apiPrivate;
    }
    
    var web = "https://gateway.marvel.com:443/v1/public/characters?";
    var characterName = req.query.characterName;
    var nameStartsWith = req.query.nameStartsWith;
    var ts = new Date().getTime();
    var hashkey = CryptoJS.MD5(ts + apiprivatekey + apipublickey).toString();
    var url = "";
    url += web;
    if(characterName !== ""){
        url += "name=" + characterName;
        if(nameStartsWith !== ""){
            url += "&nameStartsWith=" + nameStartsWith;
        }
    } else {
        url += "nameStartsWith=" + nameStartsWith;
    }
    url += "&ts=" + ts + "&apikey=" + apipublickey + "&hash=" + hashkey;
    
    //var url = web + characterName + "&ts=" + ts + "&apikey=" + apipublickey + "&hash=" + hashkey;
    console.log(url);
    request(url, (error, response, body) => {
        if(!error && response.statusCode === 200){
            var parsedData = JSON.parse(body);
            res.render("results", {
                                parsedData: parsedData
                                });
        }
    });
});

//error message
app.get("*", (req, res) => {
    res.send("this page does not exist");
});

//start the server
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("**********server has started**********");
});