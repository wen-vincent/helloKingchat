import image from '@ohos.multimedia.image'
export const add: (a: number, b: number) => number;

export const createFromReceiver: (a: image.ImageReceiver) => image.Image;

export const pcClientInit: (server: String, port: Number) => Number;

export const pcClientConnectServer: () => Number;

export const pcClientConnectPeer: (a: String, b: String) => Number;

export const pcClientGetPeerName: (peerid: Number) => string;

export const pcClientGetPeers: () => Number;

export const pcClientDisConnectServer: () => Number;

export const pcClientDisConnectPeer: () => Number;

export const pcClientServerIsConnect: () => Boolean;

export const pcClientPeerIsConnect: () => Boolean;

export const getMediasoupDevice: (a: String) => string;

export const getSctpCapabilities:() => string;

export const initMediasoup: (cb: (a: string) => Promise<string>) => Number;

export const connectMediastream: (a: String) => Number;

export const initCameraAndCreatTrack: (a: string, b: string) => Number;

export const getVersion: (a: string, b: string) => Number;

export const createConsume: (a: string) => void;

export const startThread: (a:string) => Number;

export const close: () => void;