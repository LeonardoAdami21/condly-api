export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Dado inválido ou regra de negócio violada. */
export class ValidationError extends DomainError {}

export class NotFoundError extends DomainError {}

export class ConflictError extends DomainError {}

export class ForbiddenError extends DomainError {}

export class UnauthorizedError extends DomainError {}
