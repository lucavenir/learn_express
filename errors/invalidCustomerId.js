class InvalidCustomerId extends Error {
  constructor(customerId) {
    const message = `Invalid customer id: ${customerId}`;
    super(message);
    this.statusCode = 400;
  }
}

export default InvalidCustomerId;