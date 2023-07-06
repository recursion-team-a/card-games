import Phaser from 'phaser'
import BitmapText = Phaser.GameObjects.BitmapText
import Zone = Phaser.GameObjects.Zone
import { CARD_HEIGHT, CARD_WIDTH } from '@/Factories/cardFactory'
import BaseScene from '@/Phaser/common/BaseScene'
import Card from '@/Phaser/common/CardImage'
import Deck from '@/Phaser/common/DeckImage'
import Button from '@/Phaser/common/button'
import Pot from '@/Phaser/poker/Pot'
import GameResult from '@/model/common/gameResult'
import GameStatus from '@/model/common/gameStatus'
import { Result } from '@/model/common/types/game'
import {
  HAND_RANK_MAP,
  RANK_CHOICES_TEXAS,
  STRONG_HAND_RANK,
  MINIMUM_HAND_RANK,
} from '@/model/poker/handRank'
import PlayerAction from '@/model/poker/playAction'
import TexasHoldemPlayer from '@/model/texasHoldem/TexasHoldemPlayer'
import { GUTTER_SIZE } from '@/utility/constants'

const ANTE_AMOUNT = 20

export default class TexasHoldem extends BaseScene {
  public communityCards: Array<Card> = []

  public playerHandZones: Array<Zone> = []

  public playerNameTexts: Array<BitmapText> = []

  public pot: Pot | undefined

  public raiseButton: Button | undefined

  public callButton: Button | undefined

  public foldButton: Button | undefined

  public checkButton: Button | undefined

  public changeHandButton: Button | undefined // 必要ない

  public player: TexasHoldemPlayer

  public playerDeck: Deck | undefined

  public playerHandZone: Zone | undefined

  public cpuHandZone: Zone | undefined

  public communityCardsZone: Zone | undefined

  public playerMoney: number = 1000

  public players: Array<TexasHoldemPlayer> = [
    new TexasHoldemPlayer('PLAYER', 'player', GameStatus.FIRST_BETTING),
    new TexasHoldemPlayer('CPU', 'cpu', GameStatus.FIRST_BETTING),
  ]

  public playerBet: number = 0

  public currentBetAmount: number = 0

  public cpuBettingStatus: BitmapText | undefined

  public width: number = 1024

  public height: number = 768

  constructor() {
    super({ key: 'TexasHoldem', active: false })
    this.player = this.players[0] as TexasHoldemPlayer
  }

  public create(): void {
    super.createField()
    this.createPot()
    this.setUpNewGame()
    this.setUpMoneyText()
    this.createPlayerNameTexts()
    this.createPlayerHandZones(CARD_WIDTH, CARD_HEIGHT)
    this.createCommunityCardsZone(CARD_WIDTH, CARD_HEIGHT)
    this.dealInitialCards()
    this.time.delayedCall(2000, () => {
      this.PlayAnte()
      this.createActionPanel()
    })
  }

  public setUpNewGame() {
    this.playerDeck = new Deck(this, this.width / 2, -140, 'texasHoldem')
  }

  public createActionPanel(): void {
    this.createRaiseButton()

    if (this.currentBetAmount === 0) {
      this.createCheckButton()
    } else this.createCallButton()

    this.createFoldButton()
  }

  public createFoldButton(): void {
    this.foldButton = new Button(this, this.width * 0.92, this.height * 0.9, 'rectangle', 'FOLD')

    this.foldButton.setClickHandler(() => {
      this.player.gameStatus = PlayerAction.FOLD
      this.noContest(GameResult.LOSS)
    })
  }

  public createCallButton(): void {
    this.callButton = new Button(this, this.width * 0.85, this.height * 0.8, 'chipBlue', 'CALL')

    this.callButton.setClickHandler(() => {
      if (this.playerMoney < this.currentBetAmount) {
        this.playerBet += this.playerMoney
        this.playerMoney = 0
      } else {
        this.playerBet += this.currentBetAmount - this.playerBet
        this.playerMoney -= this.playerBet
      }

      // TODO: チップアニメーション追加
      this.time.delayedCall(500, () => {
        this.updateMText(this.playerMoney)
        this.updateBText(this.playerBet)
        this.pot?.setAmount(this.currentBetAmount)
        this.destroyActionPanel()
        if (this.player.gameStatus === GameStatus.SECOND_BETTING) {
          this.nextPlayerTurnOnSecondBettingRound(1)
        } else if (this.player.gameStatus === GameStatus.THIRD_BETTING) {
          this.nextPlayerTurnOnThirdBettingRound(1)
        } else if (this.player.gameStatus === GameStatus.FINAL_BETTING) {
          this.nextPlayerTurnOnFinalBettingRound(1)
        } else {
          this.nextPlayerTurnOnFirstBettingRound(1)
        }
        this.player.gameStatus = PlayerAction.CALL
      })
    })
  }

