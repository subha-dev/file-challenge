import express from "express";
import path from "path";
import { Constants } from "./constants";
import { ApiRouter } from "./api-router";
import bodyParser from "body-parser";

const server = express();

server.use("/css", express.static(path.join(__dirname, "../src/css/")));
server.use(bodyParser.text());
server.use("/api", new ApiRouter().apiRouter);

server.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../src/views/index.html"));
});

const port = process.env.Port || Constants.Port;
server.listen(port, () => console.log(`Server is listening on port ${port}`));
