// 1 Deal == 2 Player
// 2 Deal == 2 Player
// 3 Deal == 6 Player

// 1, 2 Deal == 1 Decks + 1 Joker
// 3 Deal    == 2 Decks + 2 Joker
// Drop Point == First 20, Mid 40, Full 80
// every user got 160 pts on start
// after complete all deals which get higher point then whose player is won
const { Deal } = require("../practicegamemodel/dealPracticeGameModel")
const { calculatePlayerScore } = require("../controller/calculation");
const { updateUserBalanceChip:updateUserBalance, updateUserWithdramwalAmountChip:updateUserWithdramwalAmount } = require('../helper/userDummyBalance');

const handleJoin = async (userId, point, tableType) => {
    try {
        if (!userId || !point || !tableType) {
            return { message: "userID, point, and tableType are required." };
        }

        let maxPlayers;
        let dealType;
        switch (tableType) {
            case "1_deal":
                maxPlayers = 2;
                dealType = 1;
                break;
            case "2_deal":
                maxPlayers = 2;
                dealType = 2;
                break;
            case "3_deal":
                maxPlayers = 6;
                dealType = 3;
                break;
            default:
                return { message: "Invalid tableType. Only '1_deal', '2_deal', and '3_deal' are allowed." };
        }

        let deal = await Deal.findOne({ isActive: true, point, tableType, currentPlayerIndex: 0 }).sort({ createdAt: -1 });
        // console.log(deal);
        if (!deal) {
            deal = new Deal({
                players: [{ userId }],
                openDeck: [],
                closedDeck: [],
                discardedCards: [],
                isActive: true,
                point,
                tableType,
                dealType,
            });
            const balanceUpdate = await updateUserBalance(userId, point, 'debit', "deal");
            if (balanceUpdate.error) {
                console.log(balanceUpdate.error);
                return balanceUpdate;
            }
            await deal.save();
        } else {
            if (deal.players.some(player => player.userId.toString() == userId)) {
                return deal
            }
            if (deal.players.length >= maxPlayers) {
                deal = new Deal({
                    players: [{ userId }],
                    openDeck: [],
                    closedDeck: [],
                    discardedCards: [],
                    isActive: true,
                    point,
                    tableType,
                    dealType,
                });
                const balanceUpdate = await updateUserBalance(userId, point, 'debit', "deal");
                if (balanceUpdate.error) {
                    console.log(balanceUpdate.error);
                    return balanceUpdate;
                }
                await deal.save();
            }
            else {
                deal.players.push({ userId });
                const balanceUpdate = await updateUserBalance(userId, point, 'debit', "deal");
                if (balanceUpdate.error) {
                    console.log(balanceUpdate.error);
                    return balanceUpdate;
                }
                await deal.save();
            }
        }
        console.log(`User ${userId} with point ${point} joined the deal`);
        await deal.populate('players.userId', "_id name email")
        return deal;
    } catch (error) {
        console.error('Error joining the deal:', error);
        return { message: "An error occurred while joining the deal." };
    }
};



const handleLeave = async (dealId, userId) => {
    try {
        const deal = await Deal.findById(dealId);
        if (deal) {
            const playerIndex = deal.players.findIndex(player => player.userId.toString() === userId.toString());
            if (playerIndex !== -1) {
                const amount = deal.point
                const balanceUpdate = await updateUserBalance(userId, amount, 'credit', "deal");
                if (balanceUpdate.error) {
                    console.log(balanceUpdate.error);
                    return balanceUpdate;
                }
                deal.players.splice(playerIndex, 1);
                if (deal.players.length === 0) {
                    await Deal.deleteOne({ _id: dealId });
                    console.log(`Deal ${dealId} deleted as the last player left`);
                    return { message: `Deal ${dealId} deleted as the last player left` };
                    // return deal
                } else {
                    await deal.save();
                    console.log(`User ${userId} left the deal`);
                    // return { message: `User ${userId} left the deal` };
                    return deal
                }
            } else {
                console.log(`User ${userId} not found in the deal`);
                return { message: `User ${userId} not found in the deal` };
            }
        } else {
            return { message: `Deal not found with ID: ${dealId}` };
        }
    } catch (error) {
        console.error('Error leaving the deal:', error);
        return { message: "An error occurred while leaving the deal." };
    }
};


