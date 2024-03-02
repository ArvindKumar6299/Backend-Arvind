import  { asyncHandler} from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"

const registerUser = asyncHandler( async (req, res) =>{
     res.status(500).json({
        message: "ok! hai sab"
    })
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    //upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh teken field from response
    // check for user creation 
    // return response

    const {fullName, email, username, password} = req.body
    console.log("email:",email);
    //validation check
    // if(fullName === ""){
    //     throw new apiError(400, "fullName is required")
    // }
  //for multiple validation check
    if([fullName,email,username, password].some((field)=>
    field?.trim() === "")){
        return new apiError(400, "All fields are required!")
    }
   
    // check if user already exists: username, email
    const existedUser = User.findOne({
        $or: [{username} , {email}]
    })
    if(existedUser){
        throw new apiError(409,"User with email or username already exists !!")
    }
    
      // check for images, check for avatar

      //-- req.body() -- ke andar sara ka sara data ata hia
      // multer - req.files ka access deta hia
     const avatarLocalPath =  req.file?.avatar[0]?.path;
     const coverImageLocalPath = req.file?.converImage[0]?.path;

     if(!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
     }
    
      //upload them to cloudinary
      const avatar = await uploadOnCloudinary(avatarLocalPath)
      const coverImage = await uploadOnCloudinary(coverImageLocalPath)

      // re check avtar is sent to cloudinary or not 
      if(!avatar){
        throw new apiError(400, "Avatar file is required")
      }

      // create user object - create entry in db
      const user = User.create({
        fullName,
        avatar: avatar.url,
        converImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase() 
      }) 
     
       //  remove password and refresh teken field from response
      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      )
      
    // check for user creation 
      if(!createdUser){
        throw new apiError(500,"something went wrong while resistering user")

      }
   
     // return response
     return res.status(201).json(
        new apiResponse(200 , createdUser ,  "User registered sucessfully")
     )

})


export {registerUser,}