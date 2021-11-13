const mongoose = require ('mongoose')

if (process.argv.length < 3){
    console.log('please provide password as an arguemebt')
    process.exit(1)
}

const password = process.argv[2]

const url=`mongodb+srv://fullstackopen:${password}@cluster0.suius.mongodb.net/notes?retryWrites=true&w=majority`

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

// Note.find({important:true}).then(result => {
//     result.forEach(note =>{
//         console.log(note)
//     })
//     mongoose.connection.close()
// })

const note = new Note({
    content: 'HTML is too easy',
    date: new Date(),
    important: true,
})
console.log('hello world')
note.save().then(() => {
    console.log('note saved!')
    mongoose.connection.close()
})