  public payOut(result: GameResult): Result {
    let winAmount = 0
    if (result === GameResult.WIN) {
      winAmount = this.pot?.getAmount() as number
    } else if (result === GameResult.TIE) {
      winAmount = (this.pot?.getAmount() as number) / 2
    } else if (result === GameResult.LOSS) {
      winAmount = -this.playerBet
      this.playerMoney -= this.playerBet
    }
    this.playerMoney += winAmount
    this.updateMText(this.playerMoney)
    if (this.playerMoney <= 0) {
      this.gameOver()
    }

    return {
      gameResult: result,
      winAmount,
    }
  }

  public compareAllHands(): TexasHoldemPlayer[] {
    const winPlayer: Array<TexasHoldemPlayer> = []

    const player = this.players[0]
    const house = this.players[1]
    const playerBestCards = player.findBestHand(this.communityCards)
    const houseBestCards = house.findBestHand(this.communityCards)
    const playerRank = TexasHoldemPlayer.getCardsRank(playerBestCards)
    const houseRank = TexasHoldemPlayer.getCardsRank(houseBestCards)
    if (playerRank > houseRank) {
      winPlayer.push(player)
      return winPlayer
    }
    if (houseRank > playerRank) {
      winPlayer.push(house)
      return winPlayer
    }
    // 役同じ
    let playerRanks = TexasHoldemPlayer.getRanks(playerBestCards, RANK_CHOICES_TEXAS)
    let houseRanks = TexasHoldemPlayer.getRanks(houseBestCards, RANK_CHOICES_TEXAS)

    // 1つ目のペア
    let playerPair
    let housePair
    ;[playerPair, playerRanks] = TexasHoldemPlayer.findPair(playerRanks)
    ;[housePair, houseRanks] = TexasHoldemPlayer.findPair(houseRanks)

    if (playerPair && housePair) {
      if (playerPair > housePair) {
        winPlayer.push(player)
        return winPlayer
      }
      if (playerPair < housePair) {
        winPlayer.push(house)
        return winPlayer
      }
    }

    // 2つ目のペア
    ;[playerPair, playerRanks] = TexasHoldemPlayer.findPair(playerRanks)
    ;[housePair, houseRanks] = TexasHoldemPlayer.findPair(houseRanks)

    if (playerPair && housePair) {
      if (playerPair > housePair) {
        winPlayer.push(player)
        return winPlayer
      }
      if (playerPair < housePair) {
        winPlayer.push(house)
        return winPlayer
      }
    }

    // ランクの配列を降順にソートします（ランクが高いものが先頭に来るように）
    playerRanks.sort((a, b) => b - a)
    houseRanks.sort((a, b) => b - a)

    for (let i = 0; i < playerRanks.length; i += 1) {
      if (playerRanks[i] > houseRanks[i]) {
        winPlayer.push(player)
        return winPlayer
      }
      if (playerRanks[i] < houseRanks[i]) {
        winPlayer.push(house)
        return winPlayer
      }
    }
    winPlayer.push(player)
    winPlayer.push(house)
    return winPlayer
  }

  public isFinalBettingEnd(): boolean {
    let isEnd = true
    this.players.forEach((player) => {
      if (player.gameStatus === GameStatus.FINAL_BETTING) {
        isEnd = false
        return isEnd
      }

      if (player.gameStatus === PlayerAction.CHECK) {
        if (player.bet === 0) {
          isEnd = false
        }
      }

      if (player.gameStatus === PlayerAction.CALL) {
        isEnd = player.bet === this.currentBetAmount
      }

      if (player.gameStatus === PlayerAction.RAISE) {
        if (player.bet !== 0 && player.bet === this.currentBetAmount) {
          isEnd = true
        } else {
          isEnd = false
        }
      }
      return isEnd
    })

    return isEnd
  }

