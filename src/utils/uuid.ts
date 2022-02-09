import { v4 as uuidv4, parse } from 'uuid'

export function getServerUuid (): string {
  return uuidv4()
}

export function getParsedUuid (uuid: string): any {
  return parse(uuid)
}
