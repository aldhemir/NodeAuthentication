import { Router, Request, Response, NextFunction } from "express";
import statusCodes from "http-status-codes";
import bcrypt from "bcrypt"; // Necessário para criar o hash

import userRepository from "../repositories/user.repository";

export const usersRoute = Router();

// Configuração do custo do hash (Salt Rounds)
const SALT_ROUNDS = 10;

usersRoute.get(
  "/users",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userRepository.findAllUsers();
      
      // SEGURANÇA: Remover a senha do objeto de retorno antes de enviar
      const usersWithoutPassword = users.map(user => {
        const { password, ...userSafe } = user; // Supondo que o objeto user tenha a prop password
        return userSafe;
      });

      res.status(statusCodes.OK).send(usersWithoutPassword);
    } catch (error) {
      next(error);
    }
  }
);

usersRoute.get(
  "/users/:uuid",
  async (req: Request<{ uuid: string }>, res: Response, next: NextFunction) => {
    try {
      const uuid = req.params.uuid;
      const user = await userRepository.findById(uuid);

      if (!user) {
        res.sendStatus(statusCodes.NOT_FOUND);
        return; // Retorna void explicitamente para satisfazer o TS
      }

      // SEGURANÇA: Nunca retorne a senha, mesmo que seja o hash
      const { password, ...userSafe } = user;

      res.status(statusCodes.OK).send(userSafe);
    } catch (error) {
      next(error);
    }
  }
);

usersRoute.post(
  "/users",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUser = req.body;

      // ATUALIZAÇÃO CRÍTICA: Criptografar a senha antes de salvar
      if (newUser.password) {
        newUser.password = await bcrypt.hash(newUser.password, SALT_ROUNDS);
      }

      const uuid = await userRepository.create(newUser);

      res.status(statusCodes.CREATED).send(uuid);
    } catch (error) {
      next(error);
    }
  }
);

usersRoute.put(
  "/users/:uuid",
  async (req: Request<{ uuid: string }>, res: Response, next: NextFunction) => {
    try {
      const uuid = req.params.uuid;
      const modifiedUser = req.body;

      modifiedUser.uuid = uuid;

      // ATUALIZAÇÃO: Se o usuário estiver atualizando a senha, precisamos hashear novamente
      if (modifiedUser.password) {
        modifiedUser.password = await bcrypt.hash(modifiedUser.password, SALT_ROUNDS);
      }

      await userRepository.update(modifiedUser);

      res.status(statusCodes.OK).send();
    } catch (error) {
      next(error);
    }
  }
);

usersRoute.delete(
  "/users/:uuid",
  async (req: Request<{ uuid: string }>, res: Response, next: NextFunction) => {
    try {
      const uuid = req.params.uuid;
      await userRepository.remove(uuid);
      res.sendStatus(statusCodes.OK);
    } catch (error) {
      next(error);
    }
  }
);