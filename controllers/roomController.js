import Room from '../models/Room.js';
import Player from '../models/Player.js';
import getValidationArray from '../utils/validateGuess.js';

export const joinRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { player_name } = req.body;

    var player = await Player.findOne({ name: player_name });
    if (!player) {

      player = new Player({ name: player_name });
      await player.save();

      // return res.status(404).send({message: 'Player not found'});
    }

    player = await Player.findOne({ name: player_name });


    var room = await Room.findOne({ roomId });
    if (!room) {
      room = new Room({ roomId, players: [player], teamAssignments: [{ codemasters: { players: [player] } }] });
      await room.save();
    }


    // check if user exists in chat
    var playerAlreadyExists = await Room.findOne({
      $and: [
        { roomId: roomId },
        {
          players: { $in: [player._id] },
        },
      ],
    });

    if (playerAlreadyExists) {

      const newRoom = await Room.findOne({ roomId }).populate({
        path: "players",
        model: "Player",
      })
        .exec();

      return res.status(200).send(newRoom);
    }

    const teamAssignments = room.teamAssignments;
    const number_of_code_masters = room.teamAssignments[teamAssignments.length - 1].codemasters.players.length;
    const number_of_decoders = room.teamAssignments[teamAssignments.length - 1].decoders.players.length;

    if (number_of_code_masters <= number_of_decoders) {
      await Room.findOneAndUpdate(
        { roomId },
        {
          $push: { "teamAssignments.$[element].codemasters.players": { _id: player._id }, players: player }
        },

        {
          arrayFilters: [
            {
              "element.round": 1,
            },
          ],
        },
        { returnOriginal: false }
      );
    }
    else {
      await Room.findOneAndUpdate(
        { roomId },
        {
          $push: { "teamAssignments.$[element].decoders.players": { _id: player._id }, players: player }
        },
        {
          arrayFilters: [
            {
              "element.round": 1,
            },
          ],
        },
        { returnOriginal: false }
      );
    }

    var newRoom = await Room.findOne({ roomId }).populate({
      path: "players",
      model: "Player",
    })
      .exec();

    res.status(201).send(newRoom);
    res.end()

  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    var room = await Room.findOne({ roomId }).populate({
      path: "players",
      model: "Player",
    })
      .exec();

    if (!room) {
      return res.status(404).send({ message: 'Room not found' });
    }
    res.json(room);
  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

export const deleteRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOneAndDelete({ roomId });
    if (!room) {
      return res.status(404).send({ message: 'Room not found' });
    }
    res.status(200).send({ message: 'Room Deleted' });
  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

