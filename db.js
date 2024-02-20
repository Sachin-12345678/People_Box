const mongoose=require("mongoose")
require("dotenv").config()

const connection=mongoose.connect(process.env.mongoURL)

const urlSchema = new mongoose.Schema({
    longUrl: String,
    shortUrl: String
  });
  
  const UrlModel = mongoose.model('Url', urlSchema);
  module.exports={connection,UrlModel}