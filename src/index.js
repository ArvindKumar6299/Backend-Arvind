// require('dotenv').config({path: './env})
import dotenv from "dotenv"
// import mongoose from "mongoose";
// import {DB_NAME} from "./constants";
import  connectDB from "./db/index.js"

dotenv.config({
    path: './env'
})


connectDB()









// import express from "express"
// const app = express()

//  connecting to mongodb database

// //ifif -> imeditly execute
// (async()=>{
//    try{
//       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//       app.on("error", (error) =>{
//         console.log("#ERRR: ",error);
//           //app.on -> to check express is properly working or not after connecting to mongodb database
//           throw error
//       })

//       app.listen(process.env.PORT, () =>{
//         console.log(`App is listening on port ${process.env.PORT}`);
//       })
//    } catch(error){
//         console.log("ERROR", error)
//         throw err
//    }

// })()
