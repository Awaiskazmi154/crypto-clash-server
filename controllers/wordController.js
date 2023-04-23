import axios from 'axios';

export const generateRandomWords = async (req, res) => {
  try {
    const { count } = req.query;

    const characters ='abcdefghijklmnopqrstuvwxyz';
    const randomLetterStart = characters.charAt(Math.floor(Math.random() * 26));
    const randomLetterEnd = characters.charAt(Math.floor(Math.random() * 26));

    const response = await axios.get(`https://api.datamuse.com/words?sp=${randomLetterStart}????&max=5`);
    const words = response.data.map((wordObj) => wordObj.word);
    res.status(200).send(words);
    
  } catch (ex) {
    for (field in ex.errors) {
      res.status(400).send(ex.errors[field].message);
    }
    res.end();
    return;
  } 
};
