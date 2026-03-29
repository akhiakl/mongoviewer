import { ipcMain } from 'electron';
import { mongoHandlers } from './mongo-ipc-handlers';
import { dialogHandlers } from './dialog-ipc-handlers';
import { windowHandlers } from './window-ipc-handlers';

export const handlers = {
    ...mongoHandlers,
    ...dialogHandlers,
    ...windowHandlers,
};

export type AppHandlers = typeof handlers;

export function registerIpcHandlers() {
    for (const [channel, handler] of Object.entries(handlers)) {
        ipcMain.handle(channel, handler);
    }
}
