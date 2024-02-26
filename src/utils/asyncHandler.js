 const asyncHandler = (requestHandler) =>{ 
    (req,res,next)=>{
        Promis.resolve(requestHandler(req,res,next))
        .catch((err) => next(err))
    }
  }


export {asyncHandler}



// const asyncHandler = (fn) => async (req,res,next)=>{
//     try {
//         await fn(res,res, next)
//     } catch (error) {
//         res.status(err.code || 5000).json({
//             success: false,
//             message: err.message
//         })
//     }
// }