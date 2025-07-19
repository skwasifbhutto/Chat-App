import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../model/user.model.js"
import bcrypt from "bcryptjs"


export const signup= async(req, res)=>{
  const {fullName, email, password}=req.body;
  try{
    if(!fullName || !email || !password){
        return res.status(400).json({message: "Please fill in all fields."})
    }
    if(password.length <6){
        return res.status(400).json({message:"Password must be at least 6 characters"});
    }
    const user=await User.findOne({email})
    if(user) return res.status(400).json({message:"Email already exists"})
    
    const salt=await bcrypt.genSalt(10)
    const hashedPassword= await bcrypt.hash(password, salt)

    const newUser=new User({
        fullName: fullName,
        email: email,
        password:hashedPassword
    })

    if(newUser){
        generateToken(newUser._id,res)
        await newUser.save();
        res.status(201).json({
            _id:newUser._id,
            fullName:newUser.fullName,
            email:newUser.email,
            profilePic:newUser.profilePic,
        
        })

    }else{
        res.status(400).json({message:"Invalid user data"})
    }

  }catch(error){
    console.log("error in signup controller",error.message);
    res.status(500).json({message:"Internal server Error"});
  }
}

export const login=async (req, res)=>{
    const {email,password}= req.body
    try{
        const user = await User.findOne({email})
        if (!user){
            return res.status(400).json({message: "Invalid Credentials"})
        }
       const isPasswordCorrect= await bcrypt.compare(password,user.password)
       if(!isPasswordCorrect){
        return res.status(400).json({message: "Invalid Credentials"})
       }
        generateToken(user._id,res)
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
        })
       

    }catch(error){
        console.log("error in login controller",error.message);
        res.status(500).json({message:"Internal server Error"});

    }
}

export const logout=(req, res)=>{
    try{
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logged out successfully"})

    }catch(error){

        console.log("error in logout controller",error.message);
        res.status(500).json({message:"Internal server Error"});
    }
};

export const updateProfile= async(req, res)=>{
    try{
        const {profilePic}=req.body;
        const userId= req.user._id;
        
        if(!profilePic){
            return res.status(400).json({message: "Please add a profile picture"});
        }
        
        // Validate base64 image format
        if (!profilePic.startsWith('data:image/')) {
            return res.status(400).json({message: "Invalid image format"});
        }
        
        // Upload to Cloudinary with error handling
        let uploadResponse;
        try {
            uploadResponse = await cloudinary.uploader.upload(profilePic, {
                folder: 'profile_pics',
                resource_type: 'image',
                allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
                transformation: [
                    { width: 300, height: 300, crop: 'fill', quality: 'auto' }
                ]
            });
        } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            return res.status(500).json({message: "Failed to upload image. Please try again."});
        }
        
        // Update user with new profile picture URL
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );
        
        res.status(200).json(updatedUser);
        
    } catch(error) {
        console.error("Error in update profile:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export const checkAuth= (req, res)=>{
    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log("error in check auth",error.message);
        res.status(500).json({message:"Internal server Error"});
    }
}