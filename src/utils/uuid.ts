import { v4 as uuidv4, stringify as uuidStringify, parse } from "uuid";

export function getServerUuid() : string {
  return uuidv4();
}

export function getParsedUuid(uuid : string) : string {
  return uuidStringify(parse(uuid));
}