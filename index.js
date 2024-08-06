const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors')
const User = require('./Schema/User');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Score = require('./Schema/ScoreSchema');

const app = express();
app.use(cors({
    origin: 'https://myquizbrainstorm.vercel.app', // Your frontend URL
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())

const jwtSecret = "jnvsnsnfgvjs"

mongoose.connect(process.env.MONGO_URL).then(
    console.log('conneected successfully to db')
).catch((e)=>{
    console.log('failed to connect ot db')
})


app.post('/register',async(req,res)=>{
    const {name,email,password} = req.body
    try{
       const data = await User.create({
          name,email,password
       })
       res.json(data)
    }
    catch(e){
        console.log('failed to register')
        res.json('ok')
    }
    
})

app.post('/login',async(req,res)=>{
     const {email,password} = req.body
     try{
        const userdoc = await User.findOne({email})
        if(userdoc){
            if(password === userdoc.password){
                try{
                jwt.sign({email:userdoc.email,id:userdoc._id},jwtSecret,{},(err,token)=>{
                    if(err)throw err;
                    res.cookie('token',token,{
                        httpOnly:true,
                        secure:true,
                        sameSite: 'None',//without this after deployment cookie was not working properly
                        path: '/',
                        maxAge: 4 * 60 * 60 * 1000
                    }).json(userdoc)
                }) 
                }catch(e){
                console.log('unable to create cookie')
               }    
            }
            else{
                console.log('wrong password')
            }
        }
        else{
            console.log('email not found')
        }
     }
     catch(e){
       console.log('login whatever')
     }
})

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userdata) => {
        if (err) throw err;
        const { name, email, id } = await User.findById(userdata.id);
        res.json({ name, email, id });
      });
    } else {
      res.json(null);
    }
  });
app.post('/postscore',(req,res)=>{
    const { token } = req.cookies;
    const {
        percentage,
        total_que,
        wrong_que,
        correct_que,
        category,
        difficulty,
        type
    } = req.body
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userdata) => {
        if (err) throw err;
        const data = await Score.create({
            owner:userdata.id,
            percentage,
            total_que,
            wrong_que,
            correct_que,
            category,
            difficulty,
            type
        })
        res.json(data)
      });
      
    } else {
      res.json(null);
    }
  })

app.get('/scorecards', async (req, res) => {
    try {
        // Fetch scorecards data from the database
        const scorecards = await Score.find();
        res.json(scorecards);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching scorecards' });
    }
});

app.get('/',(req,res)=>{
    res.json('server in working nicely')
})
        
app.listen(4001,(req,res)=>{
    console.log('server is running')
})
