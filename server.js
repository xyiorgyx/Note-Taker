const express = require('express');
const path = require('path');
const app = express();
const uuid = require('./helper/uuid');
const PORT = 3001;
const {writeToFile, readFromFile, readAndAppend } = require('./helper/helper');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/api/db.json', (req, res) => {
  res.status(200).json(notes);
});

app.get('/notes', (req, res) => 
  res.sendFile(path.join(__dirname, '/public/notes.html'))
)

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);


// GET Route for retrieving all the feedback
app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received for feedback`);

  readFromFile('./db/db.json').then((notes) => res.json(JSON.parse(notes)));
}); 

app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to add a new Note`);

  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    const response = {
      status: 'success',
      body: newNote,
    };

    readAndAppend(newNote, './db/db.json');
    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting new note');
  }
});

// DELETE Route for a specific tip
app.delete('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  readFromFile('./db/db.json')
    .then((notes) => JSON.parse(notes))
    .then((json) => {
      // Make a new array of all tips except the one with the ID provided in the URL
      const result = json.filter((note) => note.id !== id);

      // Save that array to the filesystem
      writeToFile('./db/db.json', result);

      // Respond to the DELETE request
      res.json(`Item ${id} has been deleted 🗑️`);
    });
});
