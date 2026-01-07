import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes"; // Atualizado para usar o Enum nomeado (padrão mais novo)
import DatabaseError from "../model/errors/database.erro.model"; // Corrigi o typo 'erro' -> 'error' se necessário
import ForbiddenError from "../model/errors/forbidden.error.model";

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Erro de Banco de Dados / Regra de Negócio
  if (error instanceof DatabaseError) {
    res.status(StatusCodes.BAD_REQUEST).json({
        error: "Database Error",
        message: error.message 
    });
  } 
  // 2. Erro de Permissão / Autenticação
  else if (error instanceof ForbiddenError) {
    res.status(StatusCodes.FORBIDDEN).json({
        error: "Forbidden",
        message: error.message // Aqui o front recebe: "Credenciais não preenchidas", etc.
    });
  } 
  // 3. Erro Genérico (Crash inesperado)
  else {
    // IMPORTANTE: Logar o erro no servidor para você poder corrigir depois
    console.error("Erro Inesperado:", error);
    
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
}