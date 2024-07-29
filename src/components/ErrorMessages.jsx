import React from "react";
import PropTypes from "prop-types";

const ErrorMessages = ({ message }) =>
  message ? (
    <div className="error-message p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
      <strong>Error:</strong> {message}
    </div>
  ) : null;

ErrorMessages.propTypes = {
  message: PropTypes.string
};

export default ErrorMessages;
