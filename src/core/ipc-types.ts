import type { AppHandlers } from "./ipc/register-ipc-handlers";

type HandlerMap = AppHandlers;

export type IpcInvokeMap = {
    [K in keyof HandlerMap]: HandlerMap[K] extends (
        ...args: infer A
    ) => Promise<infer R>
    ? {
        args: A extends [unknown, ...infer Rest] ? Rest : A;
        return: R;
    }
    : never;
};
