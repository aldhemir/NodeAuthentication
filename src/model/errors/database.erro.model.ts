class DatabaseError extends Error {
  public status: number;

  constructor(
    public message: string,
    public error?: unknown // Melhor que 'any' para segurança
  ) {
    super(message);
    
    this.status = 500; // Erro de banco = Erro interno do servidor
    this.name = 'DatabaseError'; // Facilita identificar o erro nos logs

    // Correção para o 'instanceof' funcionar corretamente em TypeScript/JS antigo
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export default DatabaseError;