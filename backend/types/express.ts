import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { IUser, IGroup, ITask, INotification } from './models';

// Define a generic interface that allows for custom parameter types
export interface TypedRequest<T = any, P = any> extends Request {
  body: T;
  params: P & ParamsDictionary;
}

export interface UserRequest extends TypedRequest {
  user?: IUser;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  success?: boolean;
}

export type ControllerFunction = (req: Request, res: Response) => Promise<any>;