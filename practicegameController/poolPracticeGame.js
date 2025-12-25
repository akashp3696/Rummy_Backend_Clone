const { Pool } = require("../practicegamemodel/poolPracticeGameModel")
const { calculatePlayerScore } = require("../controller/calculation")
const userDB = require("../models/userModel");
const { updateUserBalanceChip:updateUserBalance, updateUserWithdramwalAmountChip:updateUserWithdramwalAmount } = require('../helper/userDummyBalance');


const handleJoin = async (userId, point, tableType, poolType ) => {
    try {
        if (!userId || !point || !tableType || !poolType) {
            return { message: "userID, point, tableType, and poolType are required." };
        }
        
        let maxPlayers;
        switch (poolType) {
            case "2_player":
                maxPlayers = 2;
                break;
            case "6_player":
                maxPlayers = 6;
                break;
            default:
                return { message: "Invalid poolType. Only '2_player' and '6_player' are allowed." };
        }

        let dealType;
        switch (tableType) {
            case "101_pool":
                dealType = 1;
                break;
            case "201_pool":
                dealType = 2;
                break;
            case "61_pool":
                dealType = 3;
                break;
            default:
                return { message: "Invalid tableType. Only '101_pool', '201_pool', and '61_pool' are allowed." };
        }

        const findUser = await userDB.findById(userId)
        if(!findUser){
            return {message :"User Not found."}
        }

        // console.log('it is calling');
        let pool = await Pool.findOne({ isActive: true, point, tableType, poolType, currentPlayerIndex: 0 }).sort({ createdAt: -1 });
        if(!pool){
            pool = new Pool({
                players: [{ userId }],
                openDeck: [],
                closedDeck: [],
                discardedCards: [],
                isActive: true,
                point,
                tableType,
                poolType,
            });
            const balanceUpdate = await updateUserBalance(userId, point, 'debit', "pool");
            if (balanceUpdate.error) {
                console.log(balanceUpdate.error);
                return balanceUpdate;
            }
            await pool.save();
        }else{
            // console.log('call update');
            if (pool.players.some(player => player.toString() == userId)) {
                return { message: "User is already in the pool." };
            }
            // console.log('call update');

            if(pool.players.length >= maxPlayers){
                pool = new Pool({
                    players: [{ userId }],
                    openDeck: [],
                    closedDeck: [],
                    discardedCards: [],
                    isActive: true,
                    point,
                    tableType,
                    poolType,
                });
                const balanceUpdate = await updateUserBalance(userId, point, 'debit', "pool");
                if (balanceUpdate.error) {
                    console.log(balanceUpdate.error);
                    return balanceUpdate;
                }
                await pool.save();
            }
            else {
                const balanceUpdate = await updateUserBalance(userId, point, 'debit', "pool");
                if (balanceUpdate.error) {
                    console.log(balanceUpdate.error);
                    return balanceUpdate;
                }
                pool.players.push({ userId });
                await pool.save();
            }
        }
        await pool.populate('players.userId', "_id name email")
        console.log(`User ${userId} with point ${point} joined the pool`);
        return pool;
    } catch (error) {
        console.error('Error joining the pool:', error);
        return { message: "An error occurred while joining the pool." };
    }
};


