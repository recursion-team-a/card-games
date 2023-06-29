import Card from './Card'

export default class Deck {
  private cards: Card[]

  constructor(gameType?: string, playerType?: string) {
    // カードの配列
    this.cards = []
    // デッキの生成
    this.generateDeck(gameType, playerType)
    this.shuffle()
  }

  generateDeck(gameType?: string, playerType?: string): void {
    const suits = ['♥︎', '♦', '♣', '♠']
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

    if (gameType === 'speed') {
      if (playerType === 'house') {
        for (let i = 0; i < suits.length - 2; i += 1) {
          for (let j = 0; j < ranks.length; j += 1) {
            this.cards.push(new Card(suits[i], ranks[j]))
          }
        }
      } else {
        for (let i = 2; i < suits.length; i += 1) {
          for (let j = 0; j < ranks.length; j += 1) {
            this.cards.push(new Card(suits[i], ranks[j]))
          }
        }
      }
    } else {
      for (let i = 0; i < suits.length; i += 1) {
        for (let j = 0; j < ranks.length; j += 1) {
          this.cards.push(new Card(suits[i], ranks[j]))
        }
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

  getDeckSize(): number {
    return this.cards.length
  }
}
