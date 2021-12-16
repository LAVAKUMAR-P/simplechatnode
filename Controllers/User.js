import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongodb from "mongodb";
import dotenv from "dotenv";
import crypto from 'crypto';
import sendEmail from "../Utils/Email.js";
import {OAuth2Client} from "google-auth-library"

dotenv.config();
const Googleclient = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);



const mongoClient = mongodb.MongoClient;
const URL =process.env.CONNECTION_URL ;


/*Register user*/

export const Registeruser = async (req, res) => {
  req.body.admin = false;
  try {
    //connect db
    let client = await mongoClient.connect(URL);
    //select db
    let db = client.db("chatapp");
    let check = await db.collection("users").findOne({ email: req.body.email });

    if (!check) {
      //Hash password
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(req.body.password, salt);

      req.body.password = hash;
      //post db
      let data = await db.collection("users").insertOne(req.body);
      //close db
      await client.close();
      res.json({
        message: "user registered",
      });
    } else {
      // console.log("mail id already used");
      res.status(409).json({
        message: "Email already Registered",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      message: "Registeration failed",
    });
  }
};

/*Login user*/

export const Login = async (req, res) => {
  // console.log("login");
  try {
    let client = await mongoClient.connect(URL);
    let db = client.db("chatapp");
    // console.log(req.body.email);
    let user = await db.collection("users").findOne({ email: req.body.email });

    if (user) {
      let matchPassword = bcrypt.compareSync(req.body.password, user.password);

      if (matchPassword) {
        let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        // console.log(user.Admin);
        res.json({
          message: true,
          token,
          unconditional: user.admin,
          Name:user.firstName,
        });
      } else {
        res.status(401).json({
          message: "Username/Password is incorrect",
        });
      }
    } else {
      res.status(401).json({
        message: "Username/Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Internal server error",
    });
  }
};

/*Google Register user*/

export const GoogleRegister = async (req, res) => {
  // console.log("login");
  try {
    const { token } = req.body;
  const ticket = await Googleclient.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });
  // console.log("--------------------------------------");
  // console.log(ticket);
  // console.log("---------------------------------------");
  const { given_name,family_name, email, picture,email_verified } = ticket.getPayload();
  if(email_verified){
//connect db
let client = await mongoClient.connect(URL);
//select db
let db = client.db("chatapp");
let check = await db.collection("users").findOne({ email: email });

if (!check) {
  //post db
  let data = await db.collection("users").insertOne({firstName:given_name,lastName:family_name,email,picture,address:"Kindly add your address by using Edit",admin:false});
  //close db
  await client.close();
  res.json({
    message: "user registered",
  });
} else {
  // console.log("mail id already used");
  res.status(409).json({
    message: "Email already Registered",
  });
}
  }
  else{
    res.status(404).json({
      message: "Something went wrong",
    });
  }

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Internal server error",
    });
  }
};


/*Google Login */

export const GoogleLogin=async(req,res)=>{
  try {
    const { token } = req.body;
    const ticket = await Googleclient.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    // console.log("--------------------------------------");
    // console.log(ticket);
    // console.log("---------------------------------------");
    const { email,email_verified } = ticket.getPayload();
    
    if(email_verified){
      let client = await mongoClient.connect(URL);
    let db = client.db("chatapp");
    // console.log(req.body.email);
    let user = await db.collection("users").findOne({ email: email });

    let jwttoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    // console.log(user.Admin);
    res.json({
      message: true,
      token:jwttoken,
      unconditional: user.admin,
      Name:user.firstName,
    });
    }else{
      res.status(404).json({
        message: "Username/Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Internal server error",
    });
  }
}

/*Forget password */

export const Forgetpassword = async (req, res) => {
 
  try {
    let client = await mongoClient.connect(URL);
    let db = client.db("chatapp");
    // console.log(req.body.email);
    let user = await db.collection("users").findOne({ email: req.body.email });
      if (!user)
          return res.status(400).send("user with given email doesn't exist");
         
            let token = await db.collection("token").find({ email: req.body.email }).toArray();
          
      if (token.length===0) {
        // console.log("if runned");
        let index=await db.collection("token").createIndex( { "createdAt": 1 }, { expireAfterSeconds: 300 } )
        let token = await db.collection("token").insertOne({
        "createdAt": new Date(),
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
        email: req.body.email
        });
        token = await db.collection("token").find({ email: req.body.email }).toArray();
        // console.log(token);
        const link = `${process.env.BASE_URL}/resetpassword/${user._id}/${token[0].token}`;
        await sendEmail(user.email, "Password reset",`your rest password link : ${link}` );
      //  console.log(link);
       await client.close();
      res.status(200).send("password reset link sent to your email account"); 
      }
     else{
      res.status(404).json({
        message: "Internal server error",
      });
      await client.close();
     }

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Internal server error",
    });
    await client.close();
  }
};

/*Reset password */
export const Resetpassword = async (req, res) => {
 
  try {
    let client = await mongoClient.connect(URL);
    let db = client.db("chatapp");
    // console.log(req.body.email);
    let user = await db.collection("users").findOne({_id:mongodb.ObjectId(req.params.userId)});
      if (!user)
          return res.status(400).send("invalid link or expired");
         
            let token = await db.collection("token").find({   userId: user._id,
              token: req.params.token,
            }).toArray();
            // console.log(token);
          
      if (token.length===1) {

        let salt = bcrypt.genSaltSync(10);
       let hash = bcrypt.hashSync(req.body.password, salt);
       req.body.password = hash;
       let data = await db.collection("users").findOneAndUpdate({_id:mongodb.ObjectId(req.params.userId)},{$set:{password:req.body.password}})
        let Delete=await db.collection("token").findOneAndDelete({   userId: user._id,
          token: req.params.token,
        })

        await client.close();
        return res.status(200).send("Reset sucessfull");
      }
     else if(token.length===0){
      await client.close();
      return res.status(406).send("Invalid link or expired");
     }
     else{
      res.status(404).json({
        message: "Internal server error",
      });
      await client.close();
     }

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Internal server error",
    });
    await client.close();
  }
};
