const fs = require('fs');
const path = require('path');

const {
    validationResult
} = require('express-validator/check');

const Post = require('../models/post');
const User = require('../models/user');
exports.getPosts = async (req, res, next) => {
    // lee la URL para buscar la pagina
    // http://localhost:8080/feed/posts?page=2
    try {
        const currentPage = req.query.page || 1;
        const perPage = 2;

        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
        res.status(200).json({
            message: 'Fetched posts successfully.',
            posts: posts,
            totalItems: totalItems
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
    // Post.find()
    //     .countDocuments()
    //     .then(count => {
    //         totalItems = count;
    //         return Post.find()
    //             .skip((currentPage - 1) * perPage)
    //             .limit(perPage);
    //     })
    //     .then(posts => {
    //         res.status(200).json({
    //             message: 'Fetched posts succesfully.',
    //             posts: posts,
    //             totalItems: totalItems
    //         });
    //     })
    //     .catch(err => {
    //         if (!err.statusCode) {
    //             err.statusCode = 500;
    //         }
    //         next(err);
    //     });
};
exports.createPost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        if (!req.file) {
            const error = new Error('No image provided.');
            error.statusCode = 422;
            throw error;
        }
        const imageUrl = req.file.path;
        const title = req.body.title;
        const content = req.body.content;
        const post = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: req.userId
        });

        await post.save();
        const user = await User.findById(req.userId);
        user.posts.push(post);
        await user.save();
        res.status(201).json({
            message: 'Post created successfully!',
            post: post,
            creator: {
                _id: user._id,
                name: user.name
            }
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
// exports.createPost = (req, res, next) => {
//     const errors = validationResult(req);
//     const title = req.body.title;
//     const content = req.body.content;

//     if (!req.file) {
//         const error = new Error('No file picked.');
//         error.statusCode = 422;
//         throw error;
//     }
//     let imageUrl = req.file.path;

//     if (!errors.isEmpty()) {
//         if (imageUrl) {
//             clearImage(imageUrl);
//         }

//         const error = new Error('Validation failed, entered data is incorrect.');
//         error.statusCode = 422;
//         throw error;
//     }

//     const post = new Post({
//         title: title,
//         content: content,
//         imageUrl: imageUrl,
//         creator: req.userId
//     })
//     post
//         .save()
//         .then(result => {
//             return User.findById(req.userId);
//         })
//         .then(user => {
//             creator = user;
//             user.posts.push(post);
//             return user.save();

//         })
//         .then(result => {
//             res.status(201).json({
//                 message: 'Post created succesfully!',
//                 post: post,
//                 creator: {
//                     _id: creator._id,
//                     name: creator.name
//                 }
//             });
//         })
//         .catch(err => {
//             if (!err.statusCode) {
//                 err.statusCode = 500;
//             }
//             next(err);
//         });
// }

exports.getPost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);

        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Post fetched.',
            post: post
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

// exports.getPost = (req, res, next) => {
//     const postId = req.params.postId
//     Post.findById(postId)
//         .then(post => {
//             console.log(postId)
//             if (!post) {
//                 const error = new Error('Could not find post.');
//                 error.statusCode = 404;
//                 throw error;
//             }
//             res.status(200).json({
//                 message: 'Post fetched.',
//                 post: post
//             });
//         })
//         .catch(err => {
//             if (!err.statusCode) {
//                 err.statusCode = 500;
//             }
//             next(err);
//         });
// };

exports.updatePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const title = req.body.title;
        const content = req.body.content;
        let imageUrl = req.body.image;
        if (req.file) {
            imageUrl = req.file.path;
        }
        if (!imageUrl) {
            const error = new Error('No file picked.');
            error.statusCode = 422;
            throw error;
        }

        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        const result = await post.save();
        res.status(200).json({
            message: 'Post updated!',
            post: result
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

// exports.updatePost = (req, res, next) => {
//     const errors = validationResult(req);
//     const postId = req.params.postId;
//     const title = req.body.title;
//     const content = req.body.content;

//     if (!req.file) {
//         const error = new Error('No file picked.');
//         error.statusCode = 422;
//         throw error;
//     }
//     let imageUrl = req.file.path;

//     if (!errors.isEmpty()) {
//         if (imageUrl) {
//             clearImage(imageUrl);
//         }

//         const error = new Error('Validation failed, entered data is incorrect.');
//         error.statusCode = 422;
//         throw error;
//     }
//     Post.findById(postId)
//         .then(post => {
//             if (!post) {
//                 if (imageUrl) {
//                     clearImage(imageUrl);
//                 }
//                 const error = new Error('Could not find post.');
//                 error.statusCode = 404;
//                 throw error;
//             }
//             if (post.creator.toString() !== req.userId) {
//                 const error = new Error('Not authorized!')
//                 error.statusCode = 403;
//                 throw error;
//             }
//             if (imageUrl !== post.imageUrl) {
//                 clearImage(post.imageUrl);
//             }
//             post.title = title;
//             post.imageUrl = imageUrl;
//             post.content = content;

//             return post.save();
//         })
//         .then(result => {
//             res.status(200).json({
//                 message: 'Post updated!',
//                 post: result
//             });
//         })
//         .catch(err => {
//             if (!err.statusCode) {
//                 err.statusCode = 500;
//             }
//             next(err);
//         });
// };

exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);

        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }
        // Check logged in user
        clearImage(post.imageUrl);
        await Post.findByIdAndRemove(postId);

        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();

        res.status(200).json({
            message: 'Deleted post.'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

// exports.deletePost = (req, res, next) => {
//     const postId = req.params.postId;

//     Post.findById(postId)
//         .then(post => {
//             if (!post) {
//                 const error = new Error('Could not find post.');
//                 error.statusCode = 404;
//                 throw error;
//             }
//             if (post.creator.toString() !== req.userId) {
//                 const error = new Error('Not authorized!')
//                 error.statusCode = 403;
//                 throw error;
//             }
//             //Check user logged in
//             clearImage(post.imageUrl); //Delete post image
//             return Post.findByIdAndRemove(postId);
//         })
//         .then(result => {
//             return User.findById(req.userId);
//         })
//         .then(user => {
//             user.posts.pull(postId);
//             return user.save();
//         })
//         .then(result => {
//             res.status(200).json({
//                 message: 'Deleted post.',
//                 post: result
//             });
//         })
//         .catch(err => {
//             if (!err.statusCode) {
//                 err.statusCode = 500;
//             }
//             next(err);
//         });
// }


const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}