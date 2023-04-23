import Room from '../models/Room.js';
import Player from '../models/Player.js';
import Chat from '../models/Chat.js';

var populateQuery = [{
    path: "players",
    model: "Player",
},
{
    path: 'messages.sender',
    model: 'Player'
}
];

export const joinChat = async (req, res) => {

    try {
        const { roomId, player_name } = req.body;

        var player = await Player.findOne({ name: player_name });
        if (!player) {
            return res.status(404).send({ message: 'Player not found' });
        }

        var room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).send({ message: 'Room not found' });
        }

        // check if room exists in chat
        var chatHavingRoom = await Chat.findOne({ roomId }).populate(populateQuery)
        .exec();


        if (!chatHavingRoom) {
            const chat = new Chat({ roomId, players: [player] });
            await chat.save();

            const newChat = await Chat.findOne({ roomId }).populate(populateQuery)
            .exec();

            return res.status(200).send(newChat);
        }

        var playerAlreadyExists = chatHavingRoom.players.some((player) => player.name == player_name)

        if (playerAlreadyExists) {

            const newChat = await Chat.findOne({ roomId }).populate(populateQuery)
            .exec();

            return res.status(200).send(newChat);
        }

        // check if room exists in chat and player is new
        else {

            await Chat.findOneAndUpdate(
                { roomId },
                {
                    $push: { players: player },
                },

                { returnOriginal: false, upsert: true }
            );

            const newChat = await Chat.findOne({ roomId }).populate(populateQuery)
            .exec();

            return res.status(200).send(newChat);
        }

    } catch (ex) {

        console.log('error', ex)
        for (field in ex.errors) {
            res.status(400).send(ex.errors[field].message);
        }
        res.end();
        return;
    }
};

export const leaveChat = async (req, res) => {

    try {
        const { roomId, player_name } = req.body;

        var player = await Player.findOne({ name: player_name });
        if (!player) {
            return res.status(404).send({ message: 'Player not found' });
        }

        var room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).send({ message: 'Room not found' });
        }

        // check if room exists in chat
        var chat = await Chat.findOne({ roomId }).populate(populateQuery)
        .exec();

        if (!chat) {
            return res.status(404).send({ message: 'Chat not found' });
        }

        var playerExists = chat.players.some((player) => player.name == player_name)

        if (!playerExists) {
            return res.status(404).send({ message: 'Player not found in the Chat!' });
        }

        // check if room exists in chat and player is new
        await Chat.findOneAndUpdate(
            { roomId },
            {
                $pull: { players: player._id },
            },

            { returnOriginal: false, upsert: true }
        );

        const newChat = await Chat.findOne({ roomId }).populate(populateQuery)
        .exec();

        return res.status(200).send(newChat);

    } catch (ex) {

        console.log('error', ex)
        for (field in ex.errors) {
            res.status(400).send(ex.errors[field].message);
        }
        res.end();
        return;
    }
};

export const getChat = async (req, res) => {
    try {
        const { roomId } = req.body;

        var chat = await Chat.findOne({ roomId }).populate(populateQuery)
        .exec();

        if (!chat) {
            return res.status(404).send({ message: 'Chat not found' });
        }

        res.json(chat);
    } catch (ex) {
        for (field in ex.errors) {
            res.status(400).send(ex.errors[field].message);
        }
        res.end();
        return;
    }
};

export const updateChat = async (req, res) => {
    try {
        const { roomId, player_name, message } = req.body;

        var player = await Player.findOne({ name: player_name });
        if (!player) {
            return res.status(404).send({ message: 'Player not found' });
        }

        var room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).send({ message: 'Room not found' });
        }

        const chat = await Chat.findOne({ roomId }).populate(populateQuery)
            .exec();

        if (!chat) {
            return res.status(404).send({ message: 'Chat not found' });
        }

        var playerExists = chat.players.some((player) => player.name == player_name)

        if (!playerExists) {
            return res.status(404).send({ message: 'Player not found in the Chat!' });
        }

        const newMessage = {
            sender: player,
            content: message
        }

        await Chat.findOneAndUpdate(
            { roomId },
            {
                $push: { messages: newMessage },
            },

            { returnOriginal: false, upsert: true }
        );

        const newChat = await Chat.findOne({ roomId }).populate(populateQuery)
            .exec();

        return res.status(200).send(newChat);

    } catch (ex) {

        console.log('error', ex)
        for (field in ex.errors) {
            res.status(400).send(ex.errors[field].message);
        }
        res.end();
        return;
    }
};

export const deleteChat = async (req, res) => {
    try {
        const { roomId } = req.body;

        var chat = await Chat.findOneAndDelete({ roomId })

        if (!chat) {
            return res.status(404).send({ message: 'Chat not found' });
        }

        res.status(200).send({ message: 'Chat Deleted' });

    } catch (ex) {
        for (field in ex.errors) {
            res.status(400).send(ex.errors[field].message);
        }
        res.end();
        return;
    }
};
