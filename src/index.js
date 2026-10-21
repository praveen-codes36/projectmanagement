import dotenv from "dotenv"
import express from "express"

dotenv.config({
    path: "./.env"
});

const app =express()
const port =process.env.PORT || 3000

app.get("/",(req,res)=>{
    res.send("Hello World!");
});

app.listen(port,()=>{
    console.log(`Example app listening on port http://localhost:${port}`);
});

let myusername = process.env.username
let mydata=process.env.database


console.log("Start of backend");