  public isThirdBettingEnd(): boolean {
    let isEnd = true
    this.players.forEach((player) => {
      if (player.gameStatus === GameStatus.THIRD_BETTING) {
        isEnd = false
        return isEnd
      }

      if (player.gameStatus === PlayerAction.CHECK) {
        if (player.bet === 0) {
          isEnd = false
        }
      }

      if (player.gameStatus === PlayerAction.CALL) {
        isEnd = player.bet === this.currentBetAmount
      }

      if (player.gameStatus === PlayerAction.RAISE) {
        if (player.bet !== 0 && player.bet === this.currentBetAmount) {
          isEnd = true
        } else {
          isEnd = false
        }
      }
      return isEnd
    })

    return isEnd
  }

  public isSecondBettingEnd(): boolean {
    let isEnd = true
    this.players.forEach((player) => {
      if (player.gameStatus === GameStatus.SECOND_BETTING) {
        isEnd = false
        return isEnd
      }

      if (player.gameStatus === PlayerAction.CHECK) {
        if (player.bet === 0) {
          isEnd = false
        }
      }

      if (player.gameStatus === PlayerAction.CALL) {
        isEnd = player.bet === this.currentBetAmount
      }

      if (player.gameStatus === PlayerAction.RAISE) {
        if (player.bet !== 0 && player.bet === this.currentBetAmount) {
          isEnd = true
        } else {
          isEnd = false
        }
      }
      return isEnd
    })

    return isEnd
  }

  public isFirstBettingEnd(): boolean {
    let isEnd = true
    // eslint-disable-next-line consistent-return
    this.players.forEach((player) => {
      if (player.gameStatus === GameStatus.FIRST_BETTING) {
        isEnd = false
      }

      if (player.gameStatus === PlayerAction.CHECK) {
        if (player.bet === 0) {
          isEnd = false
        }
      }

      if (player.gameStatus === PlayerAction.CALL) {
        isEnd = player.bet === this.currentBetAmount
      }

      if (player.gameStatus === PlayerAction.RAISE) {
        if (player.bet !== 0 && player.bet === this.currentBetAmount) {
          isEnd = true
        } else {
          isEnd = false
        }
      }
    })
    return isEnd
  }

  public noContest(result: GameResult): void {
    this.destroyActionPanel()
    this.payOut(result)
    const foldTexts: BitmapText[] = []

    this.playerHandZones.forEach((handZone, index) => {
      if (this.players[index].gameStatus === PlayerAction.FOLD) {
        const foldText = this.add
          .bitmapText(handZone.x, handZone.y, 'arcade', PlayerAction.FOLD, 20)
          .setOrigin(0.5)
          .setDepth(10)

        foldTexts.push(foldText)
      }
    })

    const noContestText = this.add
      .bitmapText(this.width / 2, this.height / 2, 'arcade', result, 20)
      .setOrigin(0.5)
      .setDepth(10)

    // 初期化
    this.time.delayedCall(1000, () => {
      this.scene.start('ContinueScene', { nextScene: 'TexasHoldem' })
      this.resetRound()
      foldTexts.forEach((foldText) => {
        foldText.destroy()
      })
      noContestText.destroy()
      this.players.forEach((player) => {
        // eslint-disable-next-line no-param-reassign
        player.clearBet()
      })
      this.dealInitialCards()
      this.PlayAnte()
    })
    this.time.delayedCall(4000, () => {
      this.createActionPanel()
    })
  }

  public hasEnoughPlayers(): boolean {
    return this.players.filter((player) => player.gameStatus !== PlayerAction.FOLD).length >= 2
  }

  public clearPlayersBet(): void {
    this.players.forEach((player) => {
      player.clearBet()
    })
  }

  public destroyActionPanel(): void {
    this.raiseButton?.destroy()
    this.callButton?.destroy()
    this.checkButton?.destroy()
    this.foldButton?.destroy()
  }

  public createRaiseButton(): void {
    this.raiseButton = new Button(this, this.width * 0.92, this.height * 0.7, 'rectangle', 'RAISE')

    this.raiseButton.setClickHandler(() => {
      this.addRaiseAmount()
      if (this.playerMoney < this.currentBetAmount) {
        this.playerBet += this.playerMoney
        this.playerMoney = 0
      } else {
        this.playerBet += this.currentBetAmount
        this.playerMoney -= this.playerBet
      }
      this.player.addBet(this.currentBetAmount)
      this.animateChipToTableCenter(0)

      this.time.delayedCall(500, () => {
        this.updateMText(this.playerMoney)
        this.updateBText(this.playerBet)
        this.pot?.setAmount(this.currentBetAmount)
        this.destroyActionPanel()
        if (this.player.gameStatus === GameStatus.SECOND_BETTING) {
          this.nextPlayerTurnOnSecondBettingRound(1)
        } else if (this.player.gameStatus === GameStatus.THIRD_BETTING) {
          this.nextPlayerTurnOnThirdBettingRound(1)
        } else if (this.player.gameStatus === GameStatus.FINAL_BETTING) {
          this.nextPlayerTurnOnFinalBettingRound(1)
        } else {
          this.nextPlayerTurnOnFirstBettingRound(1)
        }
        this.player.gameStatus = PlayerAction.RAISE
      })
    })
  }

