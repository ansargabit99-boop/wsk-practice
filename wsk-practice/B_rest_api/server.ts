import express, { json } from "express"
import { Request,Response,NextFunction } from "express"
import pool from "./database.ts"
import bcrypt  from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { Query } from "pg"
dotenv.config()
const app = express()
app.use(express.json())



const port = 3000

function generateToken(id:number,role:string) {
    return jwt.sign({id,role},process.env.JWT_SECRET!,{
        expiresIn:"30d"
    })
}
async function middleware(req:any,res:Response,next:NextFunction) {
    try {
        const auth = req.headers.authorization
        if(!auth) {
            return res.status(403).json({message:"unauthorised"})
        }
        const token = auth.split(" ")[1]
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET!)
        req.user = decoded
        next()
    } catch(err) {
        console.log(err)
        return res.status(403).json({message:"acces denied"})
    }
}
async function isAdmin(req:any,res:Response,next:NextFunction) {
    try {
        const {id,role} = req.user
        if(role ==="admin") {
            next()
        }else {
            return res.status(403).json({message:"unauthorised"})
        }
    } catch (err) {
        console.log(err)
        return res.status(403).json({message:"unauthorised"})
    }
}
app.post("/api/register",async(req,res)=>{
    try {
        const {email,password,name} = req.body
        if (!email || !password || name) {
            return res.status(400).json({message:"you forgot something"})
        }
        const ifExists = await pool.query("SELECT id,name,email,role FROM users WHERE email = $1",[email])
        if (ifExists.rows.length === 0) {
            return res.status(400).json({message:"the user with this email already exists"})

        }
        const hashed = await bcrypt.hash(password,10)
        const result = await pool.query("INSERT INTO users (gmail,password,name) VALUES($1,$2,$3) RETURNING id,email,name,role",[email,hashed,name])
        const token = generateToken(result.rows[0].id,result.rows[0].role)
        res.status(200).json({token,user:result.rows[0]})
        
    }catch (err) {
        console.log(err)
        res.status(500).json({message:"something went wrong"})
    }
})
app.post("/api/login",async(req,res)=>{
    try {
        const {email,password} = req.body
        if (!email || !password) {
            return res.status(400).json({message:"something went wrong"})
        }
        const user = await pool.query("SELECT * FROM users WHERE email=$1",[email])
        if (user.rows.length === 0) {
            return res.status(404).json({message:"the user with this email doesnt'exist"})
        }
        const isValid = await bcrypt.compare(password,user.rows[0].password)
        if(!isValid) {
            return res.json({message:"incorrect credentials"})
        }
        const token = generateToken(user.rows[0].id,user.rows[0].role)
        res.status(200).json({token,user:user.rows[0]})
    } catch(err) {
        console.log(err)
        return res.status(500).json({message:"something went wrong"})
    }
})
app.get("/api/books",middleware,async(req,res)=>{
    try {
        const {search,page} = req.query
        let pageNum = Math.max(1,
            typeof(page) === "string" ? parseInt(page,10) : 1)
        const limit = 10
        const offset = (pageNum - 1) * limit
        let query = "SELECT * FROM books"
        const values = []
        let i = 1

        if(search) {
            query += ` WHERE (title ILIKE($${i++} OR author ILIKE($${i++}))`
            values.push(`%${search}%`)
        }
        
        query += ` ORDER by id LIMIT $${i++} OFFSET $${i++}`
        values.push(limit,offset)

        const result = await pool.query(query,values)
        return res.status(200).json({
            pageNum,
            limit,
            books:result.rows
        })
    }catch(err) {
        console.log(err)
        return res.status(500).json({message:"something went wrong"})
    }
})
app.get("/api/books/:id",middleware,async(req,res)=>{
    try {
        const {id} = req.params
        const exist = await pool.query("SELECT * FROM books WHERE id=$1",[id])
        if (exist.rows.length === 0) {
            return res.status(404).json({message:"couldn find the book"})
        }
        res.status(200).json({book:exist.rows[0]})

    } catch(err) {
        console.log(err)
        return res.status(500).json({message:"something went wrong"})
    }
})

