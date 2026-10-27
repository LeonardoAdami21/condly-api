export interface CondlyDirectoryView {
  id: string;
  name: string;
  apartments: {
    id: string;
    block: string;
    number: string;
    residents: { id: string; name: string; phone: string | null }[];
  }[];
}

/** Modelo de leitura usado pela portaria Condly para sincronizar moradores. */
export abstract class CondlyDirectoryQuery {
  abstract findByCondlyPortariaId(
    condlyPortariaId: string,
  ): Promise<CondlyDirectoryView | null>;
}
