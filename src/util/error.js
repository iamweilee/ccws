class MethodNotImplementError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class LogError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}


module.exports = {
  MethodNotImplementError,
  LogError
};