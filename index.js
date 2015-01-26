/***************/
/*   Modules   */
/***************/
/* require necessary modules for application, database, and http connectivity */
/* require body-parser and morgan for incoming requests and better logging */
var express = require('express')
var mongoose = require('mongoose')
var http = require('http')
var bodyParser = require('body-parser')
var logger = require('morgan')
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
var Post = dbConnection.model( 'Post', postSchema, 'posts' )

/**************/
/* Middleware */
/**************/
/*
 * Using Morgan for logging in the dev environment
 */
app.use( logger('dev') )
/*
 * body parser to parse json data
 */
app.use( bodyParser.json() )
/*
 * Extended objects can also be parsed from the urlencoded string.
 * Extended objects meaning nested objects.
 */
app.use( bodyParser.urlencoded({ extended: true }) )


/**************/
/*   Routes   */
/**************/
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
  Post.find({}, function(error, posts, next){
    /*
     * Handle errors by yielding to the next middleware in the stack
     */
    if (error) return next(error)
    res.send(posts)
  })
})

/*
 * Create a POST route that allows creation of new post resources.
 */
app.post('/posts', function(req, res, next){
  /*
   * In mongoose you create the model first and pass in the object with
   * the appropriate properties
   */
  post = new Post(req.body)

  /*
   * Then you call save() on that object to persist it to the database.
   * The callback will return the error or the results of the query.
   */
  post.save(function(error, results){
    if (error) return next(error)
    res.send(results)
  })
})

/*
 * Start the server
 */
var server = http.createServer(app).listen(3000)
