import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";

//Sign up new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.json({ success: false, message: "Please provide all required fields" });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: "Account already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hassedPassword = await bcrypt.hash(password, salt);
        const newUser = new User.create({
            fullName,
            email,
            password: hassedPassword,
            bio
        })
        const token = generateToken(newUser._id);

        res.json({ success: true, userData: newUser, token, message: "Account created successfully" });
    }
    catch (error) {
        console.log("Error in signup controller", error.message);
        return res.json({ success: false, message: error.message });
    }
}

//Login existing user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(userData._id);
        res.json({ success: true, userData, token, message: "Account logged in successfully" });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        return res.json({ success: false, message: error.message });
    }
}

// If user is authenticated
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
}

// Update profile details
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updatedUser;
        if(!profilePic){
            await User.findByIdAndUpdate(userId, {bio, fullName}, {new:true})
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new:true})
        }
        res.json({success:true, user:updatedUser})
    }
    catch (error) {
        console.log("Error in update profile controller", error.message);
        return res.json({ success: false, message: error.message });
    }
}