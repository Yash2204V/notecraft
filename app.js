const express = require('express');
const app = express();
const path = require('path');

const userModel = require('./models/user');
const postModel = require('./models/post');
const upload = require('./config/multerconfig');

const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

app.set('view engine', "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.render('index');   
})

app.get('/profile/upload', (req,res)=>{
    res.render("profileupload");
})

app.post('/upload', IsLoggedIn, upload.single('image'), async (req,res)=>{
    const user = await userModel.findOne({email: req.user.email});
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
})


app.post('/signup',(req,res)=>{
    const { username, name, email, age, password } = req.body;

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt,async function(err, hash) {
            const user = await userModel.create({
                username,
                name,
                email,
                age,
                password: hash
            })
            const token = jwt.sign({email: user.email, userid:user._id}, "shhhh");
            res.cookie("token",token);
            res.redirect("/login");
        });
    });
})

app.get('/profile', IsLoggedIn, async (req,res)=>{
    let user = await userModel.findOne({email: req.user.email}).populate("posts"); 
    // Initially, posts are set of IDs and through populating them ~ we extract the data of them through IDs.
    res.render('profile',{user: user});
})

app.get('/like/:id', IsLoggedIn, async (req,res)=>{
    let post = await postModel.findOne({_id: req.params.id}).populate("user"); 

    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    await post.save();
    res.redirect('/profile');
})

app.get('/edit/:id', IsLoggedIn, async (req,res)=>{
    let post = await postModel.findOne({_id: req.params.id}).populate("user");
    res.render("edit",{post});
})

app.post('/update/:id', IsLoggedIn, async(req,res)=>{
    let post = await postModel.findOneAndUpdate({_id: req.params.id}, {content: req.body.content});
    res.redirect('/profile');
})

app.post('/post', IsLoggedIn, async (req,res)=>{
    let user = await userModel.findOne({email: req.user.email})
    let post = await postModel.create({
        user: user._id,
        content: req.body.content,
    })
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.post('/login',async (req,res)=>{
    const { email, password } = req.body;
    
    let user = await userModel.findOne({email});

    if(!user) return res.status(500).send("something went wrong"); 
    bcrypt.compare(password, user.password, function(err, result) {
        if(result){
            const token = jwt.sign({email: user.email, userid:user._id}, "shhhh");
            res.cookie("token",token);
            res.status(400).redirect("/profile");
        } 
        else{
            res.redirect('/');
        }
    });
})

app.get('/logout',(req,res)=>{
    res.cookie("token","");
    res.redirect('/login');
})

function IsLoggedIn(req,res,next){
    const token = req.cookies.token;
    if(token){
        let data = jwt.verify(token, "shhhh");
        req.user = data;
        next();
    }
    else{ 
        // token is empty..
        res.redirect('/login');
    }
}

app.listen(3000,()=>{
    console.log("Server running on http://localhost:3000");
})