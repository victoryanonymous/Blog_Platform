const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000;
const authRouter = require('./routes/authRouter');
const blogPostRouter = require('./routes/blogPostRouter');
const commentRouter = require('./routes/commentRouter');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/blog_platform')
.then(()=> console.log("connected to mongodb"))
.catch((err)=> console.error(err));

app.use('/auth', authRouter);
app.use('/auth/blogs', blogPostRouter);
app.use('/auth', commentRouter);    

app.listen(port , () => {
  console.log(`Server listining on http://127.0.0.1:${port}`);
});

module.exports = app;