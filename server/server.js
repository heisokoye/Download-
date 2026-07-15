const express = require("express"); //this imports node modules
const cors = require("cors");
const { YtDlp } = require("ytdlp-nodejs");

const ytdlp = new YtDlp()
const app = express();// this line creates the server

app.use(cors({
    origin: process.env.FRONTEND_URL || "*", // Allow specific frontend or all
})); 
app.use(express.json()); // this line allows our backend to accept json data

const PORT = process.env.PORT || 5000 //this is the port number

app.get("/", (req, res)=>{
    res.send("Hello from my backend!")
})

app.post("/download", async(req, res) => {
    try{
        
        const {url} = req.body
        
        console.log(`recieved url: ${url}`)

        const info = await ytdlp.getInfoAsync(url);
        console.log("Video title:", info.title)
        res.json(info);

    }
    catch(err){
        console.log(err)
        res.status(500).json({
            message: err.message,
            stack: err.stack
        })
    }

});

const fs = require('fs');
const path = require('path');

app.post("/download-file", async (req, res) => {
    try {
        const { url, formatId } = req.body;
        
        if (!url || !formatId) {
            return res.status(400).json({ error: "Missing url or formatId" });
        }

        console.log(`Downloading ${url} with format ${formatId}`);

        // Ensure downloads directory exists
        const downloadsDir = path.join(__dirname, "downloads");
        if (!fs.existsSync(downloadsDir)){
            fs.mkdirSync(downloadsDir);
        }

        const timestamp = Date.now();
        const filename = `download_${timestamp}.mp4`;
        const tempPath = path.join(downloadsDir, filename);

        // Download and merge the requested video format with the best available audio
        await ytdlp.execAsync(url, {
            format: `${formatId}+bestaudio/best`,
            mergeOutputFormat: 'mp4',
            output: tempPath,
            concurrentFragments: 4 // This will massively speed up the download!
        });

        console.log(`Download complete, sending file: ${filename}`);

        res.download(tempPath, "downloaded_video.mp4", (err) => {
            if (err) {
                console.error("Error sending file:", err);
            }
            // Cleanup file after download is complete or failed
            fs.unlink(tempPath, (unlinkErr) => {
                if (unlinkErr) console.error("Error cleaning up temp file:", unlinkErr);
            });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})