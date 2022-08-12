const {Client: SDK} = require("../index");

const client = new SDK({url: "http://localhost", port: "3000", token: "a"});

(async() => {
         console.log(await client.get("a"));
         client.delete("a");
})();