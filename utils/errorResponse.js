class  ErrorResponse extends Error {
  constructor(message,statusCode){
    super(message)    // message from the extented  Error class
    this.statusCode =  statusCode
  }
}

module.exports = ErrorResponse