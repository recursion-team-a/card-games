import { time } from 'console'
import GameDecision from '../common/gameDesicion'
import Player from '../common/player'

export default class BlackjackPlayer extends Player {
  /*
      ?Number userData : モデル外から渡されるパラメータ. nullになることもある.
      検討：Number houseCard : ハウスの表向きのカードのランク。
      return GameDecision : 状態を考慮した上で、プレイヤーが行った決定。

        このメソッドは、どのようなベットやアクションを取るべきかというプレイヤーの決定を取得する. プレイヤーのタイプ、ハンド、チップの状態を読み取り、GameDecisionを返します.
        パラメータにuserData使うことによって、プレイヤーが「user」の場合、このメソッドにユーザーの情報を渡すことができますし、プレイヤーが 「ai」の場合、 userDataがデフォルトとしてnullを使います.
    */
  promptPlayer(userData: number | null): GameDecision {
    let action = ''
    const hand = this.getHandScore()

    // 【要変更】AIの処理
    if (this.playerType == 'ai') {
      if (this.gameStatus == 'betting') {
        if (this.chips == 0) this.bet = 0
        else this.bet = 20
        action = 'bet'
        this.gameStatus = 'acting'
      } else if (this.gameStatus == 'acting' || this.gameStatus == 'hit') {
        if (hand > 8 || hand < 12) action = 'double'
        else if (hand > 16) action = 'stand'
        else action = 'hit'

        this.gameStatus = action
      }
    }
    // houseは17以上のときstand, それ以外はhit
    if (this.playerType == 'house') {
      if (hand >= 17) {
        action = 'stand'
        this.gameStatus = 'stand'
      } else {
        action = 'hit'
        this.gameStatus = 'hit'
      }
    }

    return new GameDecision(action, this.bet)
  }

  /*
      return Number : 手札の合計
      合計が21を超える場合、手札の各エースについて、合計が21以下になるまで10を引きます。
    */
  getHandScore(): number {
    let handScore = 0
    let numbersOfAces = 0

    for (let i = 0; i < this.hand.length; i++) {
      if (this.hand[i].rank == 'A') numbersOfAces++
      handScore += this.hand[i].getRankNumber('blackjack')
    }

    // 21を超える場合は21以下になるまで, Aを1としてカウント.
    if (handScore > 21) {
      while (handScore > 21 && numbersOfAces > 0) {
        handScore -= 10
        numbersOfAces--
      }
    }

    return handScore
  }
}
