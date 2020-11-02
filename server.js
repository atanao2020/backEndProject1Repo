const express               =  require('express'),
      app                   =  express(),
      port                  = 2050,
      mongoose              =  require("mongoose"),
      multer                = require('multer'),
      upload                = multer(),
      cors                  = require('cors'),
      passport              =  require("passport"),
      bodyParser            =  require("body-parser"),
      LocalStrategy         =  require("passport-local"),
      passportLocalMongoose =  require("passport-local-mongoose"),
      User                 =  require("./models/User")

//================================================== MongooseDB Connection
mongoose.connect('mongodb+srv://atanao:dontinon@cluster0.enweg.mongodb.net/viewersDB?retryWrites=true&w=majority', 
{useNewUrlParser:true,useUnifiedTopology:true},
    function(err,database){
        if(err){
           throw err
        }
        console.log("connection made to database")
   }
)

//===================================================
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(upload.array())
app.use(express.json())


//=====================================================
app.use(require("express-session")({
    secret:"Any normal Word",       //decode or encode session
    resave: false,          
    saveUninitialized:false    
}));

passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended:true, useUnifiedTopology:true }))
app.use(passport.initialize());
app.use(passport.session());


//======================= Routes
app.get("/", (req,res) =>{
    res.render("homePage");
})
var userCount = 0;
app.get("/userProfile",isLoggedIn ,(req,res) =>{
    userCount++;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<center>
               <body style="background-color:aqua">
               <h1>Hello!\n </h1>
               <h2>The user have had ${userCount} visits!\n</h2><br><br>
               <div>
                    <a href="/">Home</a><span> || </span>
                    <a href="/logout">Logout</a>
               </div>
               </body>
               </center>
              `);
    res.end();
    //res.render("userProfile");
})
//Auth Routes
app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login",passport.authenticate("local",{
    successRedirect:"/userProfile",
    failureRedirect:"/login"
}),function (req, res){

});

app.get("/signIn",(req,res)=>{
    res.render("signIn");
});

app.post("/signIn",(req,res)=>{
    
    User.register(new User({username: req.body.username,fullName:req.body.fullName}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.render("signIn");
        }
    passport.authenticate("local")(req,res,function(){
        res.redirect("/login");
    })    
    })
})

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(port, () => {   
    console.log(`Example app listening at http://localhost:${port}`) 
})