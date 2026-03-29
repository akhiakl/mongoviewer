import type { IpcInvokeMap } from '@/core/ipc-types';
import { ipcRenderer } from 'electron';

export function invoke<K extends keyof IpcInvokeMap>(
    channel: K,
    ...args: IpcInvokeMap[K]['args']
): Promise<IpcInvokeMap[K]['return']> {
    return ipcRenderer.invoke(channel, ...args);
}
