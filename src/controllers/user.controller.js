import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';


// Export the updateUser function so it can be used in other files
export const updateUser = async (req, res, next) => {
  // console.log(req.user.id); 
  
  // Check if the user ID from the request matches the user ID in the URL parameters
  if (req.user.id !== req.params.userId) {
    // If the IDs do not match, call the errorHandler with a 403 status code and an error message
    return next(errorHandler(403, 'You are not allowed to update this user'));
  }

  // Check if the request body contains a password
  if (req.body.password) {
    // If the password is less than 6 characters, call the errorHandler with a 400 status code and an error message
    if (req.body.password.length < 6) {
      return next(errorHandler(400, 'Password must be at least 6 characters'));
    }
    // Hash the password using bcryptjs with a salt rounds value of 10
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }

  // Check if the request body contains a username
  if (req.body.username) {
    // If the username is less than 7 or more than 20 characters, call the errorHandler with a 400 status code and an error message
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(
        errorHandler(400, 'Username must be between 7 and 20 characters')
      );
    }
    // If the username contains spaces, call the errorHandler with a 400 status code and an error message
    if (req.body.username.includes(' ')) {
      return next(errorHandler(400, 'Username cannot contain spaces'));
    }
    // If the username is not lowercase, call the errorHandler with a 400 status code and an error message
    if (req.body.username !== req.body.username.toLowerCase()) {
      
      return next(errorHandler(400, 'Username must be lowercase'));
    }
    // If the username contains characters other than letters and numbers, call the errorHandler with a 400 status code and an error message
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, 'Username can only contain letters and numbers')
      );
    }
  }

  try {
    // Find the user by ID and update the user details
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true } // Return the updated document
      
    );

    // Destructure the password out of the updated user object to exclude it from the response
    const { password, token, ...rest } = updatedUser._doc;

    // Send a response with the updated user details (excluding password)
    res.status(200).json({...rest, token});
  } catch (error) {
    // If an error occurs, pass the error to the next middleware
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  
  
  if ( !req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this user'));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json('User has been deleted');
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res
      .status(200)
      .json('User has been signed out');
  } catch (error) {
    next(error);
  }
};


export const getUsers = async (req, res, next) => {
  
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to see all users'));
  }
  try {
    // const startIndex = parseInt(req.query.startIndex) || 0;
    // const limit = parseInt(req.query.limit) || 9;
    // const sortDirection = req.query.sort === 'asc' ? 1 : -1;

    const users = await User.find()
    

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};