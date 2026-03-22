/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IpcMainInvokeEvent } from 'electron';
import type { api } from '@/preload/preload';

type Word = Lowercase<string>;

export type KebabCase =
    | `${Word}-${Word}`
    | `${Word}-${Word}-${Word}`
    | `${Word}-${Word}-${Word}-${Word}`
    | `${Word}-${Word}-${Word}-${Word}-${Word}`;

export type IpcChannel<Namespace extends string> = `${Namespace}:${KebabCase}`;

export type IpcHandler = (
    event: IpcMainInvokeEvent,
    ...args: any[]
) => any | Promise<any>;

export type IpcHandlerMap<Namespace extends string> = Record<IpcChannel<Namespace>, IpcHandler>;

export type MongoViewerApi = typeof api;
