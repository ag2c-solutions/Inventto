export class CurrentPasswordInvalidError extends Error {
  constructor() {
    super('Senha atual incorreta.');
    this.name = 'CurrentPasswordInvalidError';
  }
}