  public createCheckButton(): void {
    this.checkButton = new Button(this, this.width * 0.92, this.height * 0.8, 'rectangle', 'CHECK')

    this.checkButton.setClickHandler(() => {
      // TODO: チップアニメーション追加
      this.time.delayedCall(500, () => {
        this.destroyActionPanel()
        if (this.player.gameStatus === GameStatus.SECOND_BETTING) {
          this.player.gameStatus = PlayerAction.CHECK
          this.nextPlayerTurnOnSecondBettingRound(1)
        } else if (this.player.gameStatus === GameStatus.THIRD_BETTING) {
          this.player.gameStatus = PlayerAction.CHECK
          this.nextPlayerTurnOnThirdBettingRound(1)
        } else if (this.player.gameStatus === GameStatus.FINAL_BETTING) {
          this.player.gameStatus = PlayerAction.CHECK
          this.nextPlayerTurnOnFinalBettingRound(1)
        } else {
          this.player.gameStatus = PlayerAction.CHECK
          this.nextPlayerTurnOnFirstBettingRound(1)
        }
      })
    })
  }

  public addRaiseAmount(): void {
    const raiseAmount = this.currentBetAmount + 100
    this.currentBetAmount = raiseAmount
  }

  public createPot(): void {
    this.pot = new Pot(this, this.width * 0.9, this.height * 0.5, 'chipRed', 0)
  }

  public PlayAnte(): void {
    this.players.forEach((player, index) => {
      if (player.playerType === 'player') {
        this.playerMoney -= ANTE_AMOUNT
        this.playerBet += ANTE_AMOUNT
        this.updateMText(this.playerMoney)
        this.updateBText(this.playerBet)
      }

      this.time.delayedCall(1500, () => {
        this.animateChipToTableCenter(index)
        this.pot?.setAmount(ANTE_AMOUNT)
      })
    })
  }

  public setUpMoneyText(): void {
    this.moneyText = this.add.bitmapText(0, 0, 'arcade', '', 20)
    this.betText = this.add.bitmapText(0, 0, 'arcade', '', 20)
  }

  public updateMText(money: number): void {
    ;(this.moneyText as BitmapText).setText(`Money: $${money}`)
    Phaser.Display.Align.In.TopRight(this.moneyText as BitmapText, this.gameZone as Zone, -20, -20)
  }

  public updateBText(bet: number) {
    ;(this.betText as BitmapText).setText(`Bet: $${bet}`)
    Phaser.Display.Align.To.BottomLeft(this.betText as BitmapText, this.moneyText as BitmapText)
  }

  public animateChipToTableCenter(index: number) {
    const tempChip = new Button(
      this,
      this.playerHandZones[index].x,
      this.playerHandZones[index].y,
      'chipRed',
    )
    tempChip.resizeButton(0.6)

    tempChip.playMoveAndDestroy(this.width * 0.9, this.height * 0.5)
  }

  public dealInitialCards(): void {
    this.time.delayedCall(500, () => {
      this.players.forEach((player, index) => {
        if (player.playerType === 'player') {
          for (let i = 0; i < 2; i += 1) {
            this.handOutCard(
              this.playerDeck as Deck,
              player as TexasHoldemPlayer,
              this.playerHandZones[index].x + i * (CARD_WIDTH + 20) - CARD_WIDTH + 50,
              this.playerHandZones[index].y + 15,
              true,
            )
          }
        } else if (player.playerType === 'cpu') {
          for (let i = 0; i < 2; i += 1) {
            this.handOutCard(
              this.playerDeck as Deck,
              player as TexasHoldemPlayer,
              this.playerHandZones[index].x + i * (CARD_WIDTH + 20) - CARD_WIDTH + 50,
              this.playerHandZones[index].y - 15,
              true,
            )
          }
        }
      })
    })

    this.time.delayedCall(1500, () => {
      this.player.hand.forEach((card) => {
        if (card.getFaceDown()) {
          card.playFlipOverTween()
        }
      })
    })
  }

