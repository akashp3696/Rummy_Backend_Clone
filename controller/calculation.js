module.exports.calculatePlayerScore = (playerCards, jokerRank) => {
    const pureSequences = [];
    const impureSequences = [];
    const isSets = [];
    const invalid = [];

    for (const cards of playerCards) {
        if (isPureSequence(cards)) {
            pureSequences.push(cards);
        } else if (isImpureSequence(cards, jokerRank)) {
            impureSequences.push(cards);
        } else if (isSet(cards, jokerRank)) {
            isSets.push(cards);
        } else {
            invalid.push(cards)
        }
    }
    // console.log(pureSequences);
    // console.log(impureSequences);
    // console.log(isSets);
    // console.log(invalid);

    if (pureSequences.length === 0) {
        return {
            pureSequences,
            impureSequences,
            isSets,
            invalid,
            score: calculationScore(playerCards, jokerRank)
        };
    }

    if (pureSequences.length + impureSequences.length >= 2 && invalid.length === 0) {
        return {
            pureSequences,
            impureSequences,
            isSets,
            invalid,
            score: 0
        };
    }

    if (pureSequences.length + impureSequences.length >= 2 && invalid.length !== 0) {
        return {
            pureSequences,
            impureSequences,
            isSets,
            invalid,
            score: calculationScore(invalid, jokerRank)
        };
    }

    if (pureSequences.length + impureSequences.length < 2) {
        return {
            pureSequences,
            impureSequences,
            isSets,
            invalid,
            score: calculationScore([...impureSequences, ...isSets, ...invalid], jokerRank)
        };
    }

    return {
        pureSequences,
        impureSequences,
        isSets,
        invalid,
        score: 0
    };
};



const isPureSequence = (sequence) => {
    if (sequence.length < 3) {
        return false;
    }
    const firstSuit = sequence[0].suit;
    if (sequence.some(card => card.suit !== firstSuit)) {
        return false;
    }

    const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

    sequence.sort((a, b) => {
        return ranks.indexOf(a.rank) - ranks.indexOf(b.rank);
    });
    if (sequence[0].rank == "A" && sequence[1].rank != "K") {
        const reversedSequence = sequence.slice(1).reverse();
        for (let i = 0; i < reversedSequence.length; i++) {
            if (Number(reversedSequence[i].rank) != i + 2) {
                return false
            }
        }
    }
    else {
        for (let i = 1; i < sequence.length; i++) {
            const currentRankIndex = ranks.indexOf(sequence[i].rank);
            const previousRankIndex = ranks.indexOf(sequence[i - 1].rank);
            if (currentRankIndex !== previousRankIndex + 1) {
                return false
            }
        }
    }
    return true;
};

const isImpureSequence = (sequence, specialJokerRank) => {
    if (sequence.length < 3) {
        return false;
    }

    const normalSequence = [];
    const jokerSequence = [];
    for (let card of sequence) {
        if (card.rank === "Joker" || card.rank === specialJokerRank) {
            jokerSequence.push(card);
        } else {
            normalSequence.push(card);
        }
    }
    if(sequence.length == jokerSequence.length){
        return true;
    }
    if(normalSequence.length>0){
        const firstSuit = normalSequence[0].suit;
        if (normalSequence.some(card => card.suit !== firstSuit)) {
            return false;
        }
    }
    const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    normalSequence.sort((a, b) => {
        return ranks.indexOf(a.rank) - ranks.indexOf(b.rank);
    });
    if (normalSequence.length>0 && normalSequence[0].rank == "A" && normalSequence.find(card => ranks.indexOf(card.rank) >= normalSequence.length + jokerSequence.length) != undefined) {
        const reversedSequence = normalSequence.slice(1).reverse();
        for (let i = 0; i < reversedSequence.length; i++) {
            if (Number(reversedSequence[i].rank) !== i + 2) {
                const missingCards = Number(reversedSequence[i].rank) - (i + 2);
                if (missingCards <= jokerSequence.length) {
                    jokerSequence.splice(0, missingCards);
                } else {
                    return false;
                }
            }
        }
    } else {
        let jokerCount = jokerSequence.length;
        let previousRankIndex = ranks.indexOf(normalSequence[0].rank);
        for (let i = 1; i < normalSequence.length; i++) {
            const currentRankIndex = ranks.indexOf(normalSequence[i].rank);
            // console.log(currentRankIndex, previousRankIndex);
            if (currentRankIndex !== previousRankIndex + 1) {
                const missingCards = currentRankIndex - previousRankIndex - 1;
                if (missingCards <= jokerCount && currentRankIndex !== previousRankIndex) {
                    jokerCount -= missingCards;
                } else {
                    return false;
                }
            }
            previousRankIndex = currentRankIndex;
        }
    }
    return true;
};

const isSet = (set, specialJokerRank) => {
    if (set.length < 3 || set.length > 4) {
        return false;
    }
    const normalCards = set.filter(card => card.rank !== "Joker" && card.rank !== specialJokerRank);
    const jokers = set.filter(card => card.rank === "Joker" || card.rank === specialJokerRank);
    if (jokers.length === set.length) {
        return true
    }
    const firstRank = normalCards[0].rank;
    if (!normalCards.every(card => card.rank === firstRank)) {
        return false;
    }
    const suits = new Set(normalCards.map(card => card.suit));
    if (suits.size !== normalCards.length) {
        return false;
    }
    return true;
};

const calculationScore = (playerCards, jokerRank) => {
    let totalScore = 0;
    for (const cards of playerCards) {
        for (const card of cards) {
            if (card.rank !== "Joker" && card.rank !== jokerRank) {
                if (card.rank === 'A' || card.rank === 'K' || card.rank === 'Q' || card.rank === 'J') {
                    totalScore += 10;
                } else {
                    // For other ranks, assign scores based on the rank
                    totalScore += parseInt(card.rank);
                }
            }
        }
    }
    return Math.min(totalScore, 80);
}

