import { io, type Socket } from 'socket.io-client';

const defaultUrl = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000';
const defaultToken = import.meta.env.VITE_SOCKET_TOKEN ?? 'canvia-aixo';

export interface SocketOptions {
  namespace: 'teacher' | 'student';
  url?: string;
  token?: string | null;
}

export const createSocketClient = ({ namespace, url, token }: SocketOptions): Socket => {
  const socketUrl = url ?? defaultUrl;
  const authToken = token ?? defaultToken;

  return io(socketUrl, {
    autoConnect: true,
    transports: ['websocket'],
    auth: authToken ? { token: authToken, namespace } : { namespace },
  });
};