  public handOutCard(
    deck: Deck,
    player: TexasHoldemPlayer,
    toX: number,
    toY: number,
    isFaceDown: boolean,
  ): void {
    const card: Card | undefined = deck.drawOne()
    if (card) {
      if (!isFaceDown) {
        card.setFaceUp()
      }
      player.addHand(card)
      this.children.bringToTop(card)
      card.playMoveTween(toX, toY)
    }
  }

  public createPlayerHandZones(width: number, height: number): void {
    this.playerHandZones = []
    this.players.forEach((player, index) => {
      const playerHandZone = this.add.zone(0, 0, width, height)
      if (player.playerType === 'player') {
        Phaser.Display.Align.To.TopCenter(
          playerHandZone as Zone,
          this.playerNameTexts[index] as BitmapText,
          0,
          GUTTER_SIZE,
        )
      } else if (player.playerType === 'cpu') {
        Phaser.Display.Align.To.BottomCenter(
          playerHandZone as Zone,
          this.playerNameTexts[index] as BitmapText,
          0,
          GUTTER_SIZE,
        )
      }
      // aiが存在する場合は、個別に位置の設定が必要。
      this.playerHandZones.push(playerHandZone)
    })
  }

  public createCommunityCardsZone(width: number, height: number): void {
    this.communityCardsZone = this.add
      .zone(
        this.width / 5, // X座標（ゲームの中央）
        this.height / 2, // Y座標（ゲームの中央）
        width * 5, // 5枚のカードの幅
        height, // カードの高さ
      )
      .setRectangleDropZone(width * 5, height)
  }

  public createPlayerNameTexts(): void {
    this.playerNameTexts = [] // 前回のゲームで作成したものが残っている可能性があるので、初期化する
    this.players.forEach((player) => {
      const playerNameText = this.add.bitmapText(0, 300, 'arcade', player.name, 20)
      if (player.playerType === 'player') {
        Phaser.Display.Align.In.BottomCenter(
          playerNameText as BitmapText,
          this.gameZone as Zone,
          0,
          -20,
        )
      } else if (player.playerType === 'cpu') {
        Phaser.Display.Align.In.TopCenter(
          playerNameText as BitmapText,
          this.gameZone as Zone,
          0,
          -20,
        )
      }
      // aiが存在する場合は、個別に位置の設定が必要。
      this.playerNameTexts.push(playerNameText)
    })
  }

  public nextPlayerTurnOnFirstBettingRound(playerIndex: number): void {
    if (!this.hasEnoughPlayers()) {
      this.clearPlayersBet()
      this.cpuBettingStatus?.destroy()
      if (this.player.gameStatus === PlayerAction.FOLD) {
        this.noContest(GameResult.LOSS)
        return
      }
      this.noContest(GameResult.WIN)
      return
    }

    // ３枚の共通カードを配る
    if (this.isFirstBettingEnd()) {
      this.clearPlayersBet()
      this.cpuBettingStatus?.destroy()

      // 全員のstatus変更
      this.players.forEach((player) => {
        // eslint-disable-next-line no-param-reassign
        player.gameStatus = GameStatus.SECOND_BETTING
      })
      this.dealFirstCommunityCards()
    }

    let currentPlayerIndex = playerIndex
    if (playerIndex > this.players.length - 1) currentPlayerIndex = 0

    if (this.players[currentPlayerIndex].playerType === 'player') {
      this.createActionPanel()
    } else {
      this.cpuFirstBettingAction(1)
    }
  }

  public dealFirstCommunityCards(): void {
    this.time.delayedCall(500, () => {
      for (let i = 0; i < 3; i += 1) {
        this.dealCommunityCard(
          this.playerDeck as Deck,
          (this.communityCardsZone as Zone).x + i * (CARD_WIDTH + 20) - CARD_WIDTH + 50,
          (this.communityCardsZone as Zone).y,
          true,
        )
      }
    })

    this.time.delayedCall(1500, () => {
      this.communityCards.forEach((card) => {
        if (card.getFaceDown()) {
          card.playFlipOverTween()
        }
      })
    })
  }

