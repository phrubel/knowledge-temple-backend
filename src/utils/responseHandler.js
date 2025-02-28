class APIError extends Error {
  constructor(statusCode, message, stack = null, data = {}) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.stack = stack; // Capture the stack trace
    this.data = data || {};
  }

  toJson() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      ...(this.stack && { stack: this.stack }), // Include stack trace if available
      data: this.data,
    };
  }
}

class APISuccess {
  constructor(statusCode, message, data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data || {};
  }
}

module.exports = { APIError, APISuccess };
