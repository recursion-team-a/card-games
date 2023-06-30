import Phaser from 'phaser'
import { CARD_ATLAS_KEY } from '@/Factories/cardFactory'

export default class Card extends Phaser.GameObjects.Image {
  readonly p_suit: string

  readonly p_rank: string

  // カードが表か裏か
  private p_faceDown: boolean

  public originalPositionX: number | undefined

  public originalPositionY: number | undefined

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    suit: string,
    rank: string,
    faceDown: boolean,
  ) {
    super(scene, x, y, 'cardBack')
    scene.add.existing(this)
    this.p_suit = suit
    this.p_rank = rank
    this.p_faceDown = faceDown

    if (!faceDown) {
      this.setFaceUp()
    }

    this.setInteractive()
  }

  get suit(): string {
    return this.p_suit
  }

  public getFaceDown(): boolean {
    return this.faceDown
  }

  public setFaceDown(faceDown: boolean) {
    this.p_faceDown = faceDown
  }

  get rank(): string {
    return this.p_rank
  }

  get faceDown(): boolean {
    return this.p_faceDown
  }

  // XMLの中のトランプの名前
  public getAtlasFrame(): string {
    return `card${this.p_suit}${this.p_rank}.png`
  }

  public setFaceUp(): void {
    this.p_faceDown = false
    this.setTexture(CARD_ATLAS_KEY)
    this.setFrame(this.getAtlasFrame())
  }

  enableClick(): void {
    this.on('pointerdown', this.onClick, this)
    this.setOriginalPosition()
  }

  disableClick(): void {
    this.off('pointerdown', this.onClick, this)
  }

  private onClick(): void {
    if (this.y === this.originalPositionY) {
      this.y -= 20
    } else {
      this.y = this.originalPositionY as number
    }
  }

  playMoveTween(toX: number, toY: number): void {
    this.scene.tweens.add({
      targets: this,
      x: toX,
      y: toY,
      duration: 500,
      ease: 'Linear',
    })
  }

  // ドラッグ可能な状態にする
  public setDrag(): void {
    this.setInteractive()
    this.scene.input.setDraggable(this)
  }

  // カードをもとの位置に戻す.
  public returnToOrigin(): void {
    this.setPosition(this.input?.dragStartX, this.input?.dragStartY)
  }

  playFlipOverTween(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 350,
      ease: 'Linear',
      onComplete: () => {
        // アニメーション完了後に実行するコールバック関数を追加
        this.setFaceUp()
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          duration: 350,
          delay: 350,
          ease: 'Linear',
        })
      },
    })
  }

  isMoveUp(): boolean {
    return this.y !== this.originalPositionY
  }

  setOriginalPosition(): void {
    this.originalPositionX = this.x
    this.originalPositionY = this.y
  }

  // カードのゲームごとの強さを整数で返す
  getRankNumber(gameType: string): number {
    let rankToNumber
    switch (gameType) {
      case 'blackjack':
        rankToNumber = {
          A: 11,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': 6,
          '7': 7,
          '8': 8,
          '9': 9,
          '10': 10,
          J: 10,
          Q: 10,
          K: 10,
        }
        break
      case 'war':
        rankToNumber = {
          A: 14,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': 6,
          '7': 7,
          '8': 8,
          '9': 9,
          '10': 10,
          J: 11,
          Q: 12,
          K: 13,
        }
        break
      case 'poker':
        rankToNumber = {
          A: 0,
          '2': 1,
          '3': 2,
          '4': 3,
          '5': 4,
          '6': 5,
          '7': 6,
          '8': 7,
          '9': 8,
          '10': 9,
          J: 10,
          Q: 11,
          K: 12,
        }
        break
      default:
        rankToNumber = {
          A: 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': 6,
          '7': 7,
          '8': 8,
          '9': 9,
          '10': 10,
          J: 11,
          Q: 12,
          K: 13,
        }
        break
    }
    return rankToNumber[this.p_rank] ?? 0 // if runktoNumber[this.rank] is undefined, the function returns 0
  }
}
