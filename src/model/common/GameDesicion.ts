export default class GameDecision {
  private _action: string

  private _amount: number

  /*
      String action : プレイヤーのアクションの選択（ブラックジャックでは、hit、standなど）
      Number amount : プレイヤーが選択する数値。
      これはPlayer.promptPlayer()が常にreturnする、標準化されたフォーマットです。
  */
  constructor(action: string, amount: number) {
    this._action = action
    this._amount = amount
  }

  get action(): string {
    return this._action
  }

  set action(action: string) {
    this._action = action
  }

  get amount(): number {
    return this._amount
  }

  set amount(amount: number) {
    this._amount = amount
  }
}
