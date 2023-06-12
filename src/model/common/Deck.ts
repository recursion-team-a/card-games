import Card from './Card'

export default class Deck {
  gameType: string

  protected cards: Card[]

  constructor(gameType: string) {
    // ゲームの種類
    this.gameType = gameType
    // カードの配列
    this.cards = []
    // デッキの生成
    this.generateDeck()
  }

  generateDeck(): void {
    // if(this.gameType == ??)等でゲームの種類に応じて変更可能
    // 現時点では, どのゲームも52枚で<List>cardsを生成
    const suits = ['♥︎', '♦', '♣', '♠']
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

    for (let i = 0; i < suits.length; i += 1) {
      for (let j = 0; j < ranks.length; j += 1) {
        this.cards.push(new Card(suits[i], ranks[i]))
      }
    }
  }

  /*
        return null : デッキの状態を更新（ランダムに順番を入れ替える）
     */
  shuffle(): void {
    for (let i = this.cards.length - 1; i >= 0; i -= 1) {
      const randomIndex = Math.floor(Math.random() * (i + 1))
      const temp = this.cards[i]
      this.cards[i] = this.cards[randomIndex]
      this.cards[randomIndex] = temp
    }
  }

  /*
        return Card: ポップされたカードを返す.
     */
  drawOne(): Card | undefined {
    return this.cards.pop()
  }

  /*
        return null: デッキをリセットする.
     */
  resetDeck(): void {
    this.cards = []
    this.generateDeck()
    this.shuffle()
  }
}
