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
    message = `For Demo on Render.com: CLICK REFRESH IF YOU SEE THIS - "free instance will spin down with inactivity..." -Render.com.`;
    // Orignial error message: Request Failed: ${error.message}
  }
  return message;
};

export default errorHandler;
