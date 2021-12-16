import mongodb from 'mongodb';
const mongoClient=mongodb.MongoClient;
import dotenv from "dotenv";
dotenv.config();
const URL=process.env.CONNECTION_URL;



 const admincheck = async (req,res,next)=>{
  
    try {
        // connect the database
         
        let client =await mongoClient.connect(URL);
        let db= client.db("inventory");
        
        let check=await db.collection('users').findOne({_id: mongodb.ObjectId(req.body.userid)});
        
      
    
        let value=check.admin
        if(value){
            
         await client.close();
            next();
        } else {
        await client.close();
     
        res.status(401).json({ message: "You are not allowed to see this data"})
        }
      } catch (error) {
        console.log(error);
        res.status(401).json({
          message: "You are not allowed to see this data"
      })
      }
}

export default admincheck