const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const generateShuffledDeck = (includeJoker = false) => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    if (includeJoker) {
        deck.push({ suit: 'joker', rank: "Joker" });
    }
    return shuffleArray(deck);
};

const generateShuffledDeck2 = () => {
    return generateShuffledDeck(true);
};

const generateShuffledDeck3 = () => {
    return shuffleArray([...generateShuffledDeck(true), ...generateShuffledDeck(true)]);
};

const generateJokerRank = () => {
    const jokerRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const randomIndex = Math.floor(Math.random() * jokerRanks.length);
    return jokerRanks[randomIndex];
};

const distributeCards = async (DealId, currentPlayerIndex) => {
    try {
        console.log(currentPlayerIndex);
        if (currentPlayerIndex < 1 || currentPlayerIndex > 3 || !currentPlayerIndex) {
            return { message: "Index should be 1 to 3." }
        }
        // Find the Deal by ID
        const deal = await Deal.findById(DealId);
        if (!deal) {
            console.error('Deal not found');
            return { message: "Deal not found" };
        }
        if (currentPlayerIndex > deal.dealType) {
            return { message: `Current player index (${currentPlayerIndex}) cannot be greater than deal type (${deal.dealType}).` };
        }
        if (currentPlayerIndex == deal.dealType) {
            return { message: `Current player index (${currentPlayerIndex}) cannot be same of Privious game Index.` };
        }
        let deck = generateShuffledDeck();
        for (const player of deal.players) {
            const startCard = deck.pop();
            player.startCard = startCard;
        }
        deal.currentPlayerIndex = currentPlayerIndex;
        deal.isActive = false;
        await deal.save();
        console.log('Cards distributed successfully');
        await deal.populate('players.userId', "_id name email")
        return deal;
    } catch (error) {
        console.error('Error distributing cards:', error);
        return { message: "Failed to distribute cards" }
    }
};

const initializeGame = async (dealId) => {
    try {
        const deal = await Deal.findById(dealId);
        if (!deal) {
            console.error('Deal not found');
            return { message: "Deal not found" };
        }
        deal.openDeck = [];
        deal.closedDeck = [];
        const jokerRank = generateJokerRank();
        deal.joker = jokerRank;
        switch (deal.tableType) {
            case "1_deal":
            case "2_deal":
                const singleDeck = generateShuffledDeck2();
                deal.openDeck.push(singleDeck.pop());
                deal.closedDeck = singleDeck;
                break;
            case "3_deal":
                const doubleDeck = generateShuffledDeck3();
                deal.openDeck.push(doubleDeck.pop());
                deal.closedDeck = doubleDeck;
                break;
            default:
                return { message: "Invalid deal type" };
        }
        for (const player of deal.players) {
            const deck = generateShuffledDeck2();
            for (let i = 0; i < 13; i++) {
                const card = deck.pop();
                player.cards.push(card);
            }
        }
        await deal.save();
        console.log('Game initialized successfully');
        await deal.populate('players.userId', "_id name email")
        return deal;
    } catch (error) {
        console.error('Error initializing game:', error);
        return { message: "Failed to initialize game" }
    }
};


const pickFromOpenDeck = async (dealId, playerId) => {
    try {
        const deal = await Deal.findById(dealId);
        if (!deal) {
            console.error('Deal not found');
            return { message: "Deal not found" };
        }

        const player = deal.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return { message: "Player not found" };
        }

        const pickedCard = deal.openDeck.pop();
        if (!pickedCard) {
            console.error('No card left in the open deck');
            return { message: "No card left in the open deck" };
        }

        player.cards.push(pickedCard);
        await deal.save();
        console.log('Card picked from the open deck');
        await deal.populate('players.userId', "_id name email")
        return deal;
    } catch (error) {
        console.error('Error picking card from the open deck:', error);
        return { message: "Failed to pick card from the open deck" };
    }
};

