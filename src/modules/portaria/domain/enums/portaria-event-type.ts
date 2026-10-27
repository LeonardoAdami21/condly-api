export const PortariaEventType = {
  VISITANTE: 'VISITANTE',
  ENCOMENDA: 'ENCOMENDA',
  PRESTADOR_SERVICO: 'PRESTADOR_SERVICO',
} as const;

export type PortariaEventType =
  (typeof PortariaEventType)[keyof typeof PortariaEventType];
