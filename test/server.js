const Database = require("../index");

const server = new Database({"path": "./test/database.json", "port": 3000, "token": "a"});

server.on("ready", () => console.log("Server is online!"));

server.listen();