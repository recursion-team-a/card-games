import Text = Phaser.GameObjects.Text
import Zone = Phaser.GameObjects.Zone
import GameObject = Phaser.GameObjects.GameObject
import TimeEvent = Phaser.Time.TimerEvent
import { CARD_HEIGHT, CARD_WIDTH } from '@/Factories/cardFactory'
import BaseScene from '@/Phaser/common/BaseScene'
import Card from '@/Phaser/common/CardImage'
import Deck from '@/Phaser/common/DeckImage'
import CpuLevel from '@/model/common/cpuLevel'
import GameResult from '@/model/common/gameResult'
import SpeedPlayer from '@/model/speed/SpeedPlayer'
import { houseSpeed, DEALER_SPEED } from '@/model/speed/speedCpuConfig'
import { GUTTER_SIZE, textStyle } from '@/utility/constants'

export default class Speed extends BaseScene {
  constructor() {
    super({ key: 'Speed', active: false })
  }

  protected players: SpeedPlayer[] = []

  protected gamePhase: string | undefined

  protected playerDeck: Deck | undefined

  protected houseDeck: Deck | undefined

  protected playerDeckSizeText: Text | undefined

  protected houseDeckSizeText: Text | undefined

  protected gameZone: Zone | undefined

  protected playerHandZone: Zone | undefined

  protected houseHandZone: Zone | undefined

  protected timeEvent: TimeEvent | undefined

  protected houseTimeEvent: TimeEvent | undefined

  protected dealerTimeEvent: TimeEvent | undefined

  protected dropZones: Zone[] = []

  protected dropCardRanks: number[] = [] // 台札のカード番号, 長さ2の配列

  public create(): void {
    // betSceneに戻るためのボタン
    this.createField()

    this.gamePhase = 'betting'

    this.players = [new SpeedPlayer('A', 'player'), new SpeedPlayer('B', 'house')]

    this.setUpNewGame()

    this.createHandZone()

    this.createDropZones()

    this.createDragAndDropEvent()

    this.dealInitialCards()

    this.startCountDown()

    this.startHousePlay(7000)

    this.startDealer()
  }

  public update(): void {
    let result: GameResult | undefined

    if (this.gamePhase === 'acting') {
      result = this.judgeGameResult()
    }

    if (this.gamePhase === 'end' && result) {
      this.time.delayedCall(2000, () => {
        this.houseTimeEvent?.remove()
        this.dealerTimeEvent?.remove()
        this.endHand(result as GameResult)
      })
    }
  }

  public createHandZone() {
    Phaser.Display.Align.To.TopCenter(
      this.playerHandZone as Zone,
      this.playerDeckSizeText as Text,
      0,
      GUTTER_SIZE,
    )

    Phaser.Display.Align.To.BottomCenter(
      this.houseHandZone as Zone,
      this.houseDeckSizeText as Text,
      0,
      GUTTER_SIZE,
    )
  }

  private createDropZones(): void {
    this.dropZones = []

    const xOffset = {
      player: CARD_WIDTH,
      house: -CARD_WIDTH,
    }

    this.players.forEach((player) => {
      const dropZone = this.add
        .zone(0, 0, CARD_WIDTH * 2, CARD_HEIGHT * 2)
        .setRectangleDropZone(CARD_WIDTH * 1.5, CARD_HEIGHT * 1.5)
      Phaser.Display.Align.In.Center(
        dropZone,
        this.gameZone as GameObject,
        xOffset[player.playerType as 'player' | 'house'],
      )
      this.dropZones.push(dropZone)
    })
  }

