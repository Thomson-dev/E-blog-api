import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";


import { getConnectedClient } from '../config/redisClient.js';


export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to create a post"));
  }

  if (!req.body.title || !req.body.content) {
    return next(errorHandler(403, "You are not allowed to create a post"));
  }
  const slug = req.body.title
    .split(" ")
    .join(" ")
    .replace(/[^a-zA-Z0-9-]/g, "");
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });

  try {
    const savedPost = await newPost.save();
    // Update the cache
    const redisClient = await getConnectedClient();
    redisClient.set(`post:${savedPost._id}`, JSON.stringify(savedPost), 'EX', 3600); // Correct syn

    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};


 // Adjust the import path as needed

export const getposts = async (req, res, next) => {
  const cacheKey = 'posts:all';

  try {
    const redisClient = await getConnectedClient();
    
    // Try to get data from cache
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      console.log('Data from cache');
      return res.status(200).json(JSON.parse(cachedData)); 
    }

    // If not in cache, fetch from database
    const posts = await Post.find({}).sort({ createdAt: -1 });
    const totalPosts = await Post.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    const response = {
      posts,
      totalPosts,
      lastMonthPosts,
    };

    // Cache the response
    await redisClient.set(cacheKey, JSON.stringify(response), {
      EX: 3600 // Set expiration to 1 hour
    });

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getpost = async (req, res, next) => {
  const { id } = req.params;
  const cacheKey = `post:${id}`;

  try {
    const redisClient = await getConnectedClient();
    
    // Try to get data from cache
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
    
      return res.status(200).json(JSON.parse(cachedData));
    }

    // If not in cache, fetch from database
    const post = await Post.findById(id);
    
    if (post) {
      // Cache the post data
      await redisClient.set(cacheKey, JSON.stringify(post), {
        EX: 3600 // Set expiration to 1 hour
      });
      res.status(200).json(post);
    } else {
      throw errorHandler(404, "Post not found");
    }
  } catch (error) {
    next(error);
  }
};


export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin ) {
    console.log(req.user.isAdmin);
    return next(errorHandler(403, 'You are not allowed to update this post'));
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },
      { new: true }
    );

    if (updatedPost) {
      // Update the cache
      const redisClient = await getConnectedClient();
      redisClient.set(`post:${req.params.postId}`, JSON.stringify(updatedPost), 'EX', 3600);
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to delete this post'));
  }
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.postId);

    if (deletedPost) {
      // Invalidate the cache
      const redisClient = await getConnectedClient();
      redisClient.del(`post:${req.params.postId}`);
    }

    res.status(200).json('The post has been deleted');
  } catch (error) {
    next(error);
  }
};