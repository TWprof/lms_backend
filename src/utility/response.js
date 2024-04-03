function buildFailureResponse(message, statusCode) {
  return {
    message,
    statusCode,
    success: false,
  };
}

function buildSuccessResponse(message, statusCode, data) {
  if (data) {
    return {
      message,
      statusCode,
      success: true,
      data,
    };
  }
  return {
    message,
    statusCode,
    success: true,
  };
}

module.exports = { buildFailureResponse, buildSuccessResponse };
