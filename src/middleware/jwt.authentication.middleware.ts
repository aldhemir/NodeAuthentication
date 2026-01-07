import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import ForbiddenError from "../model/errors/forbidden.error.model";

// Define o formato esperado dentro do token
interface TokenPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
}

export async function JwtAuthenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authorizationHeader = req.headers["authorization"];

    if (!authorizationHeader) {
      throw new ForbiddenError("Credenciais não informadas");
    }

    const [authenticationType, token] = authorizationHeader.split(" ");

    if (authenticationType !== "Bearer" || !token) {
      throw new ForbiddenError("Tipo de autenticação inválido");
    }

    try {
      // ATUALIZAÇÃO 1: Pegar segredo do .env e Forçar algoritmo
      // Nunca deixe chaves 'hardcoded'. Se a variável não existir, usa uma string vazia (que falhará, o que é seguro)
      const secretKey = process.env.JWT_SECRET || ""; 
      
      const tokenPayload = jwt.verify(token, secretKey, {
        algorithms: ['HS256'] // Trava o algoritmo para evitar bypass
      }) as TokenPayload; // Tipagem aplicada aqui

      // ATUALIZAÇÃO 2: Verificação mais robusta
      if (!tokenPayload.sub) {
        throw new ForbiddenError("Token inválido: Usuário não identificado");
      }

      const user = {
        uuid: tokenPayload.sub,
        username: tokenPayload.username,
      };

      req.user = user;
      next();
    } catch (error) {
      // Dica: Em dev, você pode querer dar console.error(error) para saber se o token expirou ou se é inválido
      throw new ForbiddenError("Token Inválido ou Expirado");
    }
  } catch (error) {
    next(error);
  }
}