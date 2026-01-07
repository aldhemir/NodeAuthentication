import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import ForbiddenError from "../model/errors/forbidden.error.model";
import userRepository from "../repositories/user.repository";

export async function basicAuthenticationMiddleware(
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

    if (authenticationType !== "Basic" || !token) {
      throw new ForbiddenError("Tipo de autenticação inválido");
    }

    const tokenContent = Buffer.from(token, "base64").toString("utf-8");
    const [username, password] = tokenContent.split(":");

    if (!username || !password) {
      throw new ForbiddenError("Credenciais não preenchidas");
    }

    const user = await userRepository.findByUsername(username);

    // CORREÇÃO: Adicionei !user.password na verificação
    // Isso garante ao TypeScript que, se passar daqui, a senha existe.
    if (!user || !user.password) {
      throw new ForbiddenError("Usuário ou senha inválidos!");
    }

    // Agora o user.password é garantido como string
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ForbiddenError("Usuário ou senha inválidos!");
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}