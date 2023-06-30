import Phaser from 'phaser'
import Card from '@/Phaser/common/CardImage'

export default class Deck {
  private cards: Card[]

  constructor(scene: Phaser.Scene, x: number, y: number, gameType?: string, playerType?: string) {
    // カードの配列
    this.cards = []
    // デッキの生成
    this.generateDeck(scene, x, y, gameType, playerType)
    this.shuffle()
  }

  public generateDeck(
    scene: Phaser.Scene,
    x: number,
    y: number,
    gameType?: string,
    playerType?: string,
  ): void {
    const suits = ['♥︎', '♦', '♣', '♠']
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

    if (gameType === 'speed') {
      if (playerType === 'house') {
        for (let i = 0; i < suits.length - 2; i += 1) {
          for (let j = 0; j < ranks.length; j += 1) {
            this.cards.push(new Card(scene, x, y, suits[i], ranks[j], true))
          }
        }
      } else {
        for (let i = 2; i < suits.length; i += 1) {
          for (let j = 0; j < ranks.length; j += 1) {
            this.cards.push(new Card(scene, x, y, suits[i], ranks[j], true))
          }
        }
      }
    } else {
      for (let i = 0; i < suits.length; i += 1) {
        for (let j = 0; j < ranks.length; j += 1) {
          this.cards.push(new Card(scene, x, y, suits[i], ranks[j], true))
        }
      }
    }
  }

  /*
        return null : デッキの状態を更新（ランダムに順番を入れ替える）
     */
  public shuffle(): void {
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
  public drawOne(): Card | undefined {
    return this.cards.pop()
  }

  public getDeckSize(): number {
    return this.cards.length
  }
}