  public dealCommunityCard(deck: Deck, toX: number, toY: number, isFaceDown: boolean): void {
    const card: Card | undefined = deck.drawOne()
    if (card) {
      if (!isFaceDown) {
        card.setFaceUp()
      }
      this.communityCards.push(card)
      this.children.bringToTop(card)
      card.playMoveTween(toX, toY)
    }
  }

  public cpuFirstBettingAction(index: number): void {
    const decisionValues = Object.values(PlayerAction)
    const decisionIndex = Math.floor(Math.random() * decisionValues.length)
    let decisionValue = decisionValues[decisionIndex]
    if (this.currentBetAmount !== 0 && decisionValue === PlayerAction.CHECK) {
      decisionValue = PlayerAction.CALL
    }

    decisionValue = PlayerAction.CALL

    if (decisionValue === PlayerAction.CALL) {
      const betAmount = this.currentBetAmount - this.players[index].bet
      this.players[index].addBet(betAmount)
      this.players[index].gameStatus = PlayerAction.CALL

      this.time.delayedCall(1000, () => {
        this.createCpuBettingStatus(PlayerAction.CALL)
        this.animateChipToTableCenter(index)
        this.pot?.setAmount(betAmount)
      })
    }

    this.time.delayedCall(2500, () => {
      this.nextPlayerTurnOnFirstBettingRound(0)
    })
  }

  public createCpuBettingStatus(status: string): void {
    let tmpStr = ''
    if (status === PlayerAction.RAISE) tmpStr = `RAISE: ${this.currentBetAmount}`
    else if (status === PlayerAction.CALL) tmpStr = `CALL: ${this.currentBetAmount}`
    else if (status === PlayerAction.CHECK) tmpStr = `CHECK: ${this.currentBetAmount}`
    else tmpStr = `FOLD`

    this.cpuBettingStatus = this.add
      .bitmapText(this.playerHandZones[1].x, this.playerHandZones[1].y, 'arcade', tmpStr, 30)
      .setOrigin(0.5)
      .setDepth(10)
  }

  public nextPlayerTurnOnSecondBettingRound(playerIndex: number): void {
    if (!this.hasEnoughPlayers()) {
      this.clearPlayersBet()
      this.cpuBettingStatus?.destroy()
      if (this.player.gameStatus === PlayerAction.FOLD) {
        this.noContest(GameResult.LOSS)
        return
      }
      this.noContest(GameResult.WIN)
      return
    }

    // 場に1枚カードを追加
    if (this.isSecondBettingEnd()) {
      this.clearPlayersBet()
      this.cpuBettingStatus?.destroy()

      // 全員のstatus変更
      this.players.forEach((player) => {
        // eslint-disable-next-line no-param-reassign
        player.gameStatus = GameStatus.THIRD_BETTING
      })
      this.dealAfterSecondCommunityCard(2)
    }

    let currentPlayerIndex = playerIndex
    if (playerIndex > this.players.length - 1) currentPlayerIndex = 0

    if (this.players[currentPlayerIndex].playerType === 'player') {
      this.createActionPanel()
    } else {
      this.cpuSecondBettingAction(1)
    }
  }

  public nextPlayerTurnOnThirdBettingRound(playerIndex: number): void {
    if (!this.hasEnoughPlayers()) {
      this.clearPlayersBet()
      this.cpuBettingStatus?.destroy()
      if (this.player.gameStatus === PlayerAction.FOLD) {
        this.noContest(GameResult.LOSS)
        return
      }
      this.noContest(GameResult.WIN)
      return
    }

    // 場に1枚カードを追加
    if (this.isThirdBettingEnd()) {
      this.clearPlayersBet()
      this.cpuBettingStatus?.destroy()

      // 全員のstatus変更
      this.players.forEach((player) => {
        // eslint-disable-next-line no-param-reassign
        player.gameStatus = GameStatus.FINAL_BETTING
      })
      this.dealAfterSecondCommunityCard(3)
    }

    let currentPlayerIndex = playerIndex
    if (playerIndex > this.players.length - 1) currentPlayerIndex = 0

    if (this.players[currentPlayerIndex].playerType === 'player') {
      this.createActionPanel()
    } else {
      this.cpuThirdBettingAction(1)
    }
  }

