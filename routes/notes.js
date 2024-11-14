const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');


// Route 1 ==> Get all the notes using GET '/api/notes/fetchallnotes'
router.get('/fetchallnotes', fetchuser, async (req, res) => {

    try {
        // Finding notes of user from is User Id
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured")
    }
});

// Route 2 ==> Add a new notes using POST '/api/notes/addnote'
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid Title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 6 })
], async (req, res) => {



    try {
        // Destructuring the getting array from the api
        const { title, description, tag } = req.body;

        // If there are errors return bad requests and error messages
        const errors = validationResult(req);

        // Error if there is empty Notes gave by the user 
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Creating note for particular user ID
        const note = new Note({
            title, description, tag, user: req.user.id
        });

        // Saving Note in Database
        const saveNote = await note.save();
        res.json(saveNote);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured")
    }

});

// Route 3 ==> Add a new notes using PUT '/api/notes/updatenote'
router.put('/updatenote/:id', fetchuser, async (req, res) => {

    try {
        // Destructuring the getting array from the api
        const { title, description, tag } = req.body;

        // Checking what is coming from the request and what should we have to update
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Checking whether the Id provided by user is exists or not
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not found") }

        // Checking the correct user is trying to access the note or not
        if (note.user.toString() !== req.user.id) {
            return req.status(401).send("Not Allowed")
        }  

        // Finding which note we have to update and after finding update it
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured")
    }

});

// Route 4 ==> Deleting a notes using DELETE '/api/notes/updatenote'
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        // Destructuring the getting array from the api
        // eslint-disable-next-line
        const { title, description, tag } = req.body;

        // Checking whether the Id provided by user is exists or not
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).json("Sorry! We cannot find note for this ID") }

        // Checking the correct user is trying to access the note or not
        if (note.user.toString() !== req.user.id) {
            return req.status(401).send("You are not allowed for Delete this note")
        }

        // Finding which note we have to delete and after finding delet it
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "success": "Note has been deleted" });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({"Some error occured": error.message})
    }

})

module.exports = router