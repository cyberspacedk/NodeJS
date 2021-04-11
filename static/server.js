const fs = require('fs');
const http = require('http');
const path = require('path');
const {Readable} = require('stream');

const STATIC_PATH = path.join(process.cwd(), "./static");

const MIME_TYPES = {
    html: "text/html; charset=UTF-8",
    js: "application/javascript; charset=UTF-8",
    css: "text/css",
    png: "image/png",
    jpeg: "image/jpeg", 
    ico: "image/x-icon",
    svg: "image/svg+xml"
};

const serveFile = name => {
    const filePath = path.join(STATIC_PATH, name);

    // check if we located inside static directory
    if(!filePath.startsWith(STATIC_PATH)){
        console.log(`Cant be served: ${name}`);
        return null;
    }
    // create a readable Stream abd return it
    const stream = fs.createReadStream(filePath);
    console.log(`Served file: ${name}`)
    return stream;
};

const folderIndex = name => {
    const folderPath = path.join(STATIC_PATH, name);
    // check if we located inside static directory
    if(!folderPath.startsWith(STATIC_PATH)){
        console.log(`Cant be served: ${name}`);
        return null;
    }
    const stream = new Readable({
        read(){
            const files = [];
            const folders = [];

            fs.readdir(folderPath, {withFileTypes: true}, (err, items)=> {
                if(err) {
                    console.log(`Cant read folder: ${path}`);
                    return;
                }
                // map items and push it to appropriate arrays
                for (const item of items) {
                    if(item.isDirectory()){
                        folders.push(`/${item.name}/`)
                    }else {
                        files.push(item.name)
                    }
                }

                const list = folders
                    .concat(files)
                    .map(item =>  `<li><a href="${item}">${item}</a></li>`)
                    .join("\n");
                
                stream.push(`<h2>Directory index:</h2><ul>${list}</ul>`);
                stream.push(null);
            });
        }
    })
    console.log(`Index: ${name}`);  
    return stream;
}

const server = http.createServer((req, res)=> {
    // get file extension
    const fileExt = path.extname(req.url).substring(1);
    // get dynamically MIMETYPE
    const mimeType = MIME_TYPES[fileExt] || MIME_TYPES.html;

    res.writeHead(200, {"Content-Type": mimeType});

    const stream = (req.url).endsWith("/") ? folderIndex(req.url) : serveFile(req.url);
    if(stream) {
        stream.pipe(res);
    } 
});

server.listen(9000); 