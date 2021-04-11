const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 3001;

app.use(bodyParser.json())


app.post("/login", (req, res)=> {
     const user = req.body.username;

     res.status(200).send(`You logged in with ${user}`)
})
app.get("/", (req, res)=> {
    res.json({message: PORT})
});

app.listen(PORT);