// Infrastructure
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const usersControllers = require("./controllers/users-controllers");
// Structure
const upload = multer({ dest: `${__dirname}\\assets\\vacationsImg` });
const server = express();
// The Usual Uses
server.use(express.json());
server.use(cors());
server.use("/api/users", usersControllers);
server.use(express.static(__dirname));
// The Matrix Uploaded
server.post("/upload-image", upload.any(), (req, res) => {
    const fileType = path.extname(req.files[0].originalname);
    const fileOriginal = `${req.files[0].destination}\\${req.body.name}${fileType}`;
    const multerFilename = `${req.files[0].destination}\\${req.files[0].filename}`;
    fs.rename(multerFilename, fileOriginal, err => {
        if (err) {
            res.status(500).json(err);
            return;
        }
        res.send("Done.");
    });
});
server.delete("/upload-image", (req, res) => {
    const fileName = req.body.destination;
    fs.unlink(`${multer.dest}\\${fileName}.png`, (err) => {
        if (err) {
            fs.unlink(`${__dirname}\\assets\\vacationsImg\\${fileName}.jpg`, (err) => {
                if(err){
                    console.log(err);
                    return;
                }
            })
        }
    })
});
// Listening
server.listen(3001, () => console.log("Listening to 3001"));