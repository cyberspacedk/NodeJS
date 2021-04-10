const csrf = require('csurf');
const express = require('express'); 
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(cookieParser());

const csrfProtection = csrf({cookie: true});

app.get("/transaction", csrfProtection, (req, res)=> {
    const form = `
        <script>
            const token = "${req.csrfToken()}"
            console.log("TOKEN", token);

            function sendData(){
                const data = {
                    amount: document.getElementsByName("amount")[0].value,
                    to: document.getElementsByName("to")[0].value,
                    from: document.getElementsByName("from")[0].value
                };
            
                console.log("Data", data);

                fetch("/process-transaction", {
                    method: 'POST',
                    headers: new Headers({
                        "Content-Type": "application/json",
                        "CSRF-Token": token
                    }),
                    body: JSON.stringify(data),
                    credentials: 'include', 
                })
                .then(response => response.json())
                .then(data => console.log("Success", data))
                .catch(err => console.log("Failure", err))

            } 
        </script>

        <form action="/process-transaction" method="POST">
            Amount: <input type="text" name="amount" value="100" />
            To: <input type="text" name="to" value="cat" />
            From: <input type="text" name="from" value="Doge" />
            <button type="button" onClick="sendData()">Send money</button>
        </form>
    `;
    res.set("Content-Type", "text/html");
    res.send(form);
});

app.post("/process-transaction", csrfProtection, (req, res)=> {
    res.send({msg: "data is being processed"})
})

app.post("/no-csrf-process-transaction", (req, res)=> {
    res.send({msg: "data is being processed"})
});

app.listen(3001);


const noCSRFUrl = 'http://localhost:3001/no-csrf-process-transaction';
const CSRFUrl = 'http://localhost:3001/no-csrf-process-transaction';

function evilCodeNoCSRF(){ 
        const data = {
            amount: 1000,
            to: "evil",
            from: "victim"
        };
    
        console.log("Data", data);

        fetch("http://localhost:3001/process-transaction", {
            method: 'POST',
            headers: new Headers({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(data),
            credentials: 'include', 
        })
        .then(response => response.json())
        .then(data => console.log("Success", data))
        .catch(err => console.log("Failure", err))
}