export default class Card {
    suit: string;
    rank: string;

    constructor(suit: string, rank: string){
        this.suit = suit;
        this.rank = rank;
    }
    
    // カードのゲームごとの強さを整数で返す
    getRankNumber(gameType: string): number{
        let rankToNumber;
        switch (gameType){
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
                    K: 10
                };
                break;
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
                    K: 13
                };
                break;
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
                    K: 13
                };
                break;
        }
        return rankToNumber[this.rank] ?? 0; // if runktoNumber[this.rank] is undefined, the function returns 0
    }
}
