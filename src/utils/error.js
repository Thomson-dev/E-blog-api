

export const errorHandler = (statusCode, message) => {
    // Create a new Error object
    const error = new Error();
    
    // Set a custom statusCode property on the error object
    error.statusCode = statusCode;
    
    // Set the message property of the error object
    error.message = message;
    
    // Return the customized error object
    return error;
  };