app.post("/api/books",middleware,isAdmin,async(req,res)=>{
    try {
        const {title,author,isbn} = req.body
        if (!title || !author || !isbn) {
             return res.status(400).json({message:"you missed something"})
        }
        const newBook = await pool.query("INSERT INTO books (title,author,isbn) VALUES($1,$2,$3) RETURNING *",[title,author,isbn])
        res.status(201).json({message:"new book succesfully posted"})
    } catch (err) {
        console.log(err)
        return res.json({message:"something went wrong"})
    }
})
app.put("/api/books/:id",middleware,isAdmin,async(req,res)=>{
    try {
        const {title,author,isbn} = req.body
        const id = req.params.id
        const isExist = await pool.query("SELECT * FROM books WHERE id = $1",[id])
        if (isExist.rows.length === 0) {
            return res.status(404).json({message:"the book you are willing to put is not found"})
        }
        let query = "UPDATE books SET "
        const changes = []
        const values = []
        let i = 1
        if(title) {
            changes.push(` title = $${i++}`)
            values.push(title)
        }
        if (author) {
            changes.push(`author = $${i++}`)
            values.push(author)
        }
        if (isbn) {
            changes.push(`isbn = $${i++}`)
            values.push(isbn)
        }
        if (values.length === 0) {
            return res.status(201).json({message:"nothing to change"})
        }
        const joins = changes.join(",")
        query += joins
        query+=` WHERE id=$${i++}`
        values.push(id)
        await pool.query(query,values)
        
        res.status(201).json({message:"succesfully updated book info"})
    }catch(err) {
        console.log(err)
        return res.status(500).json({message:"something went wrong"})
    }
})
app.delete("/api/books/:id",middleware,isAdmin,async(req,res)=>{
    try {
        const id = req.params.id
        const isExist = await pool.query("SELECT * FROM books WHERE id=$1",[id])
        if (isExist.rows.length === 0) {
            return res.status(404).json({message:"not found"})
        }
        await pool.query("DELETE FROM books WHERE id=$1",[id])
        return res.status(200).json({message:"succesfully deleted"})

    } catch (err) {
        console.log(err) 
        return res.status(500).json({message:"something went wrong"})
    }
})
app.post("/api/loans",middleware,async(req:any,res)=>{
    const client = await pool.connect()
    try {
        const {book_id} = req.body
        const user_id = req.user.id

        const bookId = Number(book_id)

        if (!Number(bookId) || bookId <= 0) {
            return res.status(400).json({message:"book id should be positive integer"})
        }
        
        
        await client.query("BEGIN")

        await client.query("SELECT id FROM users WHERE id=$1 FOR UPDATE",[user_id])

        //locking user
        const activeLoans = await client.query("SELECT COUNT(*) FROM loans WHERE user_id=$1 AND returned_at IS NULL")

        if(Number(activeLoans.rows[0].count >=3)) {
            await client.query("ROLLBACK")

            return res.status(409).json({message:"maximum active loans reached"})
        }

        //books

        const bookResult = await client.query("SELECT id,copies FROM books WHERE id=$1 FOR UPDATE",[bookId])

        if (bookResult.rows.length === 0) {
            await client.query("ROLLBACK")

            return res.status(500).json({message:"the book not found"})
        }

        const book = bookResult.rows[0]

        const borrowedCopies = await client.query(`
            SELECT COUNT(*) FROM loans WHERE book_id=$1 AND returned_at IS NULL
            `,[bookId])

        const availableCopies = book.copies - Number(borrowedCopies.rows[0].count)

        if (availableCopies <= 0) {
            await client.query("ROLLBACK")
            
             return res.status(409).json({message:"No copies available"})
        }
        const loanResult = await client.query("INSERT INTO loans (user_id,book_id, loan_date,due_date) VALUES($1,$2,CURRENT_DATE,CURRENT_DATE + 14 days)")

        await client.query("COMMIT")

        return res.status(201).json({message:"book borrowed succesfully",result:loanResult.rows[0]})
    } catch(err) {
        await client.query("ROLLBACK")
        console.log(err)
        return res.status(500).json({message:"somethign went wrong"})
    } finally {
        client.release()
    }
})
app.get("/api/loans",middleware,async(req:any,res)=>{
    try {
        const user_id = req.user
        const myLoans = await pool.query("SELECT * FROM loans WHERE user_id=$1",[user_id])

        return res.status(200).json({data:myLoans.rows})
        
    } catch (err) {
        console.log(err) 
        return res.status(500).json({message:"something went wrong"})
    }
})
app.post("/api/loans/:id/return",middleware,async(req:any,res)=>{
    const client = await pool.connect()
    try {
        const loanId = req.params.id
        const user_id = req.user.id

        
        await client.query("BEGIN")

        const loan = await client.query("SELECT * FROM loans WHERE id=$1 FOR UPDATE",[loanId,user_id])

        //check whether loans exist
        if(loan.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(404).json({message:"the loan doesnt exist"})
        }

        // check whether the loan is owned by me
        if(loan.rows[0].user_id !== user_id) {
            await client.query("ROLLBACK")
            return res.status(403).json({message:"you dont own this loan"})
        }

        // check whether loan is returned
        if(loan.rows[0].returned_at !== null) {
            await client.query("ROLLBACK")
            return res.status(404).json({message:"the loan is already returned"})
        }
        // Final Result
        const result = await client.query(`
            UPDATE loans SET returned_at = CURRENT_TIMESTAMP WHERE id=1 RETURNING *
            `,[loanId])
        await client.query("COMMIT")

        return res.status(200).json({message:"Book returned succesfully",result:result.rows[0]})

    } catch (err) {
        await client.query("ROLLBACK")
        console.log(err)
        return res.status(500).json({message:"something went wrong"})
    } finally {
        client.release()
    }
})
app.listen(port,()=>{
    console.log("starting server")
})