export interface State<Value> {}

export namespace State {
  //#region Interfaces

  export interface AsState {
    asState<Value>(state: State<Value>): StateLike<Value> | undefined;
  }

  export interface StateLike<Value> {
    discriminate(key: any): any;
  }

  //#endregion
}

export namespace AsState {
  export interface Read {
    asState<Value>(state: unknown): ReadResult<Value>;

    fromField<Value>(state: State<Value> | undefined): unknown;
  }

  export type ReadResult<Value> = InternalStateRead<Value>;

  export interface ReadWrite {
    asState<Value>(state: unknown): ReadWriteResult<Value>;

    fromField<Value>(state: State<Value>): unknown;
  }

  export type ReadWriteResult<Value> =
    | InternalStateReadWrite<Value>
    | undefined;

  export interface InternalStateRead<Value> {
    get(): Value;
  }

  export interface InternalStateReadWrite<Value>
    extends InternalStateRead<Value> {}
}
