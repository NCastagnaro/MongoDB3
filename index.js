const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient  //We can connect to MongoDB through the MogoClient's connect method as shown in this code snippet
const PORT = 3000
require('dotenv').config()


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'rap'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)   //Assigns the client.db(dbName) to 'db' variable so that we can work with our database further down in the codebase
    })
    
app.set('view engine', 'ejs')   //We set the view engine we want to use. In this case it is ejs
app.use(express.static('public'))  
//body-parser has been deprecated. These two lines are built into express and allows us to pull stuff out of the request, similar to how body-parser used to work.
app.use(express.urlencoded({ extended: true }))//The urlencoded method within body-parser tells body-parser to extract data from the <form> element and add them to the body property in the request object.
app.use(express.json())


app.get('/',(request, response)=>{
    db.collection('rappers').find().sort({likes: -1}).toArray()  //This goes to our database, goes to the rappers collection, find all the documents(documents are just objects) in the collection, and turn it into an array. So now we have an array of objects. This whole thing returns the array of objects as a promise
    .then(data => {     //data is holding the array of objects. 
        //This line renders our ejs file, which is just pretty much dynamic HTML and responds with it. render is a method on the response object, similar to how we used res.send,res.sendFile, res.json etc. We have access to methods like these, thanks to express. 
        response.render('index.ejs', { info: data })    //Our array of objects in our database is represented by 'data'. And we gave this a name of info. We render the index.ejs file and have access to our array of objects, thanks to the second paramter of { info: data } that we added.
    })
    .catch(error => console.error(error))
})


let date = new Date()
let month = date.getMonth() + 1
let day = date.getDate() 
let year = date.getYear() - 100
let fullYear = `${month}/${day}/${year}`


app.post('/addRapper', (request, response) => {
    //with insertOne, whatever we put inside the curly braces is what gets added to the database. 
    db.collection('rappers').insertOne({stageName: request.body.stageName,
    birthName: request.body.birthName, likes: 0, date:fullYear})
    .then(result => {
        console.log('Rapper Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/addOneLike', (request, response) => {
    db.collection('rappers').updateOne({stageName: request.body.stageNameS, birthName: request.body.birthNameS,likes: request.body.likesS},{
        $set: {
            likes:request.body.likesS + 1
          }
    },{
        sort: {_id: -1},
        upsert: true
    })
    .then(result => {
        console.log('Added One Like')
        response.json('Like Added')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteRapper', (request, response) => {
    db.collection('rappers').deleteOne({stageName: request.body.stageNameS})
    .then(result => {
        console.log('Rapper Deleted')
        response.json('Rapper Deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})