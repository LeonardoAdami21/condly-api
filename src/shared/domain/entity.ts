import { randomUUID } from 'node:crypto';

export abstract class Entity<Props> {
  readonly id: string;
  protected props: Props;

  protected constructor(props: Props, id?: string) {
    this.id = id ?? randomUUID();
    this.props = props;
  }

  equals(other?: Entity<unknown>): boolean {
    return other instanceof Entity && other.id === this.id;
  }
}