const handleLeave = async (poolId, userId) => {
    try {
        const pool = await Pool.findById(poolId);
        if (pool) {
            const playerIndex = pool.players.findIndex(player => player.userId.toString() === userId.toString());
            if (playerIndex !== -1) {
                const amount = pool.point
                const balanceUpdate = await updateUserBalance(userId, amount, 'credit', "pool");
                if (balanceUpdate.error) {
                    console.log(balanceUpdate.error);
                    return balanceUpdate;
                }
                pool.players.splice(playerIndex, 1);
                if (pool.players.length === 0) {
                    await Pool.deleteOne({ _id: poolId });
                    console.log(`Pool ${poolId} deleted as the last player left`);
                    return { message: `Pool ${poolId} deleted as the last player left` };
                } else {
                    await pool.save();
                    console.log(`User ${userId} left the pool`);
                    return { message: `User ${userId} left the pool` };
                }
            } else {
                console.log(`User ${userId} not found in the pool`);
                return { message: `User ${userId} not found in the pool` };
            }
        } else {
            return { message: `Pool not found with ID: ${poolId}` };
        }
    } catch (error) {
        console.error('Error leaving the pool:', error);
        return { message: "An error occurred while leaving the pool." };
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


const distributeCards = async (poolId, currentPlayerIndex) => {
    try {
        console.log(currentPlayerIndex);
        if(currentPlayerIndex < 1 || !currentPlayerIndex){
            return {message:"Index not be 0."}
        }
        // Find the Pool by ID
        const pool = await Pool.findById(poolId);
        if (!pool) {
            console.error('Pool not found');
            return { message: "Pool not found" };
        }
        let deck = generateShuffledDeck();
        for (const player of pool.players) {
            const startCard = deck.pop();
            player.startCard = startCard;
        }
        pool.totalPlayer = pool.players.length
        pool.currentPlayerIndex = currentPlayerIndex;
        pool.isActive=false;
        await pool.save();
        await pool.populate('players.userId', "_id name email")
        console.log('Cards distributed successfully');
        return pool;
    } catch (error) {
        console.error('Error distributing cards:', error);
        return { message: "Failed to distribute cards" }
    }
};

const initializeGame = async (poolId) => {
    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            console.error('Pool not found');
            return { message: "Pool not found" };
        }
        pool.openDeck = [];
        pool.closedDeck = [];
        const jokerRank = generateJokerRank();
        pool.joker = jokerRank;
        switch (pool.poolType) {
            case "2_player":
                const singleDeck = generateShuffledDeck2();
                pool.openDeck.push(singleDeck.pop());
                pool.closedDeck = singleDeck;
                break;
            case "6_player":
                const doubleDeck = generateShuffledDeck3();
                pool.openDeck.push(doubleDeck.pop());
                pool.closedDeck = doubleDeck;
                break;
            default:
                return { message: "Invalid tableType" };
        }
        for (const player of pool.players) {
            const deck = generateShuffledDeck2();
            for (let i = 0; i < 13; i++) {
                const card = deck.pop();
                player.cards.push(card);
            }
        }
        await pool.save();
        await pool.populate('players.userId', "_id name email")
        console.log('Game initialized successfully');
        return pool;
    } catch (error) {
        console.error('Error initializing game:', error);
        return { message: "Failed to initialize game" }
    }
};


const pickFromOpenDeck = async (poolId, playerId) => {
    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            console.error('Pool not found');
            return { message: "Pool not found" };
        }

        const player = pool.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return { message: "Player not found" };
        }

        const pickedCard = pool.openDeck.pop();
        if (!pickedCard) {
            console.error('No card left in the open deck');
            return { message: "No card left in the open deck" };
        }

        player.cards.push(pickedCard);
        await pool.save();
        await pool.populate('players.userId', "_id name email")
        console.log('Card picked from the open deck');
        return pool;
    } catch (error) {
        console.error('Error picking card from the open deck:', error);
        return { message: "Failed to pick card from the open deck" };
    }
};

const pickFromClosedDeck = async (poolId, playerId) => {
    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            console.error('Pool not found');
            return { message: "Pool not found" };
        }

        const player = pool.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return { message: "Player not found" };
        }

        if (pool.closedDeck.length <= 1) {
            pool.closedDeck.push(...shuffleArray(pool.openDeck));
            pool.openDeck = [];
        }

        const pickedCard = pool.closedDeck.pop();
        if (!pickedCard) {
            console.error('No card left in the closed deck');
            return { message: "No card left in the closed deck" };
        }

        player.cards.push(pickedCard);
        await pool.save();
        await pool.populate('players.userId', "_id name email")
        console.log('Card picked from the closed deck');
        return pool;
    } catch (error) {
        console.error('Error picking card from the closed deck:', error);
        return { message: "Failed to pick card from the closed deck" };
    }
};

const discardCard = async (poolId, playerId, cardId) => {
    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            console.error('Pool not found');
            return { message: "Pool not found" };
        }
        const player = pool.players.find(p => p.userId.toString() === playerId);
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
        pool.openDeck.push(discardedCard);
        await pool.save();
        await pool.populate('players.userId', "_id name email")
        console.log('Card discarded successfully');
        return pool;
    } catch (error) {
        console.error('Error discarding card:', error);
        return { message: "Failed to discard card" };
    }
};


const handleDrop = async (poolId, playerId, isStart) => {
    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            console.error('Pool not found');
            return { message: "Pool not found" };
        }
        const player = pool.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return { message: "Player not found" };
        }
        if (isStart) {
            player.score += 20;
            player.currentDealScore = 20;
        } else {
            player.score += 40;
            player.currentDealScore = 40;
        }
        player.isDrop = true;
        await pool.save();
        pool.gameScores.push({
            player: playerId,
            score: player.currentDealScore,
            currentIndex: pool.currentPlayerIndex
        });
        await pool.save();
        await pool.populate('players.userId', "_id name email")
        console.log('Player dropped successfully');
        return pool;
    } catch (error) {
        console.error('Error handling drop:', error);
        return { message: "Failed to handle drop" };
    }
};

const tableTypeScores = {
    "101_pool": 101,
    "201_pool": 201,
    "61_pool": 61
};