  public dealAfterSecondCommunityCard(num: number): void {
    this.time.delayedCall(500, () => {
      this.dealCommunityCard(
        this.playerDeck as Deck,
        (this.communityCardsZone as Zone).x + (num + 1) * (CARD_WIDTH + 20) - CARD_WIDTH + 50,
        (this.communityCardsZone as Zone).y,
        true,
      )
    })

    this.time.delayedCall(1500, () => {
      this.communityCards.forEach((card) => {
        if (card.getFaceDown()) {
          card.playFlipOverTween()
        }
      })
    })
  }

  public makeDecision(index: number): string {
    const handRank = TexasHoldemPlayer.getCardsRank(
      this.players[index].findBestHand(this.communityCards),
    )
    const randomNumber = Math.random()

    // レイズする確率を50%とし、さらに手札の強さが一定のランク以上である場合にレイズします
    if (randomNumber < 0.5 && handRank >= STRONG_HAND_RANK) {
      return PlayerAction.RAISE
    }
    // コールする確率を90%とし、さらに手札の強さが一定のランク以上である場合にコールします
    if (randomNumber < 0.9 || handRank >= MINIMUM_HAND_RANK) {
      return PlayerAction.CALL
    }
    // 上記のいずれも選ばれなかった場合、または手札の強さが低い場合にはフォールドします

    return PlayerAction.FOLD
  }

  public cpuSecondBettingAction(index: number): void {
    const decisionValue = this.makeDecision(index)
    this.cpuBettingStatus?.destroy()

    if (decisionValue === PlayerAction.CALL) {
      const betAmount = this.currentBetAmount - this.players[index].bet
      this.players[index].addBet(betAmount)
      this.players[index].gameStatus = PlayerAction.CALL

      this.time.delayedCall(1000, () => {
        this.createCpuBettingStatus(PlayerAction.CALL)
        this.animateChipToTableCenter(index)
        this.pot?.setAmount(betAmount)
      })
    }
    if (decisionValue === PlayerAction.RAISE) {
      const betAmount = this.currentBetAmount
      this.players[index].addBet(betAmount)
      this.players[index].gameStatus = PlayerAction.RAISE

      this.time.delayedCall(1000, () => {
        this.createCpuBettingStatus(PlayerAction.RAISE)
        this.animateChipToTableCenter(index)
        this.pot?.setAmount(betAmount)
      })
    }
    if (decisionValue === PlayerAction.FOLD) {
      this.players[index].gameStatus = PlayerAction.FOLD
      this.noContest(GameResult.WIN)
    }

    this.time.delayedCall(2500, () => {
      this.nextPlayerTurnOnSecondBettingRound(0)
    })
  }

  public cpuThirdBettingAction(index: number): void {
    const decisionValue = this.makeDecision(index)
    this.cpuBettingStatus?.destroy()

    if (decisionValue === PlayerAction.CALL) {
      const betAmount = this.currentBetAmount - this.players[index].bet
      this.players[index].addBet(betAmount)
      this.players[index].gameStatus = PlayerAction.CALL

      this.time.delayedCall(1000, () => {
        this.createCpuBettingStatus(PlayerAction.CALL)
        this.animateChipToTableCenter(index)
        this.pot?.setAmount(betAmount)
      })
    }
    if (decisionValue === PlayerAction.RAISE) {
      const betAmount = this.currentBetAmount
      this.players[index].addBet(betAmount)
      this.players[index].gameStatus = PlayerAction.RAISE

      this.time.delayedCall(1000, () => {
        this.createCpuBettingStatus(PlayerAction.RAISE)
        this.animateChipToTableCenter(index)
        this.pot?.setAmount(betAmount)
      })
    }
    if (decisionValue === PlayerAction.FOLD) {
      this.players[index].gameStatus = PlayerAction.FOLD
      this.noContest(GameResult.WIN)
    }

    this.time.delayedCall(2500, () => {
      this.nextPlayerTurnOnThirdBettingRound(0)
    })
  }

  public cpuFinalBettingAction(index: number): void {
    const decisionValue = this.makeDecision(index)
    this.cpuBettingStatus?.destroy()

    if (decisionValue === PlayerAction.CALL) {
      const betAmount = this.currentBetAmount - this.players[index].bet
      this.players[index].addBet(betAmount)
      this.players[index].gameStatus = PlayerAction.CALL

      this.time.delayedCall(1000, () => {
        this.createCpuBettingStatus(PlayerAction.CALL)
        this.animateChipToTableCenter(index)
        this.pot?.setAmount(betAmount)
      })
    }
    if (decisionValue === PlayerAction.RAISE) {
      const betAmount = this.currentBetAmount
      this.players[index].addBet(betAmount)
      this.players[index].gameStatus = PlayerAction.RAISE

      this.time.delayedCall(1000, () => {
        this.createCpuBettingStatus(PlayerAction.RAISE)
        this.animateChipToTableCenter(index)
        this.pot?.setAmount(betAmount)
      })
    }
    if (decisionValue === PlayerAction.FOLD) {
      this.players[index].gameStatus = PlayerAction.FOLD
      this.noContest(GameResult.WIN)
    }

    this.time.delayedCall(2500, () => {
      this.nextPlayerTurnOnFinalBettingRound(0)
    })
  }

