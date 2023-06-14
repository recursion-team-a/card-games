export default class GameDecision {
  private p_action: string

  private p_amount: number

  /*
      String action : プレイヤーのアクションの選択（ブラックジャックでは、hit、standなど）
      Number amount : プレイヤーが選択する数値。
      これはPlayer.promptPlayer()が常にreturnする、標準化されたフォーマットです。
  */
  constructor(action: string, amount: number) {
    this.p_action = action
    this.p_amount = amount
  }

  get action(): string {
    return this.p_action
  }

  set action(action: string) {
    this.p_action = action
  }

  get amount(): number {
    return this.p_amount
  }

  set amount(amount: number) {
    this.p_amount = amount
  }
}
