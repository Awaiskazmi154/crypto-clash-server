import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true,
    },
    players: [{type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    messages: [
        {
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Player",
                required: true,
            },

            time_stamp: { type: Date, default: Date.now()},
            content: { type: String, required: true },
        },
    ],
});

const Chat  = mongoose.model("Chat", chatSchema);
export default Chat

