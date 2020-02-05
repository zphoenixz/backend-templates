exports.getPosts = (req, res, next) => {
    res.json({
        post: [{
            title: 'First Post',
            content: 'This is first post!'
        }]
    });
};

exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    console.log(title);
    //Create post in db
    res.status(201).json({
        message: 'Post created succesfully',
        post: {
            id: new Date().toISOString(),
            title: title,
            content: content
        }
    });
};