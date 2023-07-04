import Phaser from 'phaser'
import Text = Phaser.GameObjects.Text
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
import { HAND_RANK, HAND_RANK_MAP, RANK_CHOICES, RANK_CHOICES_TEXAS } from '@/model/poker/handRank'
import PlayerAction from '@/model/poker/playAction'
import TexasHoldemPlayer from '@/model/texasHoldem/TexasHoldemPlayer'
import { textStyle, GUTTER_SIZE } from '@/utility/constants'

const ANTE_AMOUNT = 20

export default class TexasHoldem extends BaseScene {
  public communityCards: Array<Card> = []

  public playerHandZones: Array<Zone> = []

  public playerNameTexts: Array<Text> = []

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

  public cpuBettingStatus: Text | undefined

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
    this.foldButton = new Button(this, this.width * 0.85, this.height * 0.9, 'chipBlue', 'FOLD')

    this.foldButton.setClickHandler(() => {
      this.player.gameStatus = PlayerAction.FOLD
      this.players.forEach((player) => {
        player.hand.forEach((card) => {
          card.playMoveTween(this.width / 2, -600)
        })
      })
      this.nextPlayerTurnOnFirstBettingRound(1)
    })
  }

  public createCallButton(): void {
    this.callButton = new Button(this, this.width * 0.85, this.height * 0.8, 'chipBlue', 'CALL')

    this.callButton.setClickHandler(() => {
      if (this.playerMoney < this.currentBetAmount) {
        this.playerBet += this.playerMoney
        this.playerMoney = 0
      } else {
        this.playerBet += this.currentBetAmount
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
    const players = (this.players as TexasHoldemPlayer[]).filter(
      (player) => player.gameStatus !== PlayerAction.FOLD,
    )
    const sortedPlayers = players.sort((a, b) => {
      const aBestCards = a.findBestHand(this.communityCards)
      const bBestCards = b.findBestHand(this.communityCards)
      const aRank = TexasHoldemPlayer.getCardsRank(aBestCards)
      const bRank = TexasHoldemPlayer.getCardsRank(bBestCards)
      if (aRank > bRank) {
        return -1
      }
      if (aRank < bRank) {
        return 1
      }
      let aRanks = TexasHoldemPlayer.getRanks(aBestCards, RANK_CHOICES_TEXAS)
      let bRanks = TexasHoldemPlayer.getRanks(bBestCards, RANK_CHOICES_TEXAS)

      // 1つ目のペアを見つけます
      let aPair
      let bPair
      ;[aPair, aRanks] = TexasHoldemPlayer.findPair(aRanks)
      ;[bPair, bRanks] = TexasHoldemPlayer.findPair(bRanks)

      if (aPair && bPair) {
        if (aPair > bPair) {
          return -1
        }
        if (aPair < bPair) {
          return 1
        }
      }

      // 2つ目のペアを見つけます
      ;[aPair, aRanks] = TexasHoldemPlayer.findPair(aRanks)
      ;[bPair, bRanks] = TexasHoldemPlayer.findPair(bRanks)

      // 次に2つ目のペアのランクを比較します
      if (aPair && bPair) {
        if (aPair > bPair) {
          return -1
        }
        if (aPair < bPair) {
          return 1
        }
      }

      // ランクの配列を降順にソートします（ランクが高いものが先頭に来るように）
      aRanks.sort((c, d) => d - c)
      bRanks.sort((d, c) => d - c)

      for (let i = 0; i < aRanks.length; i += 1) {
        if (aRanks[i] > bRanks[i]) {
          return -1
        }
        if (aRanks[i] < bRanks[i]) {
          return 1
        }
      }
      return 0
    })

    const bestCards = sortedPlayers[0].findBestHand(this.communityCards)
    const maxRank = TexasHoldemPlayer.getCardsRank(bestCards)
    const winners = sortedPlayers.filter(
      (player) =>
        TexasHoldemPlayer.getCardsRank(player.findBestHand(this.communityCards)) === maxRank,
    )
    return winners
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
    const noContestText = this.add
      .text(this.width / 2, this.height / 2, result, textStyle)
      .setOrigin(0.5)
      .setDepth(10)

    // 初期化
    this.scene.start('ContinueScene', { nextScene: 'TexasHoldem' })
    this.resetRound()

    this.time.delayedCall(3000, () => {
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

  public isChangeHandRoundEnd(): boolean {
    let isEnd = true
    this.players.forEach((player) => {
      if (player.gameStatus === GameStatus.CHANGE_CARD) {
        isEnd = false
      }
    })
    return isEnd
  }

  public createRaiseButton(): void {
    this.raiseButton = new Button(this, this.width * 0.85, this.height * 0.7, 'chipBlue', 'RAISE')

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
    this.checkButton = new Button(this, this.width * 0.85, this.height * 0.8, 'chipBlue', 'CHECK')

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
    this.moneyText = this.add.text(0, 0, '', textStyle)
    this.betText = this.add.text(0, 0, '', textStyle)
  }

  public updateMText(money: number): void {
    ;(this.moneyText as Text).setText(`Money: $${money}`)
    Phaser.Display.Align.In.TopRight(this.moneyText as Text, this.gameZone as Zone, -20, -20)
  }

  public updateBText(bet: number) {
    ;(this.betText as Text).setText(`Bet: $${bet}`)
    Phaser.Display.Align.To.BottomLeft(this.betText as Text, this.moneyText as Text)
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
          this.playerNameTexts[index] as Text,
          0,
          GUTTER_SIZE,
        )
      } else if (player.playerType === 'cpu') {
        Phaser.Display.Align.To.BottomCenter(
          playerHandZone as Zone,
          this.playerNameTexts[index] as Text,
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
      const playerNameText = this.add.text(0, 300, player.name, textStyle)
      if (player.playerType === 'player') {
        Phaser.Display.Align.In.BottomCenter(playerNameText as Text, this.gameZone as Zone, 0, -20)
      } else if (player.playerType === 'cpu') {
        Phaser.Display.Align.In.TopCenter(playerNameText as Text, this.gameZone as Zone, 0, -20)
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
      .text(this.playerHandZones[1].x, this.playerHandZones[1].y, tmpStr, textStyle)
      .setOrigin(0.5)
      .setDepth(10)
  }

  public static shouldDiscardCard(
    card: Card,
    handRank: number,
    ranks: number[],
    hand: Card[],
  ): boolean {
    // 5枚で, スコアの高い役がすでにできている場合は交換しない
    if (handRank === HAND_RANK_MAP.get(HAND_RANK.ROYAL_STRAIGHT_FLUSH)) {
      return false
    }

    if (handRank === HAND_RANK_MAP.get(HAND_RANK.STRAIGHT_FLUSH)) {
      return false
    }

    if (handRank === HAND_RANK_MAP.get(HAND_RANK.FULL_HOUSE)) {
      return false
    }

    if (handRank === HAND_RANK_MAP.get(HAND_RANK.FLUSH)) {
      return false
    }

    if (handRank === HAND_RANK_MAP.get(HAND_RANK.STRAIGHT)) {
      return false
    }

    // ペアやスリーオブアカインド等が既に存在する場合にはそれらを構成するカードを保持
    const cardRank = RANK_CHOICES.indexOf(card.rank)
    const count = ranks.filter((rank) => rank === cardRank).length
    if (count >= 2) {
      return false
    }

    // フラッシュにあと一枚でなる場合, フラッシュになっている4枚に含まれているかをチェックする
    if (TexasHoldem.isCardPartOfFlush(card, hand)) {
      return false
    }

    // あと一枚でストレートになる場合, ストレートになっている4枚に含まれるかどうかをチェックする
    if (TexasHoldem.isCardPartOfStraight(cardRank, ranks)) {
      return false
    }

    // 役がなにもない場合, もしくはワンペアの場合は, 高ランクカードは保持
    if (
      (handRank === HAND_RANK_MAP.get(HAND_RANK.FULL_HOUSE) ||
        handRank === HAND_RANK_MAP.get(HAND_RANK.ONE_PAIR)) &&
      (card.rank === 'A' || card.rank === 'K' || card.rank === 'Q')
    ) {
      return false
    }

    return true
  }

  public static isCardPartOfFlush({ suit: cardSuit }: Card, hand: Card[]): boolean {
    const suitCountMap = { [cardSuit]: 1 }

    hand.forEach(({ suit }) => {
      if (suit !== cardSuit) {
        if (suitCountMap[suit]) {
          suitCountMap[suit] += 1
        } else {
          suitCountMap[suit] = 1
        }
      }
    })

    return Object.keys(suitCountMap).some((suit) => suitCountMap[suit] >= 4 && suit === cardSuit)
  }

  public static isCardPartOfStraight(cardRank: number, ranks: number[]): boolean {
    const sortedRanks = [...ranks].sort((a, b) => a - b)
    const cardRankSortedIndex = sortedRanks.indexOf(cardRank)
    if (sortedRanks[3] - sortedRanks[0] === 3) {
      if (
        cardRankSortedIndex >= 3 &&
        sortedRanks[cardRankSortedIndex] - sortedRanks[cardRankSortedIndex - 1] === 1
      ) {
        return true
      }
      if (sortedRanks[cardRankSortedIndex + 1] - sortedRanks[cardRankSortedIndex] === 1) {
        return true
      }
    }

    if (sortedRanks[4] - sortedRanks[1] === 3) {
      if (
        cardRankSortedIndex <= 2 &&
        sortedRanks[cardRankSortedIndex + 1] - sortedRanks[cardRankSortedIndex] === 1
      ) {
        return true
      }
      if (sortedRanks[cardRankSortedIndex] - sortedRanks[cardRankSortedIndex - 1] === 1) {
        return true
      }
    }
    return false
  }

  public enableHandSelection(): void {
    this.player.hand.forEach((card) => {
      card.enableClick()
    })
  }

  public disableHandSelection(): void {
    this.player.hand.forEach((card) => {
      card.disableClick()
    })
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

  public cpuSecondBettingAction(index: number): void {
    const decisionValue = PlayerAction.CALL
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

    this.time.delayedCall(2500, () => {
      this.nextPlayerTurnOnSecondBettingRound(0)
    })
  }

  public cpuThirdBettingAction(index: number): void {
    const decisionValue = PlayerAction.CALL
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

    this.time.delayedCall(2500, () => {
      this.nextPlayerTurnOnThirdBettingRound(0)
    })
  }

  public cpuFinalBettingAction(index: number): void {
    const decisionValue = PlayerAction.CALL
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
      }
      if (winPlayers.includes(this.player)) {
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
    const handRanks: Text[] = []

    this.playerHandZones.forEach((handZone, index) => {
      const playerBestHand = this.players[index].findBestHand(this.communityCards)
      const handRankText = TexasHoldem.getKeyByValue(
        HAND_RANK_MAP,
        TexasHoldemPlayer.getCardsRank(playerBestHand),
      )

      const handRank = this.add
        .text(handZone.x, handZone.y, handRankText, textStyle)
        .setOrigin(0.5)
        .setDepth(10)

      handRanks.push(handRank)
    })

    this.showdownCpuHand()
    this.cpuBettingStatus?.destroy()

    // 勝敗結果表示
    const resultText = this.add
      .text(this.width / 2, this.height / 2, result, textStyle)
      .setOrigin(0.5)
      .setDepth(10)
    resultText.setColor('#ffde3d')

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