export const updateRoomByGameStart = async (req, res) => {
  try {

    const { player_name } = req.body;
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).send({ message: 'Room not found' });
    }

    var player = await Player.findOne({ name: player_name });
    if (!player) {
      return res.status(404).send({ message: 'Player not found' });
    }

    const no_of_players = room.players.length;

    // No players on other team --- if players has 1 element
    if (no_of_players <= 1) {
      return res.status(404).send({ message: 'No Members on other team!' });
    }

    const teamAssignments = room.teamAssignments;
    const round = room.teamAssignments[teamAssignments.length - 1].round;
    const codemasters = teamAssignments[teamAssignments.length - 1].codemasters
    const decoders = teamAssignments[teamAssignments.length - 1].decoders

    const playerIsCodeMaster = codemasters.players.some(codemaster_player => codemaster_player.toString() == player._id.toString())
    const playerIsDecoder = decoders.players.some(decoder_player => decoder_player.toString() == player._id.toString())

    var codemasters_started = teamAssignments[teamAssignments.length - 1].codemasters.start_game;
    var decoders_started = teamAssignments[teamAssignments.length - 1].decoders.start_game;

    // if the player is codemaster and not started
    if (playerIsCodeMaster && !codemasters_started) {

      await Room.findOneAndUpdate(
        { roomId },
        {
          "teamAssignments.$[element].codemasters.start_game": true
        },
        {
          arrayFilters: [
            {
              "element.round": round,
            },
          ],
        },
        { returnOriginal: false }
      );

    }

    // if the player is decoder and not started
    else if (playerIsDecoder && !decoders_started) {

      await Room.findOneAndUpdate(
        { roomId },
        {
          "teamAssignments.$[element].decoders.start_game": true
        },
        {
          arrayFilters: [
            {
              "element.round": round,
            },
          ],
        },
        { returnOriginal: false }
      );

    }

    var newRoom = await Room.findOne({ roomId }).populate({
      path: "players",
      model: "Player",
    })
      .exec();

    codemasters_started = newRoom.teamAssignments[teamAssignments.length - 1].codemasters.start_game;
    decoders_started = newRoom.teamAssignments[teamAssignments.length - 1].decoders.start_game;

    if (codemasters_started == decoders_started) {

      await Room.findOneAndUpdate(
        { roomId },
        {
          "teamAssignments.$[element].codemasters.start_time": Date.now(),
          "teamAssignments.$[element].codemasters.time_remaining_in_secs": 30,
        },
        {
          arrayFilters: [
            {
              "element.round": round,
            },
          ],
        },
        { returnOriginal: false }
      );

      newRoom = await Room.findOne({ roomId }).populate({
        path: "players",
        model: "Player",
      })
        .exec();

    }

    return res.status(201).send(newRoom);

  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

export const updateRoomBySecretWord = async (req, res) => {
  try {

    const { secret_word, player_name } = req.body;
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).send({ message: 'Room not found' });
    }

    var player = await Player.findOne({ name: player_name });
    if (!player) {
      return res.status(404).send({ message: 'Player not found' });
    }

    const teamAssignments = room.teamAssignments;
    const round = room.teamAssignments[teamAssignments.length - 1].round;
    const start_time = room.teamAssignments[teamAssignments.length - 1].codemasters.start_time;

    var now = new Date();

    // countDown is passed
    if ((now.getTime() - 30000) > start_time.getTime()) {
      // console.log("Selected date is in the past");

      await Room.findOneAndUpdate(
        { roomId },
        {
          "teamAssignments.$[element].codemasters.time_remaining_in_secs": 0,
        }
        ,
        {
          arrayFilters: [
            {
              "element.round": round,
            },
          ],
        },
        { returnOriginal: false }
      );
      var newRoom = await Room.findOne({ roomId }).populate({
        path: "players",
        model: "Player",
      })
      .exec();
      // return res.status(201).send({ room: newRoom, message: "Time's Up!" });
      // return res.status(201).send(newRoom);

    }

    // console.log("Selected date is NOT in the past");

    const word_exists = room.teamAssignments[teamAssignments.length - 1].codemasters.secret_word[0];

    var playerIsCodeMaster = await Room.aggregate([{ $project: { teamAssignments: { $arrayElemAt: ['$teamAssignments', -1] } } },
    { $match: { 'teamAssignments.codemasters.players': { $in: [player._id] } } }])

    if (playerIsCodeMaster.length == 0) {
      return res.status(404).send({ message: 'Player is not code master' });
    }

    if (word_exists) {
      return res.status(404).send({ message: 'Word already exists' });
    }

    else {
      await Room.findOneAndUpdate(
        { roomId },
        {
          $push: { "teamAssignments.$[element].codemasters.secret_word": secret_word },
          "teamAssignments.$[element].codemasters.time_remaining_in_secs": null,
          "teamAssignments.$[element].decoders.start_time": Date.now(),
          "teamAssignments.$[element].decoders.time_remaining_in_secs": 60,
        },
        {
          arrayFilters: [
            {
              "element.round": round,
            },
          ],
        },
        { returnOriginal: false }
      );

    }
    var newRoom = await Room.findOne({ roomId }).populate({
      path: "players",
      model: "Player",
    })
      .exec();
    return res.status(201).send(newRoom);


  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

