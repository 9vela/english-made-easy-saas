const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const users = new Map();
const sessions = new Map();

const lessons = [
  {id:1,title:"Alphabet A–Z",level:"Beginner",free:true,content:"Learn the 26 letters of the English alphabet. Practice saying and writing each letter."},
  {id:2,title:"Colors & Basic Vocabulary",level:"Beginner",free:true,content:"Red, blue, yellow, green, orange, purple, pink, black, white, brown and gray."},
  {id:3,title:"Greetings & Introductions",level:"Beginner",free:false,content:"Hello! Hi! Good morning! My name is... Nice to meet you."},
  {id:4,title:"The Verb To Be",level:"Beginner",free:false,content:"I am, you are, he is, she is, it is, we are, they are."},
  {id:5,title:"Personal Information",level:"Beginner",free:false,content:"Practice name, age, country, city and simple personal questions."},
  {id:6,title:"Numbers, Days & Time",level:"Beginner",free:false,content:"Numbers, days of the week and basic expressions for telling time."},
  {id:7,title:"Family & People",level:"Beginner",free:false,content:"Learn family words and simple sentences about people."},
  {id:8,title:"Everyday Vocabulary",level:"Beginner",free:false,content:"Useful words and expressions for everyday situations."}
];

function token(){return crypto.randomBytes(24).toString("hex")}
function auth(req,res,next){
  const t=req.headers.authorization?.replace("Bearer ","");
  const email=sessions.get(t);
  if(!email) return res.status(401).json({error:"Not logged in"});
  req.user=users.get(email); next();
}

app.get("/api/lessons",(req,res)=>res.json(lessons.map(({id,title,level,free})=>({id,title,level,free}))));
app.post("/api/register",(req,res)=>{
  const {name,email,password}=req.body;
  if(!name||!email||!password) return res.status(400).json({error:"Fill in all fields"});
  const key=email.toLowerCase().trim();
  if(users.has(key)) return res.status(409).json({error:"Account already exists"});
  users.set(key,{name,email:key,password,plan:"free",progress:[]});
  const t=token(); sessions.set(t,key);
  res.json({token:t,user:{name,email:key,plan:"free",progress:[]}});
});
app.post("/api/login",(req,res)=>{
  const {email,password}=req.body; const u=users.get((email||"").toLowerCase().trim());
  if(!u||u.password!==password) return res.status(401).json({error:"Invalid email or password"});
  const t=token(); sessions.set(t,u.email);
  res.json({token:t,user:{name:u.name,email:u.email,plan:u.plan,progress:u.progress}});
});
app.get("/api/me",auth,(req,res)=>res.json({name:req.user.name,email:req.user.email,plan:req.user.plan,progress:req.user.progress}));
app.get("/api/lesson/:id",auth,(req,res)=>{
  const lesson=lessons.find(x=>x.id===Number(req.params.id));
  if(!lesson) return res.status(404).json({error:"Lesson not found"});
  if(!lesson.free && req.user.plan!=="premium") return res.status(402).json({error:"Premium lesson. Upgrade your plan."});
  res.json(lesson);
});
app.post("/api/progress/:id",auth,(req,res)=>{
  const id=Number(req.params.id);
  if(!lessons.some(x=>x.id===id)) return res.status(404).json({error:"Lesson not found"});
  if(!req.user.progress.includes(id)) req.user.progress.push(id);
  res.json({progress:req.user.progress});
});
app.post("/api/upgrade",auth,(req,res)=>{
  // Demo checkout: records the selected Premium plan without charging money.
  const allowed={weekly:7,monthly:30,annual:365};
  const plan=req.body?.plan||"monthly";
  if(!allowed[plan]) return res.status(400).json({error:"Invalid Premium plan"});
  req.user.plan="premium";
  req.user.premiumPlan=plan;
  req.user.premiumUntil=Date.now()+allowed[plan]*24*60*60*1000;
  res.json({plan:"premium",premiumPlan:plan,premiumUntil:req.user.premiumUntil});
});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`English Made Easy running on http://localhost:${PORT}`));
