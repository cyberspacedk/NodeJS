const fs = require('fs');
const http = require('http');
const path = require('path');
const {Readable} = require('stream');

const STATIC_PATH = path.join(process.cwd(), "./static");
// after length begins file name 
// EX: static/style.css
// STATIC_PATH = static = 6 
const STATIC_PATH_LENGTH = STATIC_PATH.length;

const MIME_TYPES = {
    html: "text/html; charset=UTF-8",
    js: "application/javascript; charset=UTF-8",
    css: "text/css",
    png: "image/png",
    jpeg: "image/jpeg", 
    ico: "image/x-icon",
    svg: "image/svg+xml"
};

const cache = new Map();

const cacheFile = filePath => {
    fs.readFile(filePath, "utf8", (err, data) => {
        const key = filePath.substring(STATIC_PATH_LENGTH);
        // store file on cache
        cache.set(key, data);
    });
};

const cacheDirectory = directoryPath => {
    fs.readdir(directoryPath, {withFileTypes: true}, (err, items)=>{
        for(const item of items){
                const itemPath = path.join(directoryPath, item.name);
                if(item.isDirectory()) cacheDirectory(itemPath);
                else cacheFile(itemPath)
            }
    });
    
};

cacheDirectory(STATIC_PATH);

const server = http.createServer((req, res)=> {
    // get file extension
    const fileExt = path.extname(req.url).substring(1);
    // get dynamically MIMETYPE
    const mimeType = MIME_TYPES[fileExt] || MIME_TYPES.html;

    res.writeHead(200, {"Content-Type": mimeType});

    const data = cache.get(req.url);
    res.end(data);
});

server.listen(9000); 