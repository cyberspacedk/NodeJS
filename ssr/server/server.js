import express from'express';
import fs from "fs";
import path from "path";

import React from "react";
import ReactDOMServer from "react-dom/server";

import App from "../src/App";

const app = express();

app.use("^/$", (req, res, next)=> {
    // read index.html from build file
    fs.readFile(path.resolve("./build/index.html"), "utf-8", (err, data) => {
        if(err){
            console.log("Error occurs", err);
            return res.status(500).send("Error occurs")
        }
        // Render App to string 
        const reactApp = ReactDOMServer.renderToString(<App />);
        // Paste to HTML 
        const ssrApp = data.replace('<div id="root"></div>', `<div id="root">${reactApp}</div>`);
        // Send as string
        res.send(ssrApp);
    })
});

app.use(express.static(path.resolve(__dirname, '..', 'build')))

app.listen(8000);

// npm i @babel/preset-env @babel/preset-react @babel/register ignore-styles 
