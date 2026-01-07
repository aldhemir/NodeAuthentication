import { Router, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';

export const statusRoute = Router();

statusRoute.get('/status', (req: Request, res: Response) => {
  // Removido o 'next' pois não era utilizado
  // StatusCodes.OK é a forma mais atualizada dessa lib
  res.sendStatus(StatusCodes.OK);
});