export default interface ObjectClassSchema {
  oid: string;
  name: string;
  desc: string | undefined;
  sup: string | string[] | undefined;
  kind: 'ABSTRACT' | 'AUXILIARY' | 'STRUCTURAL' | undefined;
  must: string[];
  may: string[];
};
