import cloudinary from '../lib/cloudinary.js';

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