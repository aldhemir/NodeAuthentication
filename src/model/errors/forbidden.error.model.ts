export default class ForbiddenError extends Error {
  public readonly status: number = 403; // Define o status HTTP padrão

  constructor(
    public message: string,
    public error?: any
  ) {
    super(message);
    
    // Define o nome do erro para facilitar logs e debugging
    this.name = 'ForbiddenError'; 
    
    // Correção para TypeScript (necessária se o target for ES5/ES6)
    // Garante que 'instanceof ForbiddenError' funcione corretamente
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}