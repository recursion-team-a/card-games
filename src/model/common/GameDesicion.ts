export default class GameDecision {
  action: string

  amount: number

  /*
      String action : プレイヤーのアクションの選択（ブラックジャックでは、hit、standなど）
      Number amount : プレイヤーが選択する数値。
      これはPlayer.promptPlayer()が常にreturnする、標準化されたフォーマットです。
  */
  constructor(action: string, amount: number) {
    this.action = action
    this.amount = amount
  }
}
