import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  teamAssignments: [
    {
      codemasters: {
        players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
        secret_word: [{ type: String }],
        team_score: {
          type: Number,
          default: 0,
        },
        start_game: { type: Boolean, default: false },
        start_time: { type: Date },
        time_remaining_in_secs: { type: Number}
      },
      decoders: {
        guesses: [{
          guess: { type: String },
          // player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
          // correct_letters: [{ type: String, maxLength: 1 }],
          // misplaced_letters: [{ type: String, maxLength: 1 }],
          guess_output: [{ type: String, maxLength: 1 }]
        }],
        players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
        team_score: {
          type: Number,
          default: 0,
        },
        start_game: { type: Boolean, default: false },
        start_time: { type: Date },
        time_remaining_in_secs: { type: Number },
        correct_guess: { type: Boolean, default: false },
      },
      round: {
        type: Number,
        default: 1,
      },
      time_stamp: { type: Date, default: Date.now },
    },
  ],
  winner: { type: String },
  gameOver: { type: Boolean, default: false },
  created: { type: Date, default: Date.now }
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
