import Card from "./card";


export default class Deck {
    gameType: string;
    cards: Card[];

    constructor(gameType: string){
        // ゲームの種類
        this.gameType = gameType;
        // カードの配列
        this.cards = [];
        // デッキの生成
        this.generateDeck();
    }

    generateDeck(): void {
        // if(this.gameType == ??)等でゲームの種類に応じて変更可能
        // 現時点では, どのゲームも52枚で<List>cardsを生成
        const suits = ['♥︎', '♦', '♣', '♠'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        for (let i = 0; i < suits.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                this.cards.push(new Card(suits[i], ranks[i]));
            }
        }
    }

    shuffle(): void {
        
    }

    
}