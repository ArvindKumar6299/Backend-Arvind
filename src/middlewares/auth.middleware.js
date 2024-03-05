import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Jwt } from "jsonwebtoken";
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async(req, _, next)=>{
    try {
        const token = req.cookies?.accessToken || req.handler
        ("Authorization"?.replace("Bearer ", ""))
    
        if(!token){
            throw new apiError(401, "Unauthorized request")
        }
    
        const decodedToken = Jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select
        ("-password -refreshToken")
    
        if(!user){
            // discuss about frontend
            throw new apiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token")
    }
})