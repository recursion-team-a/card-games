# card-games

## 技術スタックの構成図
![sample](https://github.com/recursion-team-a/card-games/assets/99064128/d4a30c91-cbe6-4a9f-b46b-abfa76193cb2)

![Slice 1 (1)](https://github.com/recursion-team-a/card-games/assets/127278864/09112875-217e-482f-83e2-c5b90b5d1adb)

## アクティビティ図
Subがついているのはサブアクティビティ
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
- CPUレベルに応じた処理
- SurrenderやDoubleの追加ルールの実装

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
    I --> J{Total exceeds 21?}
    J --No--> G
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
- カードの強さはAが最も強く, その他は数字が大きい方が強い
- CPUレベルに応じた処理

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

        +assignPlayerHands() void
        +clearPlayerHandsAndBets() void
        +Abstract evaluateAndGetRoundResults() string
        +Abstract evaluateMove(Player player) void
        +Abstract getTurnPlayer() Player
        +Abstract haveTurn() void
        +isFirstPlayer() bool
        +isLastPlayer() bool
    }

    class BlackjackTable {
        -isBlackjack(Player) bool
        -isAllPlayerActionsResolved() bool
        -getHandScore(Player) int
    }

    class PorkerTable {
        -getHandScore(Player) int
    }

    class SpeedTable {

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

        + Abstract promptPlayer(int nullable userData) GameDecision
        + Abstract getHandScore() int
    }

    class BlackjackPlayer{
        -getAIBetGameDecision() GameDecision
        -getAIActionGameDecision() GameDecision
        -getUserActionGameDecision() GameDecision
        -getHouseActionGameDecision() GameDecision
    }

    class PorkerPlayer{
        -getAIBetGameDecision() GameDecision
        -getAIActionGameDecision() GameDecision
        -getUserActionGameDecision() GameDecision
    }

    
    class SpeedPlayer {
        -getUserActionGameDecision() GameDecision
        -getHouseActionGameDecision() GameDecision
    }

    class WarPlayer {
        -getUserActionGameDecision() GameDecision
        -getHouseActionGameDecision() GameDecision
    }

    class Card {
        -string suit
        -string rank

        +getRankNumber(string gameType) int
    }

    class Deck {
        -string gameType

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
|  betDenominations	|  テーブルで可能なベット金額の単位を表す整数の配列. <br>例えば、[5, 20, 50, 100]など. |
|  resultLog  |  	各ラウンド終了時のハウス以外の全プレイヤーの状態を、文字列の配列の形で記録する.  |
| turnConter | ラウンドロビン形式のゲームで現在ターンのプレイヤーを識別するためのカウンター |
| evaluateMove() |Table.haveTurn()内で呼ぶ関数. <br>Player.promptPlayer()から現在のプレーヤーのgameDecision(ベット方法やアクションなど)を受け取り,<br>それにしたがって、そのプレイヤーのベット、ハンド、GameStatus、チップの状態などを更新する |
| haveTurn() | ラウンドロビン形式のゲームで、ゲームフローの制御とテーブルの状態を更新する |


### BlackJackTable

| 関数名・変数名 | 説明 |
| :--: | :--: |
| gamePhase | ゲームの段階を表す. {'betting', 'acting', 'roundOver', 'endOfGame'}のどれか. |
| assignPlayerHands() | 各プレイヤーにカードを2枚ずつ配布する. |
| evaluateAndGetRoundResults() | すべてのプレイヤーのアクションが終わり, <br>現在のプレイヤーがプレイヤーの配列の最後のプレイヤーである場合に呼び出される.<br>このメソッドは、ブラックジャックの勝敗判定ルールに従ってプレイヤーを更新し, <br>ラウンドが終了してテーブルがクリアされる前の各プレイヤーの状態を表す文字列を返す. <br>この返された文字列は、Table.resultsLogに追加される. <br> gameStatusが'bust'となっているプレイヤーなど, <br>既にラウンドが決定しているプレイヤーは一切更新されない。 |
| isAllPlayerActionsResolved() | 全てのプレイヤーがセット{'broken', 'bust', 'stand'}の<br>Player.gameStatusを持っていればtrueを返し,持っていなければfalseを返す. <br>ハウスを含むプレイヤーは何度も'hit'し続ける可能性があるので, <br>'acting'フェーズがいつ終わるか把握する必要がある。 |


### Player
| 関数名・変数名 | 説明 |
| :--: | :--: |
| promtPlayer() | TableのgamePhaseとPlayerのplayerTypeに応じて, <br>各Playerが取る行動をGameDecisionクラスのオブジェクトとして返す. |


### BlackjackPlayer

| 関数名・変数名 | 説明 |
| :--: | :--: |
| gameStatus | プレイヤーの状態を表す. {'ready', 'bet', 'stand', 'hit', 'bust'}のどれか。 |
| getAIBetGameDecision() | Table.promptPlayer()内で呼ぶ関数. <br>AIのベット金額を決める. <br>所持金からベット可能な金額をランダムに決定する. |
| getAIActionGameDecision() | Table.promptPlayer()内で呼ぶ関数. AIのアクションを決める. <br>所持金を考慮し、{'hit', 'stand'}の候補からアクションをランダムに決定する. |
| getUserActionGameDecision() | Table.promptPlayer()内で呼ぶ関数. <br>Userのアクションを決める. <br>所持金を考慮し、{'hit', 'stand'}の候補からアクションを決定する. <br>bustしない限り、hitは何度でもできる. |
| getHouseActionGameDecision() | Table.promptPlayer()内で呼ぶ関数. <br>Houseのアクションを決める.<br>持ち札のスコアが17未満であれば、17以上になるまで、Hitを続ける |


### GameDecision

| 関数名・変数名 | 説明 |
| :--: | :--: |
| action | 各ゲームで取りうるアクション.<br> -Blackjack: {'bust', 'bet', 'stand', 'hit', 'blackjack'} <br> -Porker: {'bet', 'check', 'call', 'raise', 'drop', 'draw'}<br>-Speed: {}<br>-War: {}|
| userData | betのアクションがあるゲームでは、bet金額. |




