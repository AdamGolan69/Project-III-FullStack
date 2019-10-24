// Infrastructure
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const usersLogic = require("./bll/usersLogic");
const followsLogic = require("./bll/followsLogic");
const vacationsLogic = require("./bll/vacationsLogic");
// Structure
const server = express();
const httpServer = http.createServer(server);
const socketServer = socketIO.listen(httpServer);
// The Usual Uses
server.use(express.json());
server.use(cors());
// The Three Socketeers
const allSockets = [];
socketServer.sockets.on("connection", socket => {
    allSockets.push(socket);
    socketServer.sockets.emit("id", socket.id);
    socket.on("connected", async (user) => {
        const id = +user.id;
        user.socket = socket.id;
        await usersLogic.socketUpdateUser(user);
        socketServer.sockets.emit("all-vacations", await vacationsLogic.getAllVacations());
        if (user.type === "user") {
            socketServer.sockets.emit("all-follows", await followsLogic.getDesignatedFollows(id));
        }
    })
    socket.on("add-follow", async (follow) => {
        await followsLogic.adddFollow(follow);
        socketServer.sockets.emit("all-follows", await followsLogic.getDesignatedFollows(follow.uID));
        socketServer.sockets.emit("admin-follows", await followsLogic.getAllFollows());
    })
    socket.on("delete-follow", async (follow) => {
        await followsLogic.deleteFollow(follow);
        socketServer.sockets.emit("all-follows", await followsLogic.getDesignatedFollows(follow.uID));
        socketServer.sockets.emit("admin-follows", await followsLogic.getAllFollows());
    })
    socket.on("give-all-follows", async () => {
        socketServer.sockets.emit("admin-follows", await followsLogic.getAllFollows());
    })
    socket.on("give-my-follows", async (id) => {
        socketServer.sockets.emit("user-follows", await followsLogic.getDesignatedFollows(+id));
    })
    socket.on("update-all", async (vacation) => {
        await vacationsLogic.updateVacation(vacation);
        socketServer.sockets.emit("all-vacations", await vacationsLogic.getAllVacations());
    })
    socket.on("add-vacation", async (vacation) => {
        await vacationsLogic.addVacation(vacation);
        socketServer.sockets.emit("all-vacations", await vacationsLogic.getAllVacations());
    })
    socket.on("delete-vacation", async (id) => {
        await followsLogic.deleteDesignatedFollows(id);
        await vacationsLogic.deleteVacation(id);
        socketServer.sockets.emit("all-vacations", await vacationsLogic.getAllVacations());
    })
    socket.on("disconnected", () => {
        allSockets.splice(allSockets.indexOf(socket), 1);
        usersLogic.socketDisconnectUser(socket.id);
    });
    // Bad Practice Socket Side
    socket.on("disconnect", () => {
        setTimeout(() => {
            allSockets.splice(allSockets.indexOf(socket), 1);
            usersLogic.socketDisconnectUser(socket.id);
        }, 1000);
    });
})
// Listening
httpServer.listen(3002, () => console.log("Listening to 3002"));