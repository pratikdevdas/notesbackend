const mongoose  = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Note = require('../models/note')

//initialnotes array refactored to file './test_helper'
beforeEach(async() => {
    await Note.deleteMany({})
    console.log('cleared')

    for(let note of helper.initialNotes){
        let noteObject = new Note(note)
        await noteObject.save()
        console.log('saved')
    }
    console.log('done')
})

describe('when there is initially some note saved',() => {
    test('notes are returned as json', async () => {
        console.log('entered')
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    },10000)

    test('all notes are returned', async () => {

        const response = await api.get('/api/notes')

        expect(response.body).toHaveLength(helper.initialNotes.length)
    })

    test('a specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes')

        const contents = response.body.map(r => r.content)

        expect(contents).toContain(
            'Browser can execute only Javascript'
        )
    })
})

describe('viewing specific notes',() => {
    test('suceeds with valid id', async () => {
        const notesAtStart = await helper.notesInDb()
        const noteToView = notesAtStart[1]

        const resultNote = await api.get(`/api/notes/${noteToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        console.log(resultNote.body)
        const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
        expect(resultNote.body).toEqual(processedNoteToView)
    })

    test('fails with status code 404 if note does not exist', async () => {
        const validNonExistingId = await helper.nonExistingId()
        console.log(validNonExistingId)

        await api
            .get(`/api/notes/${validNonExistingId}`)
            .expect(404)

    })

    test('fails with status code 404 if note does not exist', async () => {
        const invalidId = 'bsdfbgdfbd'

        await api
            .get(`/api/notes/${invalidId}`)
            .expect(400)

    })
})


describe('addition of new note',() => {
    test('succeeds if data is valid', async () => {
        const newNote = {
            content:'async/await simplifies making async calls',
            important:true,

        }

        await api
            .post('/api/notes')
            .send(newNote)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const notesAtEnd = await helper.notesInDb()
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length+1)

        const contents = notesAtEnd.map(r => r.content)
        expect(contents).toContain('async/await simplifies making async calls')
    })

    test('note without content is not added i.e if data invalid', async () => {
        const newNote = {
            important:true
        }

        await api
            .post('/api/notes')
            .send(newNote)
            .expect(400)
        const notesAtEnd = await helper.notesInDb()
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
    },)


})

describe('deletion of note',() => {
    test('a note that can be deleted', async () => {
        const notesAtStart = await helper.notesInDb()
        const noteToDelete = notesAtStart[0]

        await api.delete(`/api/notes/${noteToDelete.id}`)
            .expect(204)

        const notesAtEnd = await helper.notesInDb()

        expect(notesAtEnd).toHaveLength(
            helper.initialNotes.length - 1
        )

        const contents = notesAtEnd.map(r => r.content)
        expect(contents).not.toContain(noteToDelete.content)
    })
})
afterAll(() => {mongoose.connection.close()})

// The following command only runs the tests found in the tests/note_api.test.js file:

// npm test -- tests/note_api.test.js
// The -t option can be used for running tests with a specific name:

// npm test -- -t "a specific note is within the returned notes"
// The provided parameter can refer to the name of the test or the describe block. The parameter can also contain just a part of the name. The following command will run all of the tests that contain notes in their name:

// npm test -- -t 'notes'