  private startCountDown(): void {
    this.time.delayedCall(3000, () => {
      this.createTimerText()
      this.timeEvent = this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.countDown(() => {
            this.gamePhase = 'acting'
            this.ableCardDraggable()
            if (this.timeEvent) this.timeEvent.remove()
          })
        },
        callbackScope: this,
        loop: true,
      })
    })
  }

  // ハウスのプレイを一定間隔で行うための関数（playhouseTurn()を呼び出す）
  private startHousePlay(delay: number): void {
    const level = this.registry.get('cpuLevel') ?? CpuLevel.NORMAL
    const speed = houseSpeed[level]

    this.time.delayedCall(delay, () => {
      this.houseTimeEvent = this.time.addEvent({
        delay: speed,
        callback: this.playHouseTurn,
        callbackScope: this,
        loop: true,
      })
    })
  }

  // ディーラーがカードを置く動作を定期的に行う関数
  private startDealer(): void {
    this.time.delayedCall(7000, () => {
      this.dealerTimeEvent = this.time.addEvent({
        delay: DEALER_SPEED,
        callback: this.playHouse,
        callbackScope: this,
        loop: true,
      })
    })
  }

  // 一定間隔で呼び出される関数. 出せるカードがある場合手札からカードを抜き, 台札におく
  private playHouseTurn(): void {
    const house = this.players[1]
    if (!this.isStagnant(house)) {
      this.putCardFromHand()
    }
  }

  // プレイヤー同士, 置くカードがない場合, housePlayを一時中止し, 台札にカードを置き, housePlayを再開
  private playHouse(): void {
    if (!this.isGameStopped()) return

    this.houseTimeEvent?.remove()
    this.putLeadCard()
    this.startHousePlay(2000)
  }

  // ハウスのカードを置く動作
  private putCardFromHand(): void {
    const house: SpeedPlayer = this.players[1]
    const { card, index } = this.getAvailableCard(house)

    if (!card) return
    if (index === undefined) return

    this.children.bringToTop(card)
    this.dropCardRanks[index] = card.getRankNumber('speed')
    card.playMoveTween((this.dropZones[index] as Zone).x, (this.dropZones[index] as Zone).y)
    this.handOutCard(this.houseDeck as Deck, house as SpeedPlayer, card.x, card.y, false)
  }

  // playerの手札から台札におくことが出来るカードと台札のインデックスを取得
  private getAvailableCard(player: SpeedPlayer): {
    card: Card | undefined
    index: number | undefined
  } {
    for (let i = 0; i < player.hand.length; i += 1) {
      const card = player.hand[i]
      for (let index = 0; index < this.dropCardRanks.length; index += 1) {
        if (Speed.isNextRank(card.getRankNumber('speed'), this.dropCardRanks[index])) {
          player.removeCardFromHand(card)
          return { card, index }
        }
      }
    }
    return { card: undefined, index: undefined }
  }

  // 引数プレイヤーが台札に出せるカードがあるかどうかを返す
  private isStagnant(player: SpeedPlayer): boolean {
    let canContinue = false
    player.hand.forEach((card: Card) => {
      this.dropZones.forEach((dropZone: Zone) => {
        canContinue = canContinue || this.canDropCard(card, dropZone)
      })
    })

    return !canContinue
  }

  // プレイヤーもしくはハウスが出せるカードがあるかを返す
  private isGameStopped(): boolean {
    let canContinue = true
    this.players.forEach((player) => {
      canContinue = canContinue && this.isStagnant(player)
    })
    return canContinue
  }

  // カードのドラッグとドロップを行う
  private createDragAndDropEvent(): void {
    this.createCardDragStart()
    this.createCardDragEvent()
    this.createCardDropEvent()
    this.createCardDragEnd()
  }

  // カードのドラッグをしたときに呼び出し
  private createCardDragStart(): void {
    this.input.on(
      'dragstart',
      (pointer: Phaser.Input.Pointer, card: Card) => {
        this.children.bringToTop(card) // ドラッグされているカードを他のカードの上に表示.
      },
      this,
    )
  }

  // カードをドラッグしている最中
  private createCardDragEvent(): void {
    this.input.on(
      'drag',
      (pointer: Phaser.Input.Pointer, card: Card, dragX: number, dragY: number) => {
        card.setPosition(dragX, dragY) // ドラッグした位置でカードの位置を更新
      },
      this,
    )
  }

  // カードがドロップしたときの処理. dropZoneを使って判定.
  private createCardDropEvent(): void {
    this.input.on('drop', (pointer: Phaser.Input.Pointer, card: Card, dropZone: Zone) => {
      // ドロップできない場合は元の位置にカードを戻す
      if (!this.canDropCard(card, dropZone)) {
        card.returnToOrigin()
        return
      }

      // ドロップできる場合は固定
      card.setPosition(dropZone.x, dropZone.y)
      card.disableInteractive()

      // ドロップゾーンのカードの数字を更新
      this.dropZones.forEach((dropCardZone: Zone, index: number) => {
        if (dropCardZone === dropZone) {
          this.dropCardRanks[index] = card.getRankNumber('speed')
        }
      })

      // 置いたカードを手札から抜き, 一枚配る
      this.players.forEach((player) => {
        if (player.playerType === 'player') {
          player.removeCardFromHand(card)
          this.handOutCard(
            this.playerDeck as Deck,
            player as SpeedPlayer,
            card.input?.dragStartX ?? 0,
            (this.playerHandZone as Zone).y ?? 0,
            false,
          )
        }
      })
    })
  }

  // ドラッグが終了した（マウス離した）際の処理. カードがドロップゾーンにおかれなかった場合は元の位置に戻す.
  private createCardDragEnd(): void {
    this.input.on('dragend', (pointer: Phaser.Input.Pointer, card: Card, dropped: boolean) => {
      if (!dropped) {
        card.returnToOrigin()
      }
    })
  }

  // カードがドロップ可能か判定
  private canDropCard(card: Card, dropZone: Zone): boolean {
    let canDropCard = false

    this.dropZones.forEach((cardDropZone: Zone, index: number) => {
      if (dropZone === cardDropZone) {
        canDropCard =
          canDropCard || Speed.isNextRank(this.dropCardRanks[index], card.getRankNumber('speed'))
      }
    })
    return canDropCard
  }

  // 置かれたカードの数字が隣り合うもしくは, AとKであればTrueを返す.
  private static isNextRank(num1: number, num2: number): boolean {
    const diff = Math.abs(num1 - num2)
    return diff === 1 || diff === 12
  }

  private handOutCard(
    deck: Deck,
    player: SpeedPlayer,
    x: number,
    y: number,
    faceDown: boolean,
  ): void {
    const card: Card | undefined = deck.drawOne()

    if (!card) return
    if (!faceDown) {
      card.setFaceUp()
    }
    if (player.playerType === 'player') {
      card.setDrag()
    }
    player.addHand(card)

    this.children.bringToTop(card)
    card.playMoveTween(x, y)
    this.setHouseDeckSizeText()
    this.setPlayerDeckSizeText()
  }

  private dealInitialCards() {
    this.putLeadCard()
    this.dealInitialHandCard()
  }

  // 台札にカードを補充, 山札がからの場合は手札から補充
  private putLeadCard(): void {
    this.players.forEach((player, index) => {
      let card: Card | undefined
      if (player.playerType === 'player') {
        if (this.playerDeck?.getDeckSize() === 0) {
          card = player.hand.pop()
        } else {
          card = this.playerDeck?.drawOne()
        }
      }
      if (player.playerType === 'house') {
        if (this.houseDeck?.getDeckSize() === 0) {
          card = player.hand.pop()
        } else {
          card = this.houseDeck?.drawOne()
        }
      }

      if (!card) return

      this.dropCardRanks[index] = card.getRankNumber('speed')
      this.children.bringToTop(card)
      card.playMoveTween((this.dropZones[index] as Zone).x, (this.dropZones[index] as Zone).y)

      if (card.faceDown) {
        this.time.delayedCall(1500, () => {
          card?.playFlipOverTween()
        })
      }
    })
    this.setPlayerDeckSizeText()
    this.setHouseDeckSizeText()
  }

  // それぞれの山札から4枚のカードを手札に加える
  private dealInitialHandCard(): void {
    let count = 0
    this.timeEvent = this.time.addEvent({
      delay: 200,
      callback: () => {
        const xOffset = {
          player: -2 * (CARD_WIDTH + GUTTER_SIZE) + count * (CARD_WIDTH + GUTTER_SIZE),
          house: 2 * (CARD_WIDTH + GUTTER_SIZE) - count * (CARD_WIDTH + GUTTER_SIZE),
        }

        this.players.forEach((player) => {
          const playerTempDeck =
            player.playerType === 'house' ? (this.houseDeck as Deck) : (this.playerDeck as Deck)
          const handZone =
            player.playerType === 'house'
              ? (this.houseHandZone as Zone)
              : (this.playerHandZone as Zone)
          this.handOutCard(
            playerTempDeck,
            player as SpeedPlayer,
            handZone.x + xOffset[player.playerType as 'player' | 'house'],
            handZone.y,
            true,
          )
        })
        count += 1
      },
      callbackScope: this,
      repeat: 3,
    })

    this.time.delayedCall(1500, () => {
      this.players.forEach((player) => {
        player.hand.forEach((card) => {
          card.playFlipOverTween()
        })
      })
      this.disableCardDraggable()
    })
  }

  private disableCardDraggable(): void {
    this.players.forEach((player) => {
      if (player.playerType === 'player') {
        player.hand.forEach((card) => card.disableInteractive())
      }
    })
  }

  private ableCardDraggable(): void {
    this.players.forEach((player) => {
      if (player.playerType === 'player') {
        player.hand.forEach((card) => card.setInteractive())
      }
    })
  }

  private setUpNewGame() {
    this.playerHandZone = this.add.zone(0, 0, CARD_WIDTH * 5 + GUTTER_SIZE * 4, CARD_HEIGHT)

    this.houseHandZone = this.add.zone(0, 0, CARD_WIDTH * 5 + GUTTER_SIZE * 4, CARD_HEIGHT)

    // dealerとplayersを使うために呼び出した
    this.playerDeck = new Deck(
      this,
      (this.playerHandZone as Zone).x + CARD_WIDTH * 6,
      (this.playerHandZone as Zone).y + CARD_HEIGHT * 3 + GUTTER_SIZE * 1.4,
      'speed',
      'player',
    )
    this.houseDeck = new Deck(
      this,
      (this.houseHandZone as Zone).x + CARD_WIDTH + GUTTER_SIZE * 2.5,
      (this.houseHandZone as Zone).y + CARD_HEIGHT - GUTTER_SIZE,
      'speed',
      'house',
    )
    this.setUpHouseDeckSizeText()
    this.setUpPlayerDeckSizeText()
  }

  private setUpHouseDeckSizeText(): void {
    this.houseDeckSizeText = this.add.text(0, 200, '', textStyle)
    this.setHouseDeckSizeText()
    Phaser.Display.Align.In.TopCenter(this.houseDeckSizeText, this.gameZone as Zone, 0, -20)
  }

  private setUpPlayerDeckSizeText(): void {
    this.playerDeckSizeText = this.add.text(0, 300, '', textStyle)
    this.setPlayerDeckSizeText()
    Phaser.Display.Align.In.BottomCenter(this.playerDeckSizeText, this.gameZone as Zone, 0, -20)
  }

  private setHouseDeckSizeText() {
    ;(this.houseDeckSizeText as Text).setText(`House cards : ${this.houseDeck?.getDeckSize()}`)
  }

  private setPlayerDeckSizeText() {
    ;(this.playerDeckSizeText as Text).setText(`Your Cards: ${this.playerDeck?.getDeckSize()}`)
  }

  // 状況を判断し, resultを返す関数
  private judgeGameResult(): GameResult | undefined {
    let result: GameResult | undefined
    const player = this.players[0]
    const house = this.players[1]
    const playerHandScore = player.getHandScore()
    const houseHandScore = house.getHandScore()

    if (playerHandScore === 0 && houseHandScore === 0) {
      result = GameResult.TIE
      this.gamePhase = 'end'
      return result
    }

    if (playerHandScore === 0) {
      result = GameResult.WIN
      this.gamePhase = 'end'
      return result
    }

    if (houseHandScore === 0) {
      result = GameResult.LOSS
      this.gamePhase = 'end'
      return result
    }

    result = undefined
    this.gamePhase = 'acting'
    return result
  }

  // ゲーム終了時
  private endHand(result: GameResult) {
    const graphics = this.add.graphics({
      fillStyle: { color: 0x000000, alpha: 0.75 },
    })
    const { width, height } = this.sys.game.canvas
    const square = Phaser.Geom.Rectangle.FromXY(0, 0, width, height)
    graphics.fillRectShape(square)
    const resultText: Text = this.add.text(0, 0, `${result}`, textStyle)
    resultText.setColor('#ffde3d')
    Phaser.Display.Align.In.Center(resultText, this.gameZone as Zone)
    this.input.once(
      'pointerdown',
      () => {
        this.input.once(
          'pointerdown',
          () => {
            this.scene.start('ContinueScene', { nextScene: 'CpuLevelScene' })
          },
          this,
        )
      },
      this,
    )
  }
}