  public nextPlayerTurnOnFinalBettingRound(playerIndex: number): void {
    if (this.isFinalBettingEnd()) {
      // TODO: 役名を表示する

      const winPlayers = this.compareAllHands()
      let result = GameResult.LOSS
      if (winPlayers.length >= 2) {
        result = GameResult.TIE
      } else if (winPlayers.includes(this.player)) {
        result = GameResult.WIN
      }
      this.showdown(result)
      return
    }

    let currentPlayerIndex = playerIndex
    if (playerIndex > this.players.length - 1) currentPlayerIndex = 0

    if (this.players[currentPlayerIndex].playerType === 'player') {
      this.createActionPanel()
    } else {
      this.cpuFinalBettingAction(1)
    }
  }

  public showdown(result: GameResult): void {
    this.destroyActionPanel()
    this.payOut(result)
    const handRanks: BitmapText[] = []

    this.playerHandZones.forEach((handZone, index) => {
      const playerBestHand = this.players[index].findBestHand(this.communityCards)
      const handRankText = TexasHoldem.getKeyByValue(
        HAND_RANK_MAP,
        TexasHoldemPlayer.getCardsRank(playerBestHand),
      )

      const handRank = this.add
        .bitmapText(handZone.x, handZone.y, 'arcade', handRankText, 30)
        .setOrigin(0.5)
        .setDepth(10)

      handRanks.push(handRank)
    })
    const allCards: Card[] = [
      ...this.communityCards,
      ...this.players.flatMap((player) => player.hand),
    ]
    let winCards: Card[] = []
    if (result === GameResult.WIN) {
      winCards = this.players[0].findBestHand(this.communityCards)
    } else if (result === GameResult.LOSS) {
      winCards = this.players[1].findBestHand(this.communityCards)
    }
    if (winCards) {
      allCards.forEach((card) => {
        card.setTint(0x888888)
      })

      winCards.forEach((card) => {
        card.clearTint()
      })
    }

    this.showdownCpuHand()
    this.cpuBettingStatus?.destroy()

    // 勝敗結果表示
    const resultText = this.add
      .bitmapText(this.width / 2, this.height / 2, 'arcade', result, 30)
      .setOrigin(0.5)
      .setDepth(10)

    resultText.setTint(0xffde3d)
    if (result === 'WIN') {
      this.sound.play('win')
      resultText.setTint(0xffde3d)
    } else {
      this.sound.play('negative')
      resultText.setTint(0xff0000)
    }

    this.input.once('pointerdown', () => {
      handRanks.forEach((handRank) => {
        handRank.destroy()
      })
      resultText.destroy()
      this.resetRound()
      this.scene.start('ContinueScene', { nextScene: 'TexasHoldem' })
      this.dealInitialCards()
      this.PlayAnte()
      this.createActionPanel()
    })
  }

  public static getKeyByValue(map: Map<string, number>, value: number): string {
    const entry = Array.from(map.entries()).find(([, val]) => val === value)
    return entry ? entry[0] : ''
  }

  public resetRound(): void {
    this.pot?.clear()
    this.currentBetAmount = 0
    this.playerBet = 0
    this.updateBText(0)
    this.clearPlayersBet()
    this.cpuBettingStatus?.destroy()

    this.players.forEach((player) => {
      // eslint-disable-next-line no-param-reassign
      player.gameStatus = GameStatus.FIRST_BETTING
      player.clearBet()
      player.hand.forEach((card) => card.destroy())
      player.clearHand()
    })

    this.communityCards = []
    this.playerDeck = new Deck(this, this.width / 2, -140, 'poker')
  }

  public showdownCpuHand(): void {
    this.players[1].hand.forEach((card) => {
      if (card.faceDown) {
        card.playFlipOverTween()
      }
    })
  }
}
