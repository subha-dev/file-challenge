import express, { Router } from "express";
import path from "path";
import lineReader from "line-reader";
import { Constants } from "./constants";
import fs from "fs";

export class ApiRouter {
    public apiRouter: Router;

    constructor() {
        this.apiRouter = express.Router();
        this.bindRoute();
    }

    private bindRoute(): void {
        this.apiRouter.route("/getEnvironment/:process").get((req, res) => {
            const processName = req.params.process;

            const filePath = path.join(Constants.ProcessPath, "../test/", processName, ".env");
            fs.stat(filePath, (err: NodeJS.ErrnoException, stats: fs.Stats) => {
                if (!err) {
                    const data: any = {};
                    lineReader.eachLine(filePath, (line, last) => {
                        if (line) {
                            const parts = line.split("=");
                            data[parts[0]] = parts[1];
                        }
                        if (last) {
                            res.json(data);
                        }
                    });
                } else if (err.code === "ENOENT") {
                    res.status(404).send(`No environment file found for process ${processName}`);
                } else {
                    res.status(500).send("Server error");
                }
            });
        });

        this.apiRouter.route("/setEnvironment/:process/:key/:value").post((req, res) => {
            const processName = req.params.process.trim();
            const key = req.params.key.trim();
            const value = req.params.value.trim();

            if (!processName || !key || !value) {
                res.status(400).send(`Process name and environment variables can't be empty.`);
                return;
            }
            const filePath = path.join(Constants.ProcessPath, "../test/", processName, ".env");
            fs.stat(filePath, (err: NodeJS.ErrnoException, stats: fs.Stats) => {
                if (!err) {
                    const data: any = {};
                    lineReader.eachLine(filePath, (line, last) => {
                        if (line) {
                            const parts = line.split("=");
                            data[parts[0]] = parts[1];
                        }
                        if (last) {
                            data[key] = value;
                            this.saveNewKeyValuePair(filePath, data);
                            res.json(data);
                        }
                    });
                } else if (err.code === "ENOENT") {
                    res.status(404).send(`No environment file found for process ${processName}`);
                } else {
                    res.status(500).send("Server error");
                }
            });
        });

        this.apiRouter.route("/newEnvironment").post((req, res) => {
            const processName = req.body;

            if (!processName) {
                res.status(400).send(`Process name can't be null or empty.`);
                return;
            }
            const directory = path.join(Constants.ProcessPath, "../test/", processName);
            const filePath = path.join(directory, ".env");
            fs.exists(directory, (exists: boolean) => {
                if (exists) {
                    res.status(400).send(`Environment file already exists for process ${processName}`);
                } else {
                    fs.mkdir(directory, (err: NodeJS.ErrnoException) => {
                        if (err) {
                            res.status(500).send("Failed to create directory!");
                        } else {
                            fs.writeFile(filePath, "\r\n", { encoding: "utf-8" }, (err: NodeJS.ErrnoException) => {
                                if (err) {
                                    res.status(500).send("Failed to create environment file!");
                                } else {
                                    res.send(`Success!`);
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    private saveNewKeyValuePair(filePath: string, data: any): void {
        let text = "";
        for (let key in data) {
            text += `${key}=${data[key]}\r\n`;
        }
        fs.writeFile(filePath, text, { encoding: "utf-8" }, (err: NodeJS.ErrnoException) => {
            if (err) {
                console.error(err);
            }
        });
    }
}
