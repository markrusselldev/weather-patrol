// src/utils/errorHandler.js
const errorHandler = error => {
  let message = "An unknown error occurred";
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    message = `Error: ${error.response.status} - ${error.response.data.error || error.response.statusText}`;
  } else if (error.request) {
    // The request was made but no response was received
    message = "Error: No response received from server";
  } else {
    // Something happened in setting up the request that triggered an Error
    message = `Error: ${error.message}`;
  }
  return message;
};

export default errorHandler;
