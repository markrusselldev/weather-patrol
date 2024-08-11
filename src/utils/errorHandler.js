// src/utils/errorHandler.js
const errorHandler = error => {
  let message = "An unknown error occurred";
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    message = `${error.response.status} - ${error.response.data.error || error.response.statusText}`;
  } else if (error.request) {
    // The request was made but no response was received
    message = "No response received from server";
  } else {
    // Something happened in setting up the request that triggered an Error
    message = `Demo on Render.com: (IF YOU SEE THIS MESSAGE, CLICK REFRESH ) - "free instance will spin down with inactivity..." -Render.com.`;
    // Orignial error message: Request Failed: ${error.message}
  }
  return message;
};

export default errorHandler;
