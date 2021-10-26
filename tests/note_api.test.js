const mongoose  = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Note = require('../models/note')

const initialNotes = [
    {
        content: 'HTML is easy',
        date: new Date(),
        important: false,
    },{
        content:'Browser can only execute Javascript',
        date: new Date(),
        important: true,
    }
]
beforeEach(async() => {
    await Note.deleteMany({})
    let noteObject = new Note(initialNotes[0])
    await noteObject.save()
    noteObject = new Note(initialNotes[1])
    await noteObject.save()
})

test('notes are returned as json', async () => {
    await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
},10000)

test('there are two notes', async () => {
    const response = await api.get('/api/notes')

    expect(response.body).toHaveLength(initialNotes.length)
})

test('the first test is http method', async () => {
    const response = await api.get('/api/notes')
    const contents = response.body.map(r => r.content)
    expect(contents).toContain('Browser can only execute Javascript')
})

test('a valid note can be added', async () => {
    const newNote = {
        content:'async/await simplifies making async calls',
        important:true,

    }

    await api.post('/api/notes')
        .send(newNote)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    const response = await api.get('/api/notes')
    const contents = response.body.map(r => r.content)
    expect(response.body).toHaveLength(initialNotes.length+1)
    expect(contents).toContain('async/await simplifies making async calls')
})

test('note without content is not added', async () => {
    const newNote = {
        important:true

    }

    await api
        .post('/api/notes')
        .send(newNote)
        .expect(400)
    const response = await api.get('/api/notes')
    expect(response.body).toHaveLength(initialNotes.length)
})


afterAll(() => {mongoose.connection.close()})