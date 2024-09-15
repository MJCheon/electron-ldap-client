import { IpcMainEvent } from 'electron';
import Store from 'electron-store';
import ServerInfo from '../../types/ServerInfo';
import { getParsedUuid, getServerUuid } from '../utils/uuid';
import { decrypt, encrypt, getIv } from '../utils/password';

const store = new Store();

export async function getAllServer(
  event: IpcMainEvent,
  key: string,
): Promise<void> {
  const servers: ServerInfo[] | any = store.get(key);
  servers.map((server: ServerInfo) => {
    server.password = decrypt(
      server.password,
      getParsedUuid(server.id),
      Buffer.from(server.iv),
    );

    return server;
  });
  event.returnValue = servers;
}

export async function getServer(
  event: IpcMainEvent,
  key: string,
  id: string,
): Promise<void> {
  const servers: ServerInfo[] | any = store.get(key);
  const foundServer: ServerInfo = servers.find(
    (server: ServerInfo) => server.id === id,
  );

  event.returnValue = foundServer;
}

export async function setServer(
  event: IpcMainEvent,
  key: string,
  server: ServerInfo,
) {
  const servers: ServerInfo[] | any = store.get(key);
  const id = getServerUuid();
  const iv = getIv();

  // 신규 추가
  if (servers === undefined) {
    server.id = id;
    server.iv = iv;
    server.password = encrypt(
      server.password,
      getParsedUuid(id),
      Buffer.from(iv),
    );
    store.set(key, [server]);
  } else if (servers.length >= 0) {
    const index = servers.findIndex(
      (originServer: ServerInfo) => originServer.id === server.id,
    );

    if (index > -1) {
      // 수정
      server.password = encrypt(
        server.password,
        getParsedUuid(server.id),
        Buffer.from(server.iv),
      );
      servers[index] = server;
    } else {
      // 추가
      server.id = id;
      server.iv = iv;
      server.password = encrypt(
        server.password,
        getParsedUuid(server.id),
        Buffer.from(server.iv),
      );
      servers.push(server);
    }
    // 저장
    store.set(key, servers);
  }
}

export async function delServer(
  event: IpcMainEvent,
  key: string,
  name: string,
) {
  const servers: ServerInfo[] | any = store.get(key);
  const newServers = servers.filter(
    (server: ServerInfo) => server.name !== name,
  );
  store.set(key, newServers);
}
