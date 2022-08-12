const { EventEmitter } = require("events");
const { writeFile, readFileSync } = require("fs");

class Database extends EventEmitter {
         /**
          * Initialise database
          * @param {{path: string, port: string, token: string}} props 
          */
         constructor(props) {
                  super(EventEmitter);
                  
                  const app = require("express")();
                  const { path, port, token } = props;
                  if (!(path && port && token)) {
                           throw new Error("Unclear props");
                  }
                  this.port = port;
                  this.path = path;
                  this.json = JSON.parse("{}");
                  this.raw = "{}";
                  this.app = app;
                  this.token = token;
                  
                  this.read()
                  .then((data) => {
                           this.raw = data;
                           return data;
                  })
                  .catch(() => {
                           this.write()
                  })
                  .then((data) => {
                           this.json = JSON.parse(data);
                  })
                  .catch(() => {
                           this.write();
                           this.recover();
                  });
         }

         /**
          * Writes new reducer to database
          */
         async write() {
                  writeFile(this.path, JSON.stringify(this.json), (err) => {
                           if (err) {
                                    throw new Error("write sync failed!");
                           }
                  });
         }

         /**
          * Create new reducer to add corroupted data
          */
          async recover() {
                  writeFile(`${this.path}.recover.json`, String(this.raw), (err) => {
                           if (err) {
                                    throw new Error("write sync failed!");
                           }
                  });
         }

         /**
          * Reads reducer from database
          * @returns Boolean
          */
         async read() {
                  return await readFileSync(this.path);
         }

         /**
          * Starts your online db
          */
         async listen() {
                  this.app.listen(this.port);
                  this.emit("ready", this.port);

                  this.app
                  .use((req, res, next) => {
                           if (req.headers[`x-verification-token`] !== this.token) {
                                    res.status(404).json({status: 404, msg: "Unauthenticated!"});
                           } else {
                                    next();
                           }
                  })
                  .get("/", async(req, res) => {
                           this.get(req, res);
                  })
                  .get("/all", async(req, res) => {
                           this.all(res, req);
                  })
                  .post("/", async(req, res) => {
                           this.edit(req, res);
                  })
                  .delete("/", async(req, res) => {
                           this.delete(req, res);
                  })
                  .all("/*", (req, res) => {
                           res.status(404).json({status: 404, msg: "Not Found!", ...req.headers});
                  });
         }

         /**
          * Send all data to the client!
          * @param {Express.Response} res 
          */
         async all(res) {
                  res.status(200).json({status: 200, data: this.json});
         }

         /**
          * Fetch a file from database
          * @param {Express.Request} req 
          * @param {Express.Response} res 
          */
         async get(req, res) {
                  const {"x-db-key": Query} = req.headers;
                  if (!Query) {
                           return res.status(404).json({status: 404});
                  }

                  res.status(200).json({data: this.json[Query], status: 200});
         }

         /**
          * Edit/Create a file in database
          * @param {Express.Request} req 
          * @param {Express.Response} res 
          */
         async edit(req, res) {
                  const {"x-db-key": key, "x-db-value": data, "x-value-type": type} = req.headers;
                  if (!(key && data)) {
                           return res.status(404).json({status: 404});
                  }

                  let value;

                  switch (type) {
                           case "boolean":
                                    switch (data){
                                             case "true":
                                                      value = true;
                                                      break;
                                             default:
                                                      value = false;
                                                      break;
                                    }
                                    break;

                           case "number":
                                    value = Number(data);
                                    break;

                           case "object":
                                    value = JSON.parse(data);
                                    break;

                           default:
                                    value = String(data);
                                    break;
                  }

                  if (this.json[key] !== value) {
                           this.json[key] = value;
                           await this.write();
                  }
                  await res.status(200).json({status: 200});
         }

         /**
          * Delete a data from database
          * @param {Express.Request} req 
          * @param {Express.Response} res 
          */
         async delete(req, res) {
                  const {"x-db-key": key} = req.headers;
                  if (!key) {
                           return res.status(404).json({status: 404});
                  }

                  if (this.json[key]) {
                           delete this.json[key];
                           await this.write();
                  }
                  await res.status(200).json({status: 200});
         }
}

module.exports = Database;
module.exports.Client = require("./js/index");