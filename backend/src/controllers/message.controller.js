import cloudinary from '../lib/cloudinary.js';
import { getReceiverSocketId, io } from '../lib/socket.js';

import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getAllContacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        {senderId: myId, receiverId: userToChatId},
        {senderId: userToChatId, receiverId: myId},
      ]
    });

    res.status(200).json(messages);

  } catch (error) {
    console.error("Error in getMessages controller:", error);
    res.status(500).json({ error: "Internal Server Error" });

  }
}

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }

    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself" });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(400).json({ message: "Receiver not found" });
    }

    let imageUrl;
    if (image) {
      // updload base64 image to cloudinary
      const updloadResponse = await cloudinary.uploader.upload(image);
      imageUrl = updloadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);

  } catch (error) {
    console.error("Error in sendMessage controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getChatPartners = async (req, res) => {
  try {
    const loggedUserId = req.user._id;

    // find all the messages where the logged-in user is either send or receiver
    const messages = await Message.find({
      $or: [
        {senderId: loggedUserId},
        {receiverId: loggedUserId},
      ],
    });

    const chatPartnersIds = [...new Set(messages.map(msg => (
      msg.senderId.toString() === loggedUserId.toString() ? msg.receiverId.toString(): msg.senderId.toString()
    )))];

    const chatPartners = await User.find({ _id: { $in: chatPartnersIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners:", error);
    res.status(500).json({ message: "Internal Server Error" });
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