const express = require('express');
const session = require('express-session');
const path = require('path');
const userDB = require("./model/userDB").userDB;
const Mail = require("./model/mailServer").Mail;
const mailServer = require("./model/mailServer").mailServer;

const app = express()
const port = 3000

app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true}));

app.use((req, res, next) => {
  if(!req.session.account){
    if(req.path == '/login') {
      console.log("applying next for login");
      next(); 
    }else if(req.path == '/'){
      console.log("redirecting to login.html");
      res.redirect('/login.html');
    }else{
      console.log("Illegal access");
      res.status(500).end('Operation not permitted');
    }
  }else {
    next();
  }
})

app.get("/",(req,res) => {
  res.sendFile(path.join(__dirname,'index.html'));
})

app.post("/login", (req, res) => {
  let account = req.body.account;
  let password = req.body.password;
  if(userDB[account] !== undefined && password == userDB[account]){
    req.session.account = account;
    res.redirect('/');
  }else{
    let accountDoesNotExist = 1;
    let passwdIncorrect = 2;
    let errCode = (userDB[account] === undefined ? accountDoesNotExist : passwdIncorrect);
    res.redirect(`/login.html?error=${errCode}`);
  }
});

app.get("/inbox", (req,res) => {
  res.json(mailServer.getInbox(req.session.account))
})

app.get("/addressBook",(req,res) => {
  res.json(mailServer.getAddressBook())
})
app.get("/currentUser",(req,res) => {
  let user = req.session.account
  res.json(user)
})
app.post("/composedMail", (req,res) => {
  let sender = req.body.from
  let receiver = req.body.to 
  let subject = req.body.subject 
  let text = req.body.body 
  let newMail = new Mail(sender,receiver,subject,text)
  mailServer.addMail(newMail)
  res.status(200).end()
})

app.delete("/mail/:mailId", (req,res) => {
  let id = req.params.mailId
  let account = req.session.account
  mailServer.deleteMail(account,id)
  res.json(mailServer.getInbox(req.session.account))
})
app.post("/")
//Begin routing

//creating an HTTP server.
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
