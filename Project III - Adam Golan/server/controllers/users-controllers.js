const express = require("express");
const router = express.Router();
const usersLogic = require("../bll/usersLogic");
router.get("/names", async (req, res) => {
    try{
        const names = await usersLogic.getUserNames();
        res.json(names);
    }
    catch(err){
        res.status(500).json(err.message);
    }
});
router.get("/:user", async (req, res) => {
    try{
        const userName = req.params.user;
        const user = await usersLogic.getOneUser(userName);
        res.json(user);
    }
    catch(err){
        res.status(500).json(err.message);
    }
});
router.patch("/", async (req, res) => {
    try{
        const userObj = req.body;
        const user = await usersLogic.updateUser(userObj);
        res.json(user);
    }
    catch(err){
        res.status(500).json(err.message);
    }
});
router.post("/", async (req, res) => {
    try{
        const userObj = req.body;
        const user = await usersLogic.addUser(userObj);
        res.json(user);
    }
    catch(err){
        res.status(500).json(err.message);
    }
});
module.exports = router;