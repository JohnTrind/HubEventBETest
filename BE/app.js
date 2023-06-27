const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();

// Define MongoDB connection settings
const MONGO_USER = process.env.MONGO_USER || 'TRINDADE';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'zambujeiro8';
const MONGO_URI = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@hubevent.ju6y9dv.mongodb.net/HubEventAPP?retryWrites=true&w=majority`;

// Apply middleware to Express app
app.use(cors());
app.use(express.json());

// Routes 
const registerUser = async (req, res, db) => { // function for handling user registration
  console.log("aqui")
  try {
    const { name, email, password } = req.body; // get user information from request body
    const user = await db.collection('Users').insertOne({ name, email, password }); // insert user into Users collection in MongoDB
    res.status(201).send(user);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send({ message: 'Error registering user' });
  }
};

const loginUser = async (req, res, db) => {
  try {
    const { email, password } = req.body; // get login credentials from request body
    const user = await db.collection('Users').findOne({ email, password }); // find user in Users collection in MongoDB
    if (user) { // if user exists, send response and success message and user document
      res.status(200).send({ message: 'Login successful', user });
      res.status(200).send({ message: 'Login successful', user });
    } else { // if user does not exist, send response (Unauthorized) and error message
      res.status(401).send({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send({ message: 'Error logging in user' });
  }
};



////////////////////////////////////////////////////////////////////////////////////////

// POST/FETCH_10

const posts = async (req, res, db) => {
  try {
    const posts = await db.collection('Post').find().limit(10).toArray();
    res.status(200).send(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send({ message: 'Error fetching posts' });
  }
};

//CRIA POST
const createPost = async (req, res, db) => {
  try {
    const { title, description, image, userId } = req.body;
    const post = { title, description, image, userId};
    const result = await db.collection('Post').insertOne(post);
    res.status(201).send({ message: 'Post created', post: result.ops[0] });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send({ message: 'Error creating post' });
  }
};


//COMENTARIOS
const addComment = async (req, res, db) => {
  try {
    const { postId, userId, comment } = req.body;
    const result = await db.collection('Post').updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: { userId, comment } } }
    );
    if (result.modifiedCount === 1) {
      res.status(200).send({ message: 'Comment added' });
    } else {
      res.status(404).send({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).send({ message: 'Error adding comment' });
  }
};



//POST FETCH_1 
const getPost = async (req, res, db) => {
  try {
    const { postId } = req.params;
    const post = await db.collection('Post').findOne({ _id: new ObjectId(postId) });
    if (post) {
      res.status(200).send(post);
    } else {
      res.status(404).send({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send({ message: 'Error fetching post' });
  }
};



////////////////////////////////////////////////////////////////////////////////




// Main function
const main = async () => {
  // Connect to MongoDB
  const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db();

    app.post('/users/register', (req, res) => registerUser(req, res, db));// handle user registration
    app.post('/users/login', (req, res) => loginUser(req, res, db)); // handle user login
    app.post('/posts/posts', (req, res) => posts(req, res, db));  
    app.post('/posts', (req, res) => {
      createPost(req, res, db);
    });
    
    app.post('/posts/addComment', (req, res) => addComment(req, res, db));

    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

main();
