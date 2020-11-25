import { IpcMain, IpcMainEvent, IpcRenderer, IpcRendererEvent } from "electron";

type IpcEvents = { [key: string]: any };

type IpcMainTyped<E extends IpcEvents> = {
  on<T extends Extract<keyof E, string>>(
    event: T,
    callback: (event: IpcMainEvent, arg: E[T]) => void
  ): void;

  once<T extends Extract<keyof E, string>>(
    event: T,
    callback: (event: IpcMainEvent, arg: E[T]) => void
  ): void;

  removeAllListeners: IpcMain["removeAllListeners"];
};

export function createTypedIpcMain<E extends IpcEvents>(
  ipcMain: IpcMain
): IpcMainTyped<E> {
  return ipcMain;
}

type IpcRendererTyped<E extends IpcEvents> = {
  on<T extends Extract<keyof E, string>>(
    event: T,
    callback: (event: IpcRendererEvent, arg: E[T]) => void
  ): void;

  once<T extends Extract<keyof E, string>>(
    event: T,
    callback: (event: IpcRendererEvent, arg: E[T]) => void
  ): void;

  send<T extends Extract<keyof E, string>>(event: T, arg: E[T]): void;

  removeAllListeners: IpcRenderer["removeAllListeners"];
};

export function createTypedIpcRenderer<E extends IpcEvents>(
  ipcRenderer: IpcRenderer
): IpcRendererTyped<E> {
  return ipcRenderer;
}