export const updateRoomByGuess = async (req, res) => {
  try {

    const { guess, player_name } = req.body;
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).send({ message: 'Room not found' });
    }

    var player = await Player.findOne({ name: player_name });
    if (!player) {
      return res.status(404).send({ message: 'Player not found' });
    }

    const teamAssignments = room.teamAssignments;
    const no_of_guesses = room.teamAssignments[teamAssignments.length - 1].decoders.guesses.length;
    const secret_word = room.teamAssignments[teamAssignments.length - 1].codemasters.secret_word[0];
    const round = room.teamAssignments[teamAssignments.length - 1].round;
    const decoders_ = room.teamAssignments[teamAssignments.length - 1].decoders;
    const codemasters_ = room.teamAssignments[teamAssignments.length - 1].codemasters;
    const playerIsCodeMaster = codemasters_.players.some(codemaster_player => codemaster_player.toString() == player._id.toString())
  
    if (playerIsCodeMaster) {
      return res.status(404).send({ message: 'Player is not decoder' });
    }

    const start_time = room.teamAssignments[teamAssignments.length - 1].decoders.start_time;
    var now = new Date();

    // countDown is passed
    if ((now.getTime() - 60000) > start_time.getTime()) {
      // console.log("Selected date is in the past");

      await Room.findOneAndUpdate(
        { roomId },
        {
          "teamAssignments.$[element].decoders.time_remaining_in_secs": 0,
          "teamAssignments.$[element].codemasters.team_score": codemasters_.team_score + 10,
        }
        ,
        {
          arrayFilters: [
            {
              "element.round": round,
            },
          ],
        },
        { returnOriginal: false }
      )

      var newRoom = await Room.findOne({ roomId }).populate({
        path: "players",
        model: "Player",
      })
      .exec();
      // return res.status(201).send({ room: newRoom, message: "Time's Up!" });
      return res.status(201).send(newRoom);

    }

    // Guess has already been made OR Guess limit reached
    if (decoders_.correct_guess || no_of_guesses >= 5) {
      
      // return res.status(201).send({ room: newRoom, message: "Guess limit reached!" });
      // return res.status(201).send({ room: newRoom, message: "Already guessed!" });
      return res.status(201).send(room);
    }

    
    // Guess results array
    var guess_output = getValidationArray(guess, secret_word)

    const guessObj = {
      guess,
      // player: player._id,
      guess_output
    }

    await Room.findOneAndUpdate(
      { roomId },
      {
        "teamAssignments.$[element].decoders.time_remaining_in_secs": (Math.abs((now.getSeconds()) - (start_time.getSeconds() + 60)) % 60),
        $push: { "teamAssignments.$[element].decoders.guesses": guessObj }
      },
      {
        arrayFilters: [
          {
            "element.round": round,
          },
        ],
      },
      { returnOriginal: false }
    );

    // Check for incorrect guess
    const incorrect_guess = guess_output.some(letter => letter == '-' || letter == '.')

    // if the guess is INCORRECT and is LAST guess
    if (incorrect_guess && no_of_guesses == 4) {

      await Room.findOneAndUpdate(
        { roomId },
        {
          "teamAssignments.$[element].decoders.time_remaining_in_secs": null,
          "teamAssignments.$[element].codemasters.team_score": codemasters_.team_score + 10,
        }
        ,
        {
          arrayFilters: [
            {
              "element.round": round,
            },
          ],
        },
        { returnOriginal: false }
      );
      var newRoom = await Room.findOne({ roomId });
      return res.status(201).send(newRoom);
    }

    // if the guess is CORRECT
    if (!incorrect_guess) {

      await Room.findOneAndUpdate(
        { roomId },
        {
          "teamAssignments.$[element].decoders.time_remaining_in_secs": null,
          "teamAssignments.$[element].decoders.correct_guess": true,
          "teamAssignments.$[element].decoders.team_score": decoders_.team_score + 10,
        }
        ,
        {
          arrayFilters: [
            {
              "element.round": round,
            },
          ],
        },
        { returnOriginal: false }
      );

      var newRoom = await Room.findOne({ roomId }).populate({
        path: "players",
        model: "Player",
      })
        .exec();
      // return res.status(201).send({ room: newRoom, message: "Correct Guess" });
      return res.status(201).send(newRoom);
    }


    var newRoom = await Room.findOne({ roomId }).populate({
      path: "players",
      model: "Player",
    })
      .exec();
    return res.status(201).send(newRoom);

  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

