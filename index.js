const express = require('express');
const { WebClient } = require('@slack/web-api');
const {connection,UrlModel}=require("./db")
const shortid = require('shortid');

require("dotenv").config()

const app = express();

app.use(express.json());

app.get("/", (req,res)=>{
  res.send("Working....")
})

app.post('/shorten', async (req, res) => {
  try {
    const { longUrl } = req.body; 
    const shortUrl = shortid.generate(); 
    const urlData = new UrlModel({ longUrl, shortUrl }); 
    await urlData.save();
    res.json({ shortUrl });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect Logic
app.get('/:shortUrl', async (req, res) => {
  try {
    const { shortUrl } = req.params; 
    const urlData = await UrlModel.findOne({ shortUrl }); 
   
    if (urlData) {
      res.redirect(urlData.longUrl); 
    } else {
      res.status(404).json({ error: 'Short URL not found' }); 
    }
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const slackToken ='xoxb-6662841200978-6656258348502-JQCymNytOL08b5os9Fro2I4w';
const web = new WebClient(slackToken);

// Slack Slash Command Logic
app.post('/slack/command', async (req, res) => {
    try {
      const { text } = req.body; // Extract text from Slack command
      const longUrl = text.trim(); // Trim any leading/trailing whitespace
      const shortUrl = shortid.generate(); // Generate short URL using shortid
      const urlData = new UrlModel({ longUrl, shortUrl }); // Create new URL model instance
      await urlData.save(); // Save URL data to MongoDB
      
      // Send message to Slack with the generated short URL
      const responseText = `Short URL for ${longUrl} is: ${shortUrl}`; // Generate response text
      await web.chat.postMessage({
        channel: req.body.channel_id, // Send the response to the same channel where the command was invoked
        text: responseText
      });
      
      res.json({ text: 'Short URL created and sent to Slack!' }); // Return response to Slack
    } catch (error) {
      console.error('Error processing Slack command:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


app.listen(process.env.port, async() => {

try {
    await connection
    console.log("connected to DB");
} catch (error) {
    console.log(error);
}

    console.log(`Server is running on port 3500`);
  });

