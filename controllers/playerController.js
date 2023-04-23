import Player from '../models/Player.js';

export const createPlayer = async (req, res) => {
  try {
    const { name } = req.body;

    var player_ = await Player.findOne({ name });
    if (player_) {
      return res.status(404).send({ message: 'Player already exists! Try other name!' });
    }

    const player = new Player({ name });
    await player.save();
    res.status(201).json(player);
  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

export const getPlayerByName = async (req, res) => {
  try {
    const { name } = req.body;

    const player = await Player.findOne({ name });
    if (!player) {
      return res.status(404).send({message: 'Player not found'});
    }
    res.json(player);
  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

export const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).send({message: 'Player not found'});
    }
    res.json(player);
  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

export const deletePlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const player = await Player.findByIdAndDelete(id);
    if (!player) {
      return res.status(404).send({message: 'Player not found'});
    }
    res.status(200).send({message: 'Player deleted!'});
  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

export const updatePlayerById = async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  }
};

