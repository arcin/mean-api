/* require necessary modules for application, database, and http connectivity */
var express = require('express')
var mongoose = require('mongoose')
var http = require('http')
var app = express()

/* dbUri is the link to the local database, named api, on the default port (27017) */
var dbUri = 'mongodb://localhost:27017/api'
/*
* This is how you open a connection to a database using mongoose
* provide a dbUri
*/
var dbConnection = mongoose.createConnection(dbUri)

/*
 * A Schema must be provided before we can access our model in mongoose
 * You can declare the new schema for any given model using the mongoose
 * Schema constructor, which takes the name of a property and its datatype.
 */
var Schema = mongoose.Schema
var postSchema = new Schema ({
  title: String,
  text: String
})

/*
 * create a reference reference to the datamapped model
 * The params represent
 *  - The model Name
 *  - The model Schema
 *  - The name of the collection
 * respectively.
 */
var Post = dbConnection.model('Post', postSchema, 'posts')

/*
 * Create a simple root route
 */
app.get('/', function(req, res){
  res.send('ok')
})

/*
 * create a route to get a collection of posts
 */
app.get('/posts', function(req, res){
  /*
   * Use the model find method. If given an empty object it will return all
   * records found in the collection.
   *
   * Errors are always the first arguments in node convention.
   * In mongoose the result of the query is the second argument.
   */
  Post.find({}, function(error, posts){
    /*
     * Handle errors by yielding to the next middleware in the stack
     */
    if (error) return next(error)
    res.send(posts)
  })
})

/*
 * Start the server
 */
var server = http.createServer(app).listen(3000)
