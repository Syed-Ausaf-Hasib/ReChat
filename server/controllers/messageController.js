//Get all users except logged in

import Message from "../models/Message.jsx";
import User from "../models/User.jsx";

export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        //count unseen messages from each user
        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, recieverId: userId, seen: false })
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({ success: true, users: filteredUsers, unseenMessages });
    }
    catch (error) {
        console.log("Error in getUsersForSidebar controller", error.message);
        res.json({ success: false, message: error.message });
    }
}

//Get all messages for selected users
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        })
        await Message.updateMany({ senderId: selectedUserId, recieverId: myId, seen: false }, { $set: { seen: true } });
        res.json({ success: true, messages });
    } catch (error) {
        console.log("Error in getMessages controller", error.message);
        res.json({ success: false, message: error.message });
    }
}

// Mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });
    } catch (error) {
        console.log("Error in markMessageAsSeen controller", error.message);
        res.json({ success: false, message: error.message });
    }
}
