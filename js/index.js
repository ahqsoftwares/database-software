const fetch = require("node-fetch");

class DB {
         /**
          * Initialise the sdk
          * @param {{url: string, port?: number | string, token: string}} props 
          */
         constructor(props) {
                  const { url, port, token } = props;
                  if (!(url && token)) {
                           throw new Error("Invalid props! Props must be an object including properties url and token!");
                  }

                  this.url = url;
                  this.port = port != null ? `:${String(port)}` : "";
                  this.token = token;
                  this.uri = this.url + this.port;

                  fetch(`${this.uri}/all`, {
                           method: "get",
                           headers: {
                                    "x-verification-token": this.token
                           }
                  })
                  .then(async(data) => await data.json())
                  .then(async(result) => {
                           if (result.status !== 200) {
                                    throw new Error(`${result.status}\nMSG: ${result.msg ? result.msg : "No message!"}`);
                           }
                  });
         }

         /**
          * Get everything from database!
          * @returns {Error | Object} Data or an error
          */
         async all() {
                  const result = await fetch(`${this.uri}/all`, {
                           method: "get",
                           headers: {
                                    "x-verification-token": this.token
                           }
                  })
                  .then(async(data) => await data.json());
                  
                  if (result.status !== 200) {
                           throw new Error(`${result.status}\nMSG: ${result.msg ? result.msg : "No message!"}`);
                  }
                  return result.data;
         }

         /**
          * Get data from the server
          * @param {string} location 
          * @returns {Error | any} Output data or an error
          */
         async get(key) {
                  const result = await fetch(this.uri, {
                           method: "get",
                           headers: {
                                    "x-verification-token": this.token,
                                    "x-db-key": key
                           }
                  })
                  .then(async(data) => await data.json());
                  
                  if (result.status !== 200) {
                           throw new Error(`${result.status}\nMSG: ${result.msg ? result.msg : "No message!"}`);
                  }
                  return result.data;
         }

         /**
          * Set a item in database
          * @param {String} key 
          * @param {Boolean | String | Object | Array | Number} value 
          * @returns {Error | null} An Error / Promise according to the success of failure
          */
         async set(key, value) {
                  if (!(value !== null && typeof(key) === "string")) {
                           throw new Error("Key and value are a must and key must be a string!");;
                  }

                  const result = await fetch(this.uri, {
                           method: "post",
                           headers: {
                                    "x-verification-token": this.token,
                                    "x-db-key": key,
                                    "x-db-value": typeof(value) === "object" ? JSON.stringify(value) : value,
                                    "x-value-type": String(typeof(value))
                           }
                  })
                  .then(async(data) => await data.json());
                  
                  if (result.status !== 200) {
                           throw new Error(`${result.status}\nMSG: ${result.msg ? result.msg : "No message!"}`);
                  }

         }

         /**
          * Delete a key from the database
          * @param {String} key 
          * @returns {Error | null} An Error / Promise according to the success of failure
          */
         async delete(key) {
                  if (typeof(key) !== "string" || key === "") {
                           throw new Error("\"key\" must be a non-empty string")
                  }

                  const result = await fetch(this.uri, {
                           method: "delete",
                           headers: {
                                    "x-verification-token": this.token,
                                    "x-db-key": key
                           }
                  })
                  .then(async(data) => await data.json());
                  
                  if (result.status !== 200) {
                           throw new Error(`${result.status}\nMSG: ${result.msg ? result.msg : "No message!"}`);
                  }
         }
}

module.exports = DB;