const { validationResult } = require('express-validator/check');


exports.getPosts = (req, res, next) => {
    res.json({
        post: [{
            _id: '1',
            title: 'First Post',
            content: 'This is first post!',
            imageUrl: 'images/bolivia.jpg',
            creator: {
                name: 'Ramiro'
            },
            createdAt: new Date()
        }]
    });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed, entered data is incorrect.',
            errors: errors.array()
        })
    }

    const title = req.body.title;
    const content = req.body.content;
    // console.log(title);
    //Create post in db
    res.status(201).json({
        message: 'Post created succesfully',
        post: {
            _id: new Date().toISOString(),
            title: title,
            content: content,
            creator: {
                name: 'Ramiro'
            },
            createdAt: new Date()
        }
    });
};