export const updateRoomByGuessTimeout = async (req, res) => {
  try {

    const { player_name } = req.body;
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).send({ message: 'Room not found' });
    }

    var player = await Player.findOne({ name: player_name });
    if (!player) {
      return res.status(404).send({ message: 'Player not found' });
    }

    const teamAssignments = room.teamAssignments;
    const round = room.teamAssignments[teamAssignments.length - 1].round;
    const codemasters_ = room.teamAssignments[teamAssignments.length - 1].codemasters;
    
    // const playerIsCodeMaster = codemasters_.players.some(codemaster_player => codemaster_player.toString() == player._id.toString())
  
    // if (playerIsCodeMaster) {
    //   return res.status(404).send({ message: 'Player is not decoder' });
    // }

      await Room.findOneAndUpdate(
        { roomId },
        {
          "teamAssignments.$[element].decoders.time_remaining_in_secs": 0,
          "teamAssignments.$[element].codemasters.team_score": codemasters_.team_score + 10,
        }
        ,
        {
          arrayFilters: [
            {
              "element.round": round,
            },
          ],
        },
        { returnOriginal: false }
      )

      // return res.status(201).send({ room: newRoom, message: "Time's Up!" });
    

    var newRoom = await Room.findOne({ roomId }).populate({
      path: "players",
      model: "Player",
    })
      .exec();
    return res.status(201).send(newRoom);

  } catch (ex) {
    console.log('ex', ex)
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

export const updateRoomByRound = async (req, res) => {
  try {

    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).send({ message: 'Room not found' });
    }

    const teamAssignments = room.teamAssignments;
    const decoders_ = room.teamAssignments[teamAssignments.length - 1].decoders;
    const codemasters_ = room.teamAssignments[teamAssignments.length - 1].codemasters;
    const round = room.teamAssignments[teamAssignments.length - 1].round;

    if (codemasters_.secret_word.length == 0 || (decoders_.guesses.length < 5 &&  !decoders_.correct_guess && decoders_.time_remaining_in_secs != 0)) {
      return res.status(404).send({ message: 'Round is not over!' });
    }

    // create new Assignment for next round before last round
    if (round < 6) {

      var newTeamAssignment = {
        codemasters: {
          players: round != 3 ? codemasters_.players : decoders_.players,
          secret_word: [],
          team_score: round != 3 ? codemasters_.team_score : decoders_.team_score
        },

        decoders: {
          players: round != 3 ? decoders_.players : codemasters_.players,
          guesses: [],
          team_score: round != 3 ? decoders_.team_score : codemasters_.team_score
        },

        round: round + 1
      }

      await Room.findOneAndUpdate(
        { roomId },
        {
          $push: { teamAssignments: newTeamAssignment }
        },
        { returnOriginal: false }
      );

    }
    // declare winner on last round and over the game
    else {
      
      const winner = (codemasters_.team_score == decoders_.team_score) ? "Tie" : (codemasters_.team_score > decoders_.team_score) ? "Codemasters" : "Decoders"
      
      console.log('last round')

      await Room.findOneAndUpdate(
        { roomId },
        {
          gameOver: true, winner,
        },
         { returnOriginal: false }
      );
    }

    var newRoom = await Room.findOne({ roomId }).populate({
      path: "players",
      model: "Player",
    })
      .exec();
    return res.status(201).send(newRoom);

  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};



