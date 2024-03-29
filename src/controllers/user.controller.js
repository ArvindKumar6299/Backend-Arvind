import  { asyncHandler} from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"



const generateAccessAndRefreshTokens = async(userId) =>{
    try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken}
      
    } catch (error) {
       throw new apiError(500, "Something went wrong while generating refresh and access token")
    }
}

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
    const existedUser = await User.findOne({
        $or: [{username} , {email}]
    })
    if(existedUser){
        throw new apiError(409,"User with email or username already exists !!")
    }
    
    // console.log(req.files);
    
      // check for images, check for avatar

      //-- req.body() -- ke andar sara ka sara data ata hia

      // multer - req.files ka access deta hia
     const avatarLocalPath =  req.files?.avatar[0]?.path;
    //  const coverImageLocalPath = req.files?.converImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
         coverImageLocalPath = req.files.coverImage[0].path
    }

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
      const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
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
        new apiResponse(200 , createdUser[0] ,  "User registered sucessfully")
     )

})

const loginUser = asyncHandler( async(req, res) =>{
     //req body se apna data le aao
     //check for username and email
     //find the user
     // password check
     // access and refresh token
     // send cookie
     // response send
    
      //req body se apna data le aao
      const {email,username , password} = req.body
      
      if(!(username || email)){
        throw new apiError(400, "username or email is required")
      }
      
      const user = await User.findOne({
        $or:[{username},{email}]
      })
      
      if(!user){
        throw new apiError(404, "User does not exist")
      }

      const isPasswordValid = await user.isPasswordCorrect(password)

      if(!isPasswordValid){
        throw new apiError(401, "Password is Invalid")
      }

      const {accessToken , refreshToken} =  await generateAccessAndRefreshTokens(user._id)

      const loggedInUser = User.findById(user._id).select("-password -refreshToken")

        // send cookie
      const options = {
        httpOnly: true,
        secure: true
      }

      return res
      .status(200)
      .cookie("accessToken", accessToken , options)
      .cookie("refreshToken",refreshToken , options)


      .json(
        new apiResponse(
          200,
          {
            user:  loggedInUser, accessToken, refreshToken
          },
          "User logged in Successfully"
        )
      )
        

})

const logoutUser = asyncHandler(async(req, res) =>{
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
   )

    // send cookie
    const options = {
      httpOnly: true,
      secure: true
    }

    return res 
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged Out"))
})

// refresh access token ka end point

const refreshAccessToken = asyncHandler(async (req, res) =>{
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new apiError(401,"uautorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new apiError(401, "Invalid refresh token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new apiError(401," REfresh token  is expired or used")
    }
  
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    return res 
    .status(200)
    .cookie("accessToken", accessToken ,options)
    .cookie("refreshToken", newRefreshToken , options)
    .json(
      new apiResponse(200, {accessToken , newRefreshToken} , 
        "Access token refreshed")
    )
  
  } catch (error) {
     throw new apiError(401, error?.message || "Invalid refresh token") 
  }})

const changeCurrentPassword = asyncHandler(async(req, res) => {

  const {oldPassword, newPassword} = req.body

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new apiError(401, "old password was incorrect!")
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res.
  status(200)
  .json(new apiResponse(200, {} , "Password changed successfully"))

})  

const getCurrentUser = asyncHandler(async(req, res) =>{
  return res
  .status(200)
  .json(200, req.user, "current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req, res) =>{
  const {fullName, email} = req.body

  if(!fullName || !email){
    throw new apiError(400, "All fields are required!")
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
       $set:{
        fullName,
        email: email
       }
    },
    {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(new apiResponse(200, user, "account details updated successfully"))


})

const updateUserAvatar = asyncHandler( async(req, res) =>{
      
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new apiError(400, "Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new apiError(400, "error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      //update
      $set:{
        avatar: avatar.url
      }
    
    },
    {new: true}
  ).select("-password")

  return res 
  .status(200)
  .json(
    new apiResponse(200, user, "avatar updated successfully")
  )
})

const updateUserCoverImage = asyncHandler( async(req, res) =>{
      
  const converImageLocalPath = req.file?.path

  if(!converImageLocalPath){
    throw new apiError(400, "cover file is missing")
  }

  const coverImage = await uploadOnCloudinary(converImageLocalPath)

  if(!coverImage.url){
    throw new apiError(400, "error while uploading on coverImage")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      //update
      $set:{
        coverImage: coverImage.url
      }
    
    },
    {new: true}
  ).select("-password")

  return res 
  .status(200)
  .json(
    new apiResponse(200, user, "cover image updated successfully")
  )
})

const getUserChannelProfile = asyncHandler( async(req, res) =>{
     
  const  {username} = req.params

  if(!username?.trim()) {
    throw new apiError(400, "username is missing")
  }

  const channel = await User.aggregate([
    {
      $match:{
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "sunscribers"
        }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
        }
    },
    {
        $addFields:{
          subscribersCount: {
            $size: "$subscribers"
          },
          channelsSubscribedToCount: {
            $size: "$subscribedTo"
          },
          isSubscribed:{
            $cond:{
              if:{$in: [req.user?._id, "$subscribers.subscriber"]},
              then: true,
              else: false
            }
          }
        }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed:1,
        avatar:1,
        coverImage: 1,
        email:1,

      }
    }
  ])

  if(!channel.length){
    throw new apiError(404, "channel does not exists")
  }

  return res
  .status(200)
  .json(
    new apiResponse(200, channel[0], "user channel fetched successfully")
  )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
      const user = await User.aggregate([
        {
          $match: {
            _id : new mongoose.Types.ObjectId(req.user._id)
          }
        },
        {
          $lookup: {
            from: "videos",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory",
            pipeline:[
              {
                $lookup:{
                  from: "users",
                  localField: "owner",
                  foreignField: "_id",
                  as:"owner",
                  pipeline:[
                    {
                      $project:{
                        fullName: 1,
                        username:1,
                        avatar: 1
                      }
                    }

                  ]
                }
              },
              {
                $addFields: {
                  owner:{
                    $first: "$owner"
                  }
                }
              }
            ]

          }
        }
      ])

      return res
      .status(200)
      .json(
        new apiResponse(
          200, user[0].watchHistory  , "watch history fetched successfully"
        )
      )
})

export {
  registerUser 
  ,loginUser 
  ,logoutUser 
  ,refreshAccessToken
  ,changeCurrentPassword
  ,getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
}