import jwt from 'jsonwebtoken';

const authenticate=async(req,res,next)=>{
try {
    // console.log(req.headers.authorization);
    if(req.headers.authorization){
        jwt.verify(req.headers.authorization,process.env.JWT_SECRET,function(error,decoded){
            if(error){
            //    console.log(error);
                res.status(401).json({
                    message: "Unauthorized"
                })
            }else{
                
                req.body.userid = decoded.id;
                // console.log(req.body)
            next()
            }
            
        });
      
    }else{
        res.status(401).json({
            message: "No Token Present auth"
        })
    }
} catch (error) {
    res.status(401).json({
        message: "No Token Present auth"
    })
}
}

export default authenticate;