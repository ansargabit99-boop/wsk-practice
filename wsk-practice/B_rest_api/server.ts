import express from 'express'
import cors from "cors"
import { Request,Response,NextFunction } from 'express'
import pool from './database'
import jwt from "jsonwebtoken"
import bcrypt from 'bcryptjs'
const app = express()
app.use(express.json())
app.use(cors())


function generateToken(id:number) {
    return jwt.sign({id},process.env.JWT_SECRET!,{
        expiresIn:"30d"
    })
}
function middleware(req:any,res:Response,next:NextFunction) {
    const auth = req.headers.authorization
    if (!auth) {
        return res.status(401).json({message:"unauthorised"})
    }
    const token = auth.split(" ")[1]
    if(!token) {
        return res.status(401).json({message:"unauthorised"})
    }
   
    const decoded = jwt.verify(token,process.env.JWT_SECRET!)
    req.user = decoded
    next()
}
app.post("/users/login",async(req,res)=>{
    try {
        
        const {gmail,password} =req.body
        if (!gmail || password) {
            res.status(400).json({message:"please fill in all required fields"})
            return
        }
        const user = await pool.query("SELECT * FROM users WHERE email=$1",gmail)
        if (user.rows.length === 0) {
            return res.status(404).json({message:"not found"})
        }
        const userPassword = user.rows[0].password
        const isValid = await bcrypt.compare(password,userPassword)
        if (!isValid) {
            return res.status(400).json({message:"incorrect credentials"})
        }
        const token = generateToken(user.rows[0].id)
        return res.status(200).json({name:user.rows[0].name,token})
    } catch (err) {
        console.log(err)
        return res.status(500).json({message:"something went wrong"})
    }
})

app.post("/users/register",async(req,res)=>{
    try {
        const {name,gmail,password} = req.body
        if(!name || !gmail || !password) {
            return res.status(400).json({message:"please fill in the form"})
        }
        const isExist = await pool.query("SELECT * FROM users WHERE gmail=$1",gmail)
        if (isExist.rows.length > 0) {
            return res.status(400).json({message:"the user with this mail already exists"})
        }
        const hashed  = await bcrypt.hash(password,10)
        const newUser = await pool.query("INSERT INTO users (name,gmail,password) VALUES($1,$2,$3)  RETURNING id",[name,gmail,password])
    
        const token = generateToken(newUser.rows[0].id)
        return res.json({id:newUser.rows[0].id,token})
    } catch (err) {
        console.log(err)
        return res.status(500).json({message:"something went wrong"})
    }
})

app.get("/books",async(req,res)=>{
    const {author,title,minCopies} = req.body
    
    let query = "SELECT * FROM books"
    const conditions = []
    const values = []
})
app.post("/books",async(req,res)=>{
    const {title,author,isbn} = req.body
    if (!title || !author ||!isbn) {
        return res.status(400).json({message:"bad request"})
    }
    const newBook = await pool.query("INSERT INTO books (title,author,isbn) VALUES($1,$2,$3) RETURNING *",[title,author,isbn])
    res.status(201).json({data:newBook.rows[0]})
})
const PORT = 3000

app.listen(PORT,()=>{
    console.log("starting server")
})