# backend series

backend using javascript

  - [Model Link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)



  
=======

## MY backend Notes ->


# What Is Express JS?
Express is a node js web application framework that provides broad features for building web and mobile applications.
It is used to build a single page, multipage, and hybrid web application. 
It's a layer built on the top of the Node js that helps manage servers and routes.

# Mongoose 
- ` to interact with our MongoDB database
   and Mongoose is used in Node application to interact with MongoDB without write complex queries. It acts as an Object Data Modeling (ODM) used to define schema model and provides easy communication between application and database. It provides many features like schema validation, middleware support, and easy query building It manages relationships between data, and is used to translate between objects in code and the representation of those objects in MongoDB.`
  


  # SchemaTypes
While Mongoose schemas define the overall structure or shape of a document, SchemaTypes define the expected data type for individual fields (String, Number, Boolean, and so on).

-> //app.on -> to check express is properly working or not after connecting to mongodb database

// `${used for variable inject}`

# cookie-parser ,  cors : are middle wares - for passing string type data

//configuring core - using cors as middleware for passing strings something 
` app.use(cors({
    origin: process.env.CORS_ORIGIN,   //giving acess by setting origin of fronted
    credentials: true
})) ` 

 ` configuring json  -  allowing json type data into backend
   app.use(express.json({limit: "16kb"})) `

 for taking data from url ->

 + --Schema - is mtd which takes input as objects


 ->  //this. - is used for access id ,email,etc from mogoodb data base where already saved
  +   email: this.email, here - email is key_name and this.email -> is used for taking email which are aready saved in database

#multer
-Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum efficiency.  

# HTTP - hyper text transfer protocol
-> HTTP headers are - metadata -- keyvalue sent along with request and response
- caching, authentication , manage state
+ Resquest Headers -> for client
+ Response Headers -> for server
+ Representation Headeres -> enconding/compression
+ Payload Headers -> data

>> HTTP methods - basic set of operations that can be used to interact with server
+ GET: retrive a resource
+ HEAD: No message body (response headers only)
+ OPTIONS : what operations ate avilable
+ TRACE: loopback test (get same data)
+ DELETE: remove a resource
+ PUT : replace a resource
+  POST : interact with resource (mostly add)
+ PATCH : change part of a resource

#  Register User - steps:

  import  { asyncHandler} from "../utils/asyncHandler.js"
  import { apiError } from "../utils/apiError.js"
  

  1.-> get user details from frontend
  example  -  const {fullName, email, username, password} = req.body
  2. -> validation check - not empty
  ex-> ` if(fullName === ""){
        throw new apiError(400, "fullName is required")
    } `
    //for multiple validation check

  `  if([fullName,email,username, password].some((field)=>
    field?.trim() === "")){
        return new apiError(400, "All fields are required!")
    }`
     ->trim() just removes any whitespace at the beginning and end of a string

    2. -> check if user already exists: username, email

    import {User} from "../models/user.model.js"
    `
    const existedUser = User.findOne({
        $or: [{username} , {email}]
    })
    if(existedUser){
        throw new apiError(409,"User with email or username already exists !!")
    }
    `
    3. -> check for images, check for avatar
    `
     
    `
    //upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh teken field from response
    // check for user creation 
    // return response

    >> [](user.controller.js)  --> check for full explanation steps above