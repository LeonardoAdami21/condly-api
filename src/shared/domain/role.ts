export const Role = {
  ADMIN: 'ADMIN',
  SINDICO: 'SINDICO',
  PORTEIRO: 'PORTEIRO',
  MORADOR: 'MORADOR',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
