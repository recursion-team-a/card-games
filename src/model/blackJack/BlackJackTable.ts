import Player from '../common/Player'
import Table from '../common/Table'

export default class BlackJackTable extends Table {
  private players: Array<Player> = []
  private gamePhase: Array<string> = []
  public assignPlayerHands(): void {}
  public clearPlayerHandsAndBets(): void {}
  public evaluateMove(player: Player): void {}
  public getTurnPlayer(): void {}
  public haveTurn(): void {}
  public evaluateAndGetRoundResults(): string {}
}
