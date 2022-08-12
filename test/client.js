const {Client: SDK} = require("../index");

const client = new SDK({url: "http://n7.danbot.host", port: "2088"/*"3000"*/, token: "Auth"});

client.set("a", ["a", "c"]);