import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/domain/errors';
import {
  CondlyDirectoryQuery,
  CondlyDirectoryView,
} from '../queries/condly-directory.query';

@Injectable()
export class GetCondlyDirectoryUseCase {
  constructor(private readonly directory: CondlyDirectoryQuery) {}

  async execute(condlyPortariaId: string): Promise<CondlyDirectoryView> {
    const view = await this.directory.findByCondlyPortariaId(condlyPortariaId);
    if (!view) throw new NotFoundError('Condomínio não encontrado');
    return view;
  }
}
