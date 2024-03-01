import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

//configuring core - using cors as middleware for secrately passing strings something
app.use(cors({
    origin: process.env.CORS_ORIGIN,   //giving acess by setting origin of fronted
    credentials: true
}))

//configuring json -  allowing json type data into backend
app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit:"15kb"}))
app.use(express.static("public"))  //for storing images, pdf etc in my own server 

app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users",userRouter)

export { app }