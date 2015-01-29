/***************/
/*   Modules   */
/***************/
/* require necessary modules for application, database, and http connectivity */
/* require body-parser and morgan for incoming requests and better logging */
/* require errorhandler for a better looking response in the case of an error */
var express = require('express')
var errorHandler = require('errorhandler')
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
/*
 * Any fields that are not present in the schema declaration will be ignored when
 * persisting and object to the database
 */
var postSchema = new Schema ({
  /*
   * Mongoose schema allows you to specify options for any given field.
   */
  title: {
    type: String,
    required: true,
    trim: true,
    /*
     * You can add advanced format restrictions to String fields using match and
     * regular expressions.
     *
     * This will only allow a word with the listed characters and between the length
     * of 1 and 100
     */
    match: /^([\w ,.!?]{1,100})$/
  },
  text: {
    type: String,
    required: true,
    /*
     * You can add a maximum or minimum character length
     */
    max: 2000
  },
  /*
   * Mongoose supports arrays as part of schema definition. This code denotes
   * an association where a `foreign key` is being stored. This key will likely
   * be used later to retrieve a model instance.
   */
  followers: [Schema.Types.ObjectId],
  /*
   * When using Schema.Types.Mixed, you are saying that you don't know or don't
   * car what kind of data you are storing. This is great for third party api's
   * that send you valuable meta data.
   *
   * The downfall is that mongoose cannot detect the type of data being stored.
   * This causes problems when trying to update/change that data because mongo
   * will not know what it needs to save them.
   */
  meta: Schema.Types.Mixed,
  /*
   * This is an example of declaring complex and detailed schema structures.
   *
   * Posts have comments and each comment will have an author.
   */
  comments: [{
    text: {
      type: String,
      trime: true,
      max: 2000
    },
    author: {
      /*
       * `ref` here is used to define what Model mongoose will reference when
       * using the objectid.
       */
      id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String
    }
  }],
  /*
   * You can mix and match flavors of field declarations. This one just lists
   * the datatype, while the above examples have an options hash.
   */
  viewCounter: Number,
  published: Boolean,
  /*
   * Mongoose gives you the `default` property that you can add during schema definition.
   * This property will be given to the model if the field is not populated when writing
   * to the database
   */
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true
  }
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
   * Model instances in mongoose have validation methods,
   * allowing you to throw errors and avoid saving while
   * returning a useful message to the user
   */
  post.validate(function(error){
    if (error) return next(error)
    /*
    * Then you call save() on that object to persist it to the database.
    * The callback will return the error or the results of the query.
    */
    post.save(function(error, results){
      if (error) return next(error)
      res.send(results)
    })
  })
})

/*
 * Simple error handling middleware used to format the descriptive
 * error message returned by the server
 */
app.use(errorHandler())

/*
 * Start the server
 */
var server = http.createServer(app).listen(3000)
