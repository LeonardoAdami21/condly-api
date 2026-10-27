export const PortariaEventStatus = {
  PENDENTE: 'PENDENTE',
  AUTORIZADO: 'AUTORIZADO',
  NEGADO: 'NEGADO',
  FINALIZADO: 'FINALIZADO',
} as const;

export type PortariaEventStatus =
  (typeof PortariaEventStatus)[keyof typeof PortariaEventStatus];

/** Decisões que o morador pode tomar sobre um evento pendente. */
export const ResidentDecision = {
  AUTORIZADO: PortariaEventStatus.AUTORIZADO,
  NEGADO: PortariaEventStatus.NEGADO,
} as const;

export type ResidentDecision =
  (typeof ResidentDecision)[keyof typeof ResidentDecision];
