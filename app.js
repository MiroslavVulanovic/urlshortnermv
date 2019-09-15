//Get requirements and set instances of them
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const shortUrl = require("./models/shortUrl");
app.use(bodyParser.json());
app.use(cors());
//Connect to the databease
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/shortUrls");

//Creates the databse entry
app.get('/new/:urlToShorten(*)', (req, res, next)=>{
    var { urlToShorten } = req.params;
//Regex for URL
var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
var regex = expression;
if(regex.test(urlToShorten) === true){
    var short = Math.floor(Math.random()*100000).toString();

    var data = new shortUrl(
        {
        originalUrl: urlToShorten,
        shorterUrl: short
        }
    );

    data.save(err=>{
        if(err){
            return res.send("Error saving to database");
        }
    });    

    return res.json(data);
}
else {
    var data = new shortUrl({
        originalUrl: "Url does not match",
        shorterUrl: "Invalid URL"       

    });
    return res.json(data);
}
});
//Allows node to find stsatic content
app.use(express.static(__dirname + '/public'));

//Query database and forward the original URL
app.get("/:urlToForward", (req, res, next)=>{
//Stores the value of param    
    var shorterUrl = req.params.urlToForward;

    shortUrl.findOne({"shorterUrl": shorterUrl}, (err, data)=>{
        if(err) return res.send("error reading database");
        var re = new RegExp("^(http|https)://", "i");
        var strToCheck = data.originalUrl;
        if(re.test(strToCheck)){
            res.redirect(301, data.originalUrl);
        }
        else {
            res.redirect(301, "http://" + data.originalUrl);
        }


    });
});







//Check if everything is working
app.listen(process.env.PORT || 3000, ()=>{
console.log("Everything is working!");
});