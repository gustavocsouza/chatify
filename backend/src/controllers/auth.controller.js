import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import cloudinary from "../lib/cloudinary.js";

import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";
import { emailTest } from "../lib/emailTest.js";


export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    
    if (!emailTest(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    const user = await User.findOne({email});

    if (user) return res.status(400).json({ message: "Email already existis!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword
    });

    if (newUser) {
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res);

      // add test user to create user
      try { 
        const testUserId = ENV.TEST_USER_ID;

        await User.findByIdAndUpdate(
          savedUser._id,
          { $addToSet: { friends: testUserId } }
        );

        await User.findByIdAndUpdate(
          testUserId,
          { $addToSet: { friends: savedUser._id } }
        );

      } catch (error) {
        console.error("Failed to add test user as friend:", error);
      }

      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });

      try {
        await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
      } catch (error) {
        console.error("Failed to send welcome email:", error)
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }

  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error." })
  }
};

export const login = async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({email});
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic
    });
  } catch (error) {
    console.error("Error in login controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const logout = async (_, res) => {
  res.cookie("jwt", "", {maxAge: 0});
  res.status(200).json({ message: "Logged out successfully" });
}

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) return res.status(400).json({ message: "Profile pic is required" });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { profilePic: uploadResponse.secure_url }, 
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update profile pic:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const invite = async (req, res) => {
  try {
    const { email } = req.body;
    const fromUserId = req.user?._id;

    // email validation
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!emailTest(email)) return res.status(400).json({ message: "Invalid email format" });

    const invitedUser = await User.findOne({ email: email });
    if (!invitedUser) return res.status(404).json({ message: "User not found" });

    if (!fromUserId) return res.status(400).json({ message: "Not found logged user" });

    if (invitedUser._id.toString() === fromUserId.toString()) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    if (invitedUser.friends.includes(fromUserId)) {
      return res.status(400).json({ message: "You are already friends" });
    }

    if (invitedUser.friendRequests.includes(fromUserId)) {
      return res.status(400).json({ message: "Invitation already sent previously" });
    }

    await User.findByIdAndUpdate(invitedUser, {
      $addToSet: {friendRequests: fromUserId}
    });

    res.status(200).json({ message: "Invitation sent successfully!" });

    
  } catch (error) {
    console.error("Error in invite route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const accept = async (req, res) => {
  try {
    const { userToAcceptId } = req.body;
    const loggedUser = req.user;

    if (!userToAcceptId) return res.status(404).json({ message: "Something went wrong" });

    const userToAccept = await User.findById(userToAcceptId);
    
    if (!userToAccept) return res.status(404).json({ message: "User not found" });

    const hasRequest = loggedUser.friendRequests.includes(userToAcceptId);

    if (!hasRequest) return res.status(400).json({ message: "Invitation not found" });

    await User.findByIdAndUpdate(loggedUser._id, {
      $pull: { friendRequests: userToAcceptId },
      $addToSet: { friends: userToAcceptId }
    });

    await User.findByIdAndUpdate(userToAcceptId, {
      $addToSet: { friends: loggedUser._id }
    });

    res.status(200).json({ message: "Invitation successfully accepted!" });

  } catch (error) {
    console.log("Error in accept route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getInvitationRequests = async (req, res) => {
  res.json(req.user.friendRequests);
}