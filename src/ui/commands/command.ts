export interface Command {
  commandId: string;
  perform(...args: unknown[]): unknown;
}