const handleShow = async (poolId, playerId, cards, isStart) => {
    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            console.error('Pool not found');
            return { message: "Pool not found" };
        }

        const player = pool.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return { message: "Player not found" };
        }

        const { pureSequences, impureSequences, isSets, invalid, score } = calculatePlayerScore(cards, pool.joker);
        player.pureSequences = pureSequences;
        player.impureSequences = impureSequences;
        player.isSets = isSets;
        player.invalid = invalid;

        // Increase the player's score
        if (isStart) {
            player.score += Number(score) / 2;
            player.currentDealScore = Number(score) / 2;
        } else {
            player.score += score;
            player.currentDealScore = score;
        }

        await player.save();

        // Update gameScores
        pool.gameScores.push({
            player: playerId,
            score: player.currentDealScore,
            currentIndex: pool.currentPlayerIndex
        });

        await pool.save();

        console.log('Player showed successfully');

        // Get table score based on table type
        const tableScore = tableTypeScores[pool.tableType];

        // Eliminate players whose score exceeds the table score
        pool.players = pool.players.filter(p => p.score >= tableScore);

        // Check if there's only one player left, declare them as the winner
        if (pool.players.length === 1) {
            pool.winner = pool.players[0]._id;
        }

        await pool.save();
        await pool.populate('players.userId', "_id name email")

        console.log('Players eliminated successfully');
        return pool;
    } catch (error) {
        console.error('Error handling show:', error);
        return { message: "Failed to handle show" };
    }
};

const handleDeclare = async (poolId, playerId, cards) => {
    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            console.error('Pool not found');
            return { message: "Pool not found" };
        }

        const player = pool.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return { message: "Player not found" };
        }

        const { pureSequences, impureSequences, isSets, invalid, score } = calculatePlayerScore(cards, pool.joker);
        player.pureSequences = pureSequences;
        player.impureSequences = impureSequences;
        player.isSets = isSets;
        player.invalid = invalid;

        // Increase the player's score
        player.score += score;
        player.currentDealScore = score;

        await player.save();

        // Update gameScores
        pool.gameScores.push({
            player: playerId,
            score: score,
            currentIndex: pool.currentPlayerIndex,
            isWinner: player.score === 0
        });

        // Set winner if player's score is 0
        if (player.score === 0) {
            pool.winner = playerId;
        }

        await pool.save();

        console.log('Player declared successfully');

        // Get table score based on table type
        const tableScore = tableTypeScores[pool.tableType];

        // Eliminate players whose score exceeds the table score
        pool.players = pool.players.filter(p => p.score >= tableScore);

        // Check if there's only one player left, declare them as the winner
        if (pool.players.length === 1) {
            pool.winner = pool.players[0]._id;
        }
        await pool.save();
        await pool.populate('players.userId', "_id name email")

        console.log('Players eliminated successfully');
        return pool;
    } catch (error) {
        console.error('Error handling declare:', error);
        return { message: "Failed to handle declare" };
    }
};

const selectWinner = async (poolId) => {
    try {
        let pool = await Pool.findById(poolId);
        if (!pool) {
            console.error('Pool not found');
            return { message: "Pool not found" };
        }
        // this line added new
        pool.players = pool.players.filter(player => !player.isDrop);
        if (pool.players.length > 1) {
            console.error('Cannot select winner. There are not enough players.');
            return { message: "Cannot select winner. There are not enough players." };
        }
        if (pool.players.length === 1) {
            // Declare the remaining player as the winner
            pool.winner = pool.players[0]._id;
            let totalPlayer = Number(pool.totalPlayer) - 1;
            const creditAmount = Number(totalPlayer) * Number(pool.point) * .85
            const balanceUpdate = await updateUserWithdramwalAmount(winnerPlayerId, creditAmount, 'credit', 'deal');
            if (balanceUpdate.error) {
                return balanceUpdate;
            }
        }
        pool.currentPlayerIndex += 1;
        await pool.save();
        await pool.populate('players.userId', "_id name email")
        console.log('Winner selected successfully');
        return pool;
    } catch (error) {
        console.error('Error selecting winner:', error);
        return { message: "Failed to select winner" };
    }
};


const resetGameData = async (poolId) => {
    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            console.error('Pool not found');
            return { message: "Pool not found" };
        }
        for (const player of pool.players) {
            player.cards = [];
            player.sequences = [];
            player.sets = [];
            player.pureSequences = [];
            player.impureSequences = [];
            player.isSets = [];
            player.invalid = [];
        }
        pool.openDeck = [];
        pool.closedDeck = [];
        pool.gameScores = [];
        pool.winner = null;

        await pool.save();
        await pool.populate('players.userId', "_id name email")
        console.log('Game data reset successfully');
        return pool;
    } catch (error) {
        console.error('Error resetting game data:', error);
        return { message: "Failed to reset game data" };
    }
};


module.exports = { handleJoin, handleLeave, distributeCards, initializeGame, pickFromOpenDeck, pickFromClosedDeck, discardCard, handleDrop, handleShow, handleDeclare, selectWinner, resetGameData }

