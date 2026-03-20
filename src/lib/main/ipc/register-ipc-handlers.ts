import { registerDialogIpcHandlers } from './dialog-ipc-handlers';
import { registerMongoIpcHandlers } from './mongo-ipc-handlers';

export function registerIpcHandlers() {
    registerMongoIpcHandlers();
    registerDialogIpcHandlers();
}