const pickFromClosedDeck = async (dealId, playerId) => {
    try {
        const deal = await Deal.findById(dealId);
        if (!deal) {
            console.error('Deal not found');
            return { message: "Deal not found" };
        }

        const player = deal.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return { message: "Player not found" };
        }

        if (deal.closedDeck.length <= 1) {
            deal.closedDeck.push(...shuffleArray(deal.openDeck));
            deal.openDeck = [];
        }

        const pickedCard = deal.closedDeck.pop();
        if (!pickedCard) {
            console.error('No card left in the closed deck');
            return { message: "No card left in the closed deck" };
        }

        player.cards.push(pickedCard);
        await deal.save();
        console.log('Card picked from the closed deck');
        await deal.populate('players.userId', "_id name email")
        return deal;
    } catch (error) {
        console.error('Error picking card from the closed deck:', error);
        return { message: "Failed to pick card from the closed deck" };
    }
};

const discardCard = async (dealId, playerId, cardId) => {
    try {
        const deal = await Deal.findById(dealId);
        if (!deal) {
            console.error('Deal not found');
            return { message: "Deal not found" };
        }
        const player = deal.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return { message: "Player not found" };
        }

        const index = player.cards.findIndex(card => card._id.toString() === cardId);
        if (index === -1) {
            console.error('Card not found in player\'s hand');
            return { message: "Card not found in player's hand" };
        }

        const discardedCard = player.cards.splice(index, 1)[0];
        console.log(discardedCard);
        deal.openDeck.push(discardedCard);
        await deal.save();
        console.log('Card discarded successfully');
        await deal.populate('players.userId', "_id name email")
        return deal;
    } catch (error) {
        console.error('Error discarding card:', error);
        return { message: "Failed to discard card" };
    }
};


const handleDrop = async (dealId, playerId, isStart) => {
    try {
        const deal = await Deal.findById(dealId);
        if (!deal) {
            console.error('Deal not found');
            return { message: "Deal not found" };
        }
        const player = deal.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return { message: "Player not found" };
        }
        if (isStart) {
            player.score -= 20;
            player.currentDealScore = 20;
        } else {
            player.score -= 40;
            player.currentDealScore = 40;
        }
        player.isDrop = true;
        await player.save();
        deal.gameScores.push({
            player: playerId,
            score: player.currentDealScore,
            currentIndex: deal.currentPlayerIndex
        });
        await deal.save();
        console.log('Player dropped successfully');
        await deal.populate('players.userId', "_id name email")
        return deal;
    } catch (error) {
        console.error('Error handling drop:', error);
        return { message: "Failed to handle drop" };
    }
};

const handleDeclare = async (dealId, playerId, cards) => {
    try {
        const deal = await Deal.findById(dealId);
        if (!deal) {
            console.error('Deal not found');
            return { message: "Deal not found" };
        }
        const player = deal.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return { message: "Player not found" };
        }
        const { pureSequences, impureSequences, isSets, invalid, score } = calculatePlayerScore(cards, deal.joker);
        player.pureSequences = pureSequences;
        player.impureSequences = impureSequences;
        player.isSets = isSets;
        player.invalid = invalid;
        player.score -= score;
        player.currentDealScore = score;
        await player.save();

        deal.gameScores.push({
            player: playerId,
            score: score,
            currentIndex: deal.currentPlayerIndex,
            isWinner: score === 0
        });
        if (score === 0) {
            deal.winner = playerId;
        }
        await deal.save();
        console.log('Player declared successfully');
        await deal.populate('players.userId', "_id name email")
        return deal;
    } catch (error) {
        console.error('Error handling declare:', error);
        return { message: "Failed to handle declare" };
    }
};

