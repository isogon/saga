export default class SagaResult {
  saga: Saga
  args: Array<mixed>
  status: Status
  outcome: Outcome
  data: mixed

  constructor(
    saga: Saga,
    args: Array<mixed>,
    status: Status,
    data: Array<TransactionResult>
  ) {
    this.outcome = Outcomes.COMPLETED;
    this.saga = saga;
    this.args = args;
    this.status = status;
    this.data = data;
  }

  compensate(error: any) {

  }
}
