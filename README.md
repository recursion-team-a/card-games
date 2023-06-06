# card-games

## 技術スタックの構成図

![sample](https://github.com/recursion-team-a/card-games/assets/99064128/d4a30c91-cbe6-4a9f-b46b-abfa76193cb2)


## ワイヤーフレーム
![Slice 1 (1)](https://github.com/recursion-team-a/card-games/assets/127278864/09112875-217e-482f-83e2-c5b90b5d1adb)

## アクティビティ図

Sub がついているのはサブアクティビティ

```mermaid
%%{init:{'theme':'base'}}%%
flowchart TB
    A((Start)) --> B(LandingPage)
    style B fill:#dfc,stroke:#333,stroke-width:4px
    B --> C(MainPage)
    style C fill:#dfc,stroke:#333,stroke-width:4px
    C --> D{Select game}
    D --> E[SubBlackJack]
    D --> F[SubPoker]
    D --> G[SubSpeed]
    D --> H[SubWar]
    E --play--> I[results]
    F --play--> I
    G --play--> I
    H --play--> I
    E --rule--> M(RulePage)
    F --rule--> M
    G --rule--> M
    H --rule--> M
    style M fill:#dfc,stroke:#333,stroke-width:4px
    M --> C
    I --> J{Continue game ?}
    J --Yes--> C
    J --No--> K((end))
```

## Black Jack

### 検討事項

- 複数人での対戦機能
- チュートリアルページ
- CPUレベルに応じた処理(ベーシックストラテジー)
- Surrenderのとき, 掛け金の半額

```mermaid
%%{init:{'theme':'base'}}%%
flowchart TB
    A((Start)) --> B{Play Tutorial?}
    B --yes--> C(TutorialPage)
    style C fill:#dfc,stroke:#333,stroke-width:4px
    C --> D
    B --No--> D[Select CPU level]
    D --> E[Select number of people]
    E --> a[Bet tips]
    a --> F[deal cards]
    F --> G{Player's turn}
    G --Stand--> H{Dealer's turn}
    G --Hit--> I[deal one more card]
    G --Surrender--> R
    G --Double--> b[double down]
    b --> H
    I --> J{Total exceeds 21?}
    J --No--> c{Player's turn <br> from the second time}
    c --Hit--> J
    c --Stand--> H
    J --Yes--> K[Player Loses]
    style K fill:#fcc,stroke:#333,stroke-width:4px
    H --> L{Total exceeds 17?}
    L --Yes--> M[Determine winner]
    L --No--> N[deal one more card]
    N --> O{Total exceeds 21?}
    O --Yes--> P[Player Wins]
    style P fill:#fcc,stroke:#333,stroke-width:4px
    O --No--> L
    M --Player's Total > Dealer's Total--> P
    M --Player's Total = Dealer's Total--> Q[Draw]
    M --Player's Total < Dealer's Total--> K
    style Q fill:#fcc,stroke:#333,stroke-width:4px
    Q --> R[Calculate Player's CREDIT]
    P --> R
    K --> R
    R --> S{Meets the miimum bid ?}
    S --Yes--> T{Continue the game?}
    S --No--> U((End))
    T --Yes--> a
    T --No--> U
```

## War

### 検討事項

- ルールはディーラーとプレイヤーに一枚ずつ配りカードの強さを比較
- カードの強さは A が最も強く, その他は数字が大きい方が強い
- CPU レベルに応じた処理

```mermaid
%%{init:{'theme':'base'}}%%
flowchart TB
    A((Start)) --> B{Play Tutorial?}
    B --yes--> C(TutorialPage)
    style C fill:#dfc,stroke:#333,stroke-width:4px
    C --> D
    B --No--> D[Select CPU level]
    D --> a[bet tips]
    a --> E[Deal one card each]
    E --> F{Compare cards}
    F --player's card > Dealer's card--> G[Player win]
    F -- player's card < Dealer's card--> H[Player loses]
    F --player's card = Dealer's card--> I[Draw]
    style G fill:#fcc,stroke:#333,stroke-width:4px
    style H fill:#fcc,stroke:#333,stroke-width:4px
    style I fill:#fcc,stroke:#333,stroke-width:4px
    I --> E
    G --> J[Calculate player's CREDIT]
    H --> J
    J --> K{Meets the minimum bit?}
    K --Yes--> L{Continue the game?}
    L --Yes--> D
    L --No--> M((End))
    K --No--> M
```

## Speed

### 検討事項

-

```mermaid
%%{init:{'theme':'base'}}%%
flowchart TB
    A((Start)) --> B{Play Tutorial?}
    B --yes--> C(TutorialPage)
    style C fill:#dfc,stroke:#333,stroke-width:4px
    C --> D
    B --No--> D[CPUのレベルを選択]
    D --> a[チップを賭ける]
    a --> E[カードを赤と黒に分ける]
    E --> F[場札を4枚並べる]
    F --> G[Game Start]
    G --> H[ゲーム進行]
    H --> I{プレイヤーかディーラー<br>どちらかの山札が無くなったか}
    I --Player--> J[Player wins]
    I --Dealer--> K[Player loses]
    style J fill:#fcc,stroke:#333,stroke-width:4px
    style K fill:#fcc,stroke:#333,stroke-width:4px
    J --> L[PlayerのCREDITを計算]
    K --> L
    L --> N{PlayerのCREDITが<br>最低入札額を満たすか}
    N --Yes--> O{Continue tha game?}
    O --Yes--> D
    O --No--> M
    N --No--> M((End))
```

ゲーム進行は下記のシーケンス図で示す.

```mermaid
sequenceDiagram
    participant pl as Player
    participant dl as Dealer
    participant te as 手札
    participant da as 台札

    loop どちらかの山札がなくなるまで
        opt 場札がなくなる
            pl ->> te: カードを引く
            te -->> pl: カードを渡す
        end
        opt 場札に隣り合ったカードがある
            pl ->> da: 台札に置く
            opt Playerが先にカードを配置
                da ->> pl: 配置確認
            end
        end
        opt 場札がなくなる
            dl ->> te: カードを引く
            te -->> dl: カードを渡す
        end
        opt 場札に隣り合ったカードがある
            dl ->> da: 台札に置く
            opt CPUが先にカードを配置
                da ->> dl: 配置確認
            end
        end
        opt 二人とも出せるカードがない
            te ->> da: 台札にカードを置く
        end
    end
```

## Poker

### 検討事項

-

ルールは[任天堂](https://www.nintendo.co.jp/others/playing_cards/howtoplay/poker/index.html)を参照

```mermaid
%%{init:{'theme':'base'}}%%
flowchart TB
    A((Start)) --> B{Play Tutorial?}
    B --yes--> C(TutorialPage)
    style C fill:#dfc,stroke:#333,stroke-width:4px
    C --> D
    B --No--> D[Select CPU level]
    D --> E[Select number of people]
    E --> F[CREDIT 初期化]
    F --> G[参加チップを出す]
    G --> H[手札を5枚配る]
    H --> I{親の左側から順に<br>Bit, Passを選択}
    I --Pass--> J{全員がPass}
    J --No--> I
    J --Yes--> Y
    I --Bit--> K{次の人からは<br>Call,Raise,Dropを選択}
    K --Drop--> b[場に出したチップを失う]
    b --> Y
    K --Raise--> L[チップの枚数を選択]
    L --> K
    K --Call--> M{誰もRaiseしないまま<br>一巡した}
    M --No--> K
    M --Yes--> N[1回目のBit終了]
    N --> O{残りのPlayerが2人以上いるか}
    O --Yes--> P[カード交換]
    O --No--> b
    P --> Q[二回目のBitを順番に開始]
    Q --> R{BitかCheckを選択}
    R --Check--> Q
    R --Bit--> S{次の人からは<br>Call,Raise,Dropを選択}
    S --Drop--> b
    S --Raise--> T[チップの枚数を選択]
    T --> S
    S --Call--> U{誰もRaiseしないまま<br>一巡した}
    U --No--> S
    U --Yes--> V[手札の強さを比較]
    V --> W[勝者決定]
    W --> X[チップを獲得]
    X --> Y{CREDITが<br>最低入札条件を満たすか?}
    Y --Yes--> Z{Continue the game?}
    Y --No--> a((End))
    Z --No--> a
    Z --Yes--> G
```

## クラス図
### 検討事項
- CardクラスはPhaserではアニメーション, 座標等が必要になる可能性あり
- 各ゲームのTableクラスでは, create(), update()で処理を行う必要がある. また, ボタン等の作成が必要.
- 各クラスの変数はゲッター・セッターを使って, 必要に応じてバリデーションをつける方が良いか
- DeckクラスにisEmpty()を追加（Speedで使う？）

```mermaid
---
title: Card Game
---
classDiagram
Table <|-- BlackjackTable
Table <|-- PorkerTable
Table <|-- SpeedTable
Table <|-- WarTable

Player <|-- BlackjackPlayer
Player <|-- PorkerPlayer
Player <|-- SpeedPlayer
Player <|-- WarPlayer

Table *-- "1.." Player: players
BlackjackTable *-- "2-7" Player: players
BlackjackTable *-- "1" Player: house
PorkerTable *-- "2-10" Player: players
SpeedTable *-- "1" Player: player
WarTable *-- "1" Player: player
WarTable *-- "1" Player: house

Table *-- "1" Deck: #deck

Deck *-- "0..53" Card: cards

Player *-- "0..*" Card: -hand
BlackjackPlayer *-- "2.." Card: -hand
PorkerPlayer *-- "5" Card: -hand
SpeedPlayer *-- "0..25" Card: -hand
WarPlayer *-- "1" Card: -hand
Player ..> GameDecision
BlackjackPlayer ..> GameDecision
PorkerPlayer ..> GameDecision
SpeedPlayer ..> GameDecision
WarPlayer ..> GameDecision


    class Table {
        <<Abstract>>
        -List~int~ betDenominations
        #int turnCounter
        -string gamePhase
        -List~string~ resultsLog
        #Deck deck
        -Abstract List~Player~ players

        +Abstract assignPlayerHands() void
        +Abstract clearPlayerHandsAndBets() void
        +Abstract evaluateMove(Player player) void
        +Abstract getTurnPlayer() Player
        +Abstract haveTurn() void
        +Abstract evaluateAndGetRoundResults() string
        +isLastPlayer() bool
    }

    class BlackjackTable {
        -isBlackjack(Player) bool
        -isAllPlayerActionsResolved() bool
    }

    class PorkerTable {
    }

    class SpeedTable {
        - List~Card~ LeadCards
        - List~Deck~ PlayerDeck

        -DealLeadCards() void
    }

    class WarTable {

    }

    class Player {
        <<Abstract>>
        -string name
        -string playerType
        -int chips
        -int bet
        -int winAmount
        -string gameStatus
        -List~Card~ hand

        + Abstract promptPlayer(int nullable userData) GameDecision
        + Abstract getHandScore() int
    }

    class BlackjackPlayer{

    }

    class PorkerPlayer{
        + getHandRank() number
    }


    class SpeedPlayer {
    }

    class WarPlayer {
    }

    class Card {
        -string suit
        -string rank

        +getRankNumber(string gameType) int
    }

    class Deck {
        -string gameType
        -List~Card~ Cards

        +shuffle() void
        +drawOne() Card
        +resetDeck() void
    }

    %% どのようなベットやアクションを取るべきかというプレイヤーの決定を表すクラス
    class GameDecision {
        - string action
        - int amount
    }
```

## クラスの説明

### Table

|  関数名・変数名  |  説明  |
| :--: | :--: |
|  betDenominations	|  テーブルで可能なベット金額の単位を表す整数の配列. <br>例えば、[5, 20, 50, 100]など. プレイヤーはこれらの値を組み合わせて任意のベット額を作成することが可能.|
| turnConter | 現在のターン数を表す数値. 0から始まり各ターンが終了するたびにインクリメントされる.<br> 複数人対戦の場合, 現在のプレイヤーを判断するために使用される. |
| gamePhase | ゲームの段階を表す. <br>ゲームごとに設定するが, Blackjackの場合, {'betting', 'acting', 'evaluatingWinner','roundOver', 'endOfGame'}のどれか. |
|  resultsLog  |  各ラウンド終了時のハウス以外の全プレイヤーの状態を、文字列の配列の形で記録する.  |
| assignPlayerHands() | 各プレイヤーに手札を配る. |
| clearPlayerHandsAndBets() | 各ラウンド開始時に実行され, 各プレイヤーの手札とベットを初期化する. |
| evaluateMove(Player player) |Table.haveTurn()内で呼ぶ関数. <br>引数のPlayer.promptPlayer()から現在のプレーヤーのgameDecision(ベット方法やアクションなど)を受け取り,<br>それにしたがって、そのプレイヤーのベット、ハンド、GameStatus、チップの状態などを更新する. <br>例：blackjackでplayerが"hit"し, 手札が21以上のとき, player.gameStatusを'bust'にし,チップからベットを引く. |
| getTurnPlayer() | 現在のターンが誰のものかを返す. evaluateMove()とともに使用する. |
| haveTurn() | ラウンドロビン形式のゲームで、各ターンを管理する役割. <br> 最初に現在のゲームの段階(gamePhase)を確認する. <br> その後, getTurnPlayer()を用いて現在のプレイヤーを特定し, Player.promptPlayer()を使って, そのプレイヤーに行動を促す. <br> プレイヤーの行動(gameDecisionオブジェクト)はevaluateMove()によって評価され, プレイヤー・ゲーム状態が更新される. <br> 最後にターン数(turnCounter)を一つ増やす. |
| evaluateAndGetRoundResults() | ラウンド終了時にresultLsLogを更新する関数. 詳細は各ゲームに記載. |
| isLastPlayer() | プレイヤー配列の最後のプレイヤーかチェックする関数. <br> haveTurnで使用されゲームの段階を切り替える(gamePhase='betting'→'acting'). |


### BlackJackTable

| 関数名・変数名 | 説明 |
| :--: | :--: |
| evaluateAndGetRoundResults() | すべてのプレイヤーのアクションが終わり, <br>現在のプレイヤーがプレイヤーの配列の最後のプレイヤーである場合に呼び出される.<br>このメソッドは、ブラックジャックの勝敗判定ルールに従ってプレイヤーを更新し, <br>ラウンドが終了してテーブルがクリアされる前の各プレイヤーの状態を表す文字列を返す. <br>この返された文字列は、Table.resultsLogに追加される. <br> gameStatusが'bust'となっているプレイヤーなど, <br>既にラウンドが決定しているプレイヤーは一切更新されない。 |
| isBlackjack(Player) | プレイヤーの手札がブラックジャック(21ちょうど)かどうかを判定する. |
| isAllPlayerActionsResolved() | 全てのプレイヤーがセット{'broken', 'bust', 'stand'}の<br>Player.gameStatusを持っていればtrueを返し,持っていなければfalseを返す. <br>ハウスを含むプレイヤーは何度も'hit'し続ける可能性があるので, <br>'acting'フェーズがいつ終わるか把握する必要がある。 |

### Speedtable

| 関数名・変数名 | 説明 |
| :--: | :--: |
| LeadCards | 台札2枚 |
| PlayerDeck | プレイヤーとhouseの山札を管理するリスト. |
| DealLeadCards() | ゲームの初めや一定時間経過後に, 台札にカードを置く.<br> 山札がない場合は手札からだす.|


### Player
| 関数名・変数名 | 説明 |
| :--: | :--: |
| playerType | プレイヤーの種類を表す. 例：AI, house, user|
| chips | 所持しているチップの数 |
| bet | 現在のゲームに賭けたチップの数 |
| winAmount | 各ラウンド終了時の勝ち負け金額を表す. <br> chipsと同様に処理を行うが各ラウンドの結果表示の際に用いられる. |
| gameStatus | プレイヤーの状態を表す. 詳細は各ゲームを参照. |
| hand | playerの手札 |
| promtPlayer() | TableのgamePhaseとPlayerのplayerTypeに応じて, <br>各Playerが取る行動をGameDecisionクラスのオブジェクトとして返す. |
| getHandScore() | 手札の合計値をゲームの種類に合わせて計算. CardクラスのgetRankNumberメソッドを用いる. | 

### BlackjackPlayer

| 関数名・変数名 | 説明 |
| :--: | :--: |
| gameStatus | プレイヤーの状態を表す. {'ready', 'bet', 'stand', 'hit', 'bust'}のどれか。 |

### PokerPlayer

| 関数名・変数名 | 説明 |
| :--: | :--: |
| getHandRank() | 手札の役の強さを判定する. |


### GameDecision

| 関数名・変数名 | 説明 |
| :--: | :--: |
| action | 各ゲームで取りうるアクション.<br> -Blackjack: {'bust', 'bet', 'stand', 'hit', 'blackjack'} <br> -Porker: {'bet', 'check', 'call', 'raise', 'drop', 'draw'}<br>-Speed: {}<br>-War: {}|
| amount | betのアクションがあるゲームでは、bet金額. |

### Deck
| 関数名・変数名 | 説明 |
| :--: | :--: |
| shuffle() | gameTypeごとに必要になるCardを格納した, 配列をランダムにシャッフルする関数. |
| drawOne() | Cardの配列からpopして先頭1枚のCardを取り出す関数. |
| resetDeck() | gameTypeごとに適したCardを格納した配列を初期化する関数. |

### Card
| 関数名・変数名 | 説明 |
| :--: | :--: |
| suit | カードの種類(ダイヤ・スペード・クローバー・ハート) |
| rank | カードの数字(A,2,3,...Q,K) |
| getRankNumber(string gameType) | gemeType(ゲームの種類)を受け取り, カードのrankを数字にして返す関数. <br> 例えば, Blackjackの場合, rankがJ,Q,Kのとき, 整数10を返す. |