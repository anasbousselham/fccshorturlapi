'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var validUrl = require('valid-url');
var shortid = require('shortid');
var bodyParser = require("body-parser");
var url = require("url");
var Model = mongoose.model;

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

mongoose.connect(process.env.DB_URI,{useNewUrlParser:true, useUnifiedTopoLogy:true}).then(()=>{
  console.log('Db connected')
},err =>{
    console.log('Db Error',err)
  })

const urlShortSchema = new mongoose.Schema({
  url:{
    type:String,
    required:true    
  },
short:{
  type:String,
  //required:true,
 
}
  
})

var UrlCount = mongoose.model('UrlCount',urlShortSchema)

app.post('/api/shorturl/new',async (req,res)=>{
  const newUrl = req.body.url;
  const newID = shortid.generate()
  if (validUrl.isUri(newUrl)){
   const numOfDocuments = await UrlCount.countDocuments();

    await UrlCount.create({ url: newUrl, short: newID });

    res.json({ original_url: newUrl, short_url: newID});
    
  }else{
    res.json({ error: "invalid URL" });
  }
  
})

app.get("/api/shorturl/:short_url", (req, res,next) => {
  const short_url = req.params.short_url;

  const document = UrlCount.findOne({ short: short_url },(err,done)=>{
    console.log(done.url)
    res.redirect(done.url)
  });

 // res.redirect(document.url);
//  res.json({url:document.short})
  
});




app.listen(port, function () {
  console.log('Node.js listening ...');
});