const handleShow = async (dealId, playerId, cards, isStart) => {
    try {
        const deal = await Deal.findById(dealId);
        if (!deal) {
            console.error('Deal not found');
            return { message: "Deal not found" };
        }
        const player = deal.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return { message: "Player not found" };
        }
        const { pureSequences, impureSequences, isSets, invalid, score } = calculatePlayerScore(cards, deal.joker);
        player.pureSequences = pureSequences;
        player.impureSequences = impureSequences;
        player.isSets = isSets;
        player.invalid = invalid;
        if (isStart) {
            player.score -= Number(score) / 2;
            player.currentDealScore = Number(score) / 2;
        } else {
            player.score -= score;
            player.currentDealScore = score;
        }
        await player.save();
        // Update gameScores
        deal.gameScores.push({
            player: playerId,
            score: player.currentDealScore,
            currentIndex: deal.currentPlayerIndex
        });
        await deal.save();
        console.log('Player showed successfully');
        await deal.populate('players.userId', "_id name email")
        return deal;
    } catch (error) {
        console.error('Error handling show:', error);
        return { message: "Failed to handle show" };
    }
};

const selectWinner = async (dealId) => {
    try {
        let deal = await Deal.findById(dealId);
        if (!deal) {
            console.error('Deal not found');
            return { message: "Deal not found" };
        }
        const undropPlayer = deal.players.filter(player => !player.isDrop);
        if (undropPlayer.length === 1) {
            deal.gameScores.push({
                player: undropPlayer[0].userId,
                score: 0,
                currentIndex: deal.currentPlayerIndex,
                isWinner: true
            })
        }
        const currentGameScores = deal.gameScores.filter(score => score.currentIndex === deal.currentPlayerIndex);
        const winnerScores = currentGameScores.find(score => score.isWinner);
        const winnerPlayerId2 = winnerScores.player;
        // Sum up scores for non-winners and reset their scores
        let nonWinnerTotalScore = 0;
        for (const score of currentGameScores) {
            if (!score.isWinner) {
                nonWinnerTotalScore += score.score;
                score.score = 0;
            }
        }
        // Update winner's score by adding the sum of non-winners' scores
        const winnerPlayer = deal.players.find(player => player.userId.toString() === winnerPlayerId2.toString());
        winnerPlayer.score += nonWinnerTotalScore;

        let highestScore = 0;
        let winnerPlayerId = null;
        for (const player of deal.players) {
            if (player.score > highestScore) {
                highestScore = player.score;
                winnerPlayerId = player._id.toString();
            }
        }
        if (deal.dealType == deal.currentPlayerIndex) {
            if (!winnerPlayerId) {
                return null
            }
            let totalPlayer = Number(deal.players) - 1;
            const creditAmount = Number(totalPlayer) * Number(deal.point) * .85
            const balanceUpdate = await updateUserWithdramwalAmount(winnerPlayerId, creditAmount, 'credit', 'deal');
            if (balanceUpdate.error) {
                return balanceUpdate;
            }

        }
        // Set the winner and increase currentPlayerIndex
        deal.winner = winnerPlayerId;
        deal.currentPlayerIndex += 1;
        await deal.save();
        console.log('Winner selected successfully');
        await deal.populate('players.userId', "_id name email")
        return deal;
    } catch (error) {
        console.error('Error selecting winner:', error);
        return { message: "Failed to select winner" };
    }
};


const resetGameData = async (dealId) => {
    try {
        const deal = await Deal.findById(dealId);
        if (!deal) {
            console.error('Deal not found');
            return { message: "Deal not found" };
        }
        for (const player of deal.players) {
            player.cards = [];
            player.sequences = [];
            player.sets = [];
            player.startCard = null;
            player.pureSequences = [];
            player.impureSequences = [];
            player.isSets = [];
            player.invalid = [];
            player.isDrop = false;
        }
        deal.openDeck = [];
        deal.closedDeck = [];
        deal.discardedCards = [];
        deal.currentPlayerIndex = deal.currentPlayerIndex + 1

        await deal.save();
        console.log('Game data reset successfully');
        await deal.populate('players.userId', "_id name email")
        return deal;
    } catch (error) {
        console.error('Error resetting game data:', error);
        return { message: "Failed to reset game data" };
    }
};











module.exports = { handleJoin, handleLeave, distributeCards, initializeGame, pickFromOpenDeck, pickFromClosedDeck, discardCard, handleDrop, handleShow, handleDeclare, selectWinner, resetGameData }