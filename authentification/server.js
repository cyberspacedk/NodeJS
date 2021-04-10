const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const mongoUri = require('./dbCred');
const User = require('./models/user/UserModel');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

// Connect to DB
mongoose
    .connect(mongoUri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(()=> console.log("Connected to DB"))
    .catch((err) => console.log("Connection failed. Reason", err))

// Middleware for session creation
app.use(session({
    secret: "UUI-OOI",
    resave: false,
    saveUninitialized: true
}));

const authorize = (req, res, next) => {
    if(!req.session.user){
        next(new Error("Not logged in"))
    }else next()
}

// Middleware that count visits on specific routes
app.use((req, res, next)=> {
    if(!req.session.visits){
        req.session.visits = {
            "/": 0,
            "/private": 0
        }
    };
    next()
});

// Middleware that stores user ip  
app.use((req, res, next)=> {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    req.session.ip = ip;
    next();
}); 
 
app.get("/", (req, res)=> {
    ++req.session.visits['/'];

    // Redirect if user already logged in 
    if(req.session.user) return res.redirect("/private");

    const authFom = fs.readFileSync(path.resolve(__dirname, "templates", "form.html"))
    res.set('Content-Type', "text/html");
    res.send(authFom);
});


app.post("/login", async (req, res, next)=> {
    try{
        const {username, password} = req.body; 

        if(!username || !password){
            return next(new Error("Must provide username and password!"));
        }

        const savedUser = await User.findOne({username}); 

        if(!savedUser) return next("Username or password incorrect");

        const isPasswordCorrect = await bcrypt.compare(password, savedUser.password);

        if(isPasswordCorrect){
            req.session.user = {username: savedUser.username};
            res.redirect("/private");
        }else {
            next(new Error("Username or password incorrect"))
        }
    }catch (err){
        next(err)
    }
});

app.get("/logout", (req, res)=> {
    req.session.destroy();
    res.redirect("/")
});

app.post("/signup", async (req, res, next)=> {
    try{
        const {username, password} = req.body; 

        if(!username || !password) return next(new Error("Must provide username and password!")) 

        const userInDb = await User.findOne({username});
        
        if(userInDb && (userInDb.username === username)) return next(new Error("User already exist. Try another name"));
        
        const hash = await bcrypt.hash(password, 10);
        const newUser = await new User({username, password: hash})
        const savedUser = await newUser.save(); 

        if(!savedUser) next("Error while saving");

        req.session.user = {username: savedUser.username};
        res.redirect("/private");
    }catch (err){
        next(err);
    }
});

app.get("/private", authorize, (req, res)=> {
    // increment count of visitors on route "/private"
   ++req.session.visits['/private'];
    res.send(`
        Hi ${req.session.user.username}
        <br />
        <a href="/logout">Logout</a>
    `);
});

app.listen(3000);
