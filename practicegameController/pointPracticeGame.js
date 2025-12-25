const { Game } = require('../practicegamemodel/pointPracticeGameMode');
const { calculatePlayerScore } = require("../controller/calculation");
const { updateUserBalanceChip:updateUserBalance, updateUserWithdramwalAmountChip:updateUserWithdramwalAmount } = require('../helper/userDummyBalance');

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const generateShuffledDeck = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    return shuffleArray(deck);
};

const generateShuffledDeck2 = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    for (let i = 0; i < 1; i++) {
        deck.push({ suit: 'joker', rank: "Joker" });
    }
    return shuffleArray(deck);
};

const generateShuffledDeck3 = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    for (let i = 0; i < 1; i++) {
        deck.push({ suit: 'joker', rank: "Joker" });
    }
    return shuffleArray([...deck, ...deck]);
};

const generateJokerRank = () => {
    const jokerRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const randomIndex = Math.floor(Math.random() * jokerRanks.length);
    return jokerRanks[randomIndex];
};

const distributeCards = async (gameId) => {
    try {
        // Find the game by ID
        const game = await Game.findById(gameId);
        if (!game) {
            console.error('Game not found');
            return;
        }

        // Generate a shuffled deck of cards
        const deck = generateShuffledDeck();

        // Assign a start card to each player
        for (const player of game.players) {
            // Draw a card from the deck and assign it as the start card for the player
            const startCard = deck.pop();
            player.startCard = startCard;
        }
        await game.save();
        await game.populate('players.userId', "_id name email")
        return game
        console.log('Cards distributed successfully');
    } catch (error) {
        console.error('Error distributing cards:', error);
        return { message: "Failed" }
    }
};

const initializeGame = async (gameId) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            console.error('Game not found');
            return;
        }
        const cards = generateShuffledDeck3()
        game.openDeck = [];
        const openCard = cards.pop()
        game.openDeck.push(openCard);
        const jokerRank = generateJokerRank();
        game.joker = jokerRank;
        const closeDeckCard = cards
        game.closedDeck = closeDeckCard;
        for (const player of game.players) {
            const deck = generateShuffledDeck2();
            for (let i = 0; i < 13; i++) {
                const card = deck.pop();
                player.cards.push(card);
            }
        }
        await game.save();
        await game.populate('players.userId', "_id name email")
        console.log('Game initialized successfully');
        return game
    } catch (error) {
        console.error('Error initializing game:', error);
        return { message: "Failed" }
    }
};

const pickFromOpenDeck = async (gameId, playerId) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            console.error('Game not found');
            return;
        }
        const player = game.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return;
        }
        const pickedCard = game.openDeck.pop();
        if (!pickedCard) {
            console.error('No card left in the open deck');
            return;
        }
        player.cards.push(pickedCard);
        await game.save();
        await game.populate('players.userId', "_id name email")
        console.log('Card picked from the open deck');
        return game;
    } catch (error) {
        console.error('Error picking card from the open deck:', error);
        return null;
    }
};

const pickFromClosedDeck = async (gameId, playerId) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            console.error('Game not found');
            return null;
        }
        const player = game.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return null;
        }
        if (game.closedDeck.length <= 1) {
            game.closedDeck.push(...shuffleArray(game.openDeck));
            game.openDeck = [];
        }
        const pickedCard = game.closedDeck.pop();
        if (!pickedCard) {
            console.error('No card left in the closed deck');
            return null;
        }
        player.cards.push(pickedCard);
        await game.save();
        await game.populate('players.userId', "_id name email")
        console.log('Card picked from the closed deck');
        return game;
    } catch (error) {
        console.error('Error picking card from the closed deck:', error);
        return null;
    }
};

const discardCard = async (gameId, playerId, cardId) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            console.error('Game not found');
            return null;
        }
        const player = game.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return null;
        }
        const index = player.cards.findIndex(card => card._id.toString() === cardId);
        if (index === -1) {
            console.error('Card not found in player\'s hand');
            return null;
        }
        const discardedCard = player.cards.splice(index, 1)[0];
        game.openDeck.push(discardedCard);
        await game.save();
        await game.populate('players.userId', "_id name email")
        console.log('Card discarded successfully');
        return game;
    } catch (error) {
        console.error('Error discarding card:', error);
        return null;
    }
};

const handleShow = async (gameId, playerId, cards, isStart) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            console.error('Game not found');
            return null;
        }
        const player = game.players.find(p => p._id.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return null;
        }
        const { pureSequences, impureSequences, isSets, invalid, score } = calculatePlayerScore(cards, game.joker);
        player.pureSequences = pureSequences;
        player.impureSequences = impureSequences;
        player.isSets = isSets;
        player.invalid = invalid;
        let playerScore;
        if (isStart) {
            playerScore = Number(score) / 2;
        } else {
            playerScore = score
        }

        const remainingPoints = 80 - playerScore;
        const creditAmount = game.point * remainingPoints;

        const balanceUpdate = await updateUserBalance(player.userId, creditAmount, 'credit', 'point');
        if (balanceUpdate.error) {
            console.error(balanceUpdate.error);
            return balanceUpdate;
        }
        player.score = playerScore;
        await player.save();
        await game.populate('players.userId', "_id name email")
        return game;
    } catch (error) {
        return null;
    }
}

const handleDeclare = async (gameId, playerId, cards) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            console.error('Game not found');
            return null;
        }
        const player = game.players.find(p => p._id.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return null;
        }
        const { pureSequences, impureSequences, isSets, invalid, score } = calculatePlayerScore(cards, game.joker);
        player.pureSequences = pureSequences;
        player.impureSequences = impureSequences;
        player.isSets = isSets;
        player.invalid = invalid;
        player.score = score
        await player.save();
        if (score == 0) {
            game.winner = playerId;
            await game.save()
        }
        await game.populate('players.userId', "_id name email")
        return game;
    } catch (error) {
        return null;
    }
}

const handleDrop = async (gameId, playerId, isStart) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            console.error('Game not found');
            return null;
        }
        const player = game.players.find(p => p.userId.toString() === playerId);
        if (!player) {
            console.error('Player not found');
            return null;
        }
        let score;
        if (isStart) {
            score = 20;
        } else {
            score = 40;
        }

        const remainingPoints = 80 - score;
        const creditAmount = game.point * remainingPoints;

        const balanceUpdate = await updateUserBalance(player.userId, creditAmount, 'credit', 'point');
        if (balanceUpdate.error) {
            console.error(balanceUpdate.error);
            return balanceUpdate;
        }

        player.score = score;
        player.isDrop = true
        await game.save()
        await game.populate('players.userId', "_id name email")
        return game
    } catch (error) {
        console.error('Error handling drop:', error);
        return null;
    }
}

const handleWinner = async (gameId, playerId) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            console.error('Game not found');
            return null;
        }
        const winnerPlayer = game.players.find(p => p.userId.toString() === playerId);
        if (!winnerPlayer) {
            console.error('Winner player not found');
            return null;
        }
        console.log(game);
        let totalOtherPlayersScore = 0;
        for (const player of game.players) {
            if (player._id.toString() !== playerId) {
                totalOtherPlayersScore += player.score;
            }
        }
        game.resultpoint = totalOtherPlayersScore
        let creditAmount = Number(totalOtherPlayersScore)*Number(game.point)*0.85
        console.log(totalOtherPlayersScore, "totalPlayerScore");
        console.log(creditAmount);
        const balanceUpdate = await updateUserWithdramwalAmount(playerId, creditAmount, 'credit', 'point');
        if (balanceUpdate.error) {
            console.error(balanceUpdate.error);
            return balanceUpdate;
        }
        game.isActive=false
        await game.save();
        await game.populate('players.userId', "_id name email")
        return game;
    } catch (error) {
        console.error('Error in handleWinner:', error);
        return null;
    }
}


const handleJoin = async (userId, point, tableType) => {
    try {
        // console.log("Function is Calling");
        if (!userId || !point || !tableType) {
            return { message: "userID, point, and tableType are required." };
        }
        if (tableType !== "2_player" && tableType !== "6_player") {
            return { message: "Invalid tableType. Only '2_player' and '6_player' are allowed." };
        }
        const maxPlayers = tableType === "2_player" ? 2 : 6;
        let game = await Game.findOne({ isActive: true, point, tableType }).sort({ createdAt: -1 });
        let payamount = Number(point)*80
        console.log(payamount);
        if (!game) {
            game = new Game({
                createdBy: userId,
                players: [{ userId, amount: payamount }],
                openDeck: [],
                sequences: [],
                sets: [],
                point,
                tableType
            });
            const balanceUpdate = await updateUserBalance(userId, payamount, 'debit', "point");
            console.log(balanceUpdate);
            if (balanceUpdate.error) {
                console.log(balanceUpdate.error);
                return balanceUpdate;
            }
            await game.save();
        } else {
            console.log(userId, "thsi sis ssdfasdfafas asfd asdfa sd");
            console.log(game);
            if (game.players.some(player => player.userId.toString() == userId.toString())) {
                console.log('Already In');
                return game
            }
            if (game.players.length >= maxPlayers) {
                game = new Game({
                    createdBy: userId,
                    players: [{ userId, amount: payamount }],
                    openDeck: [],
                    sequences: [],
                    sets: [],
                    point,
                    tableType,
                });
                const balanceUpdate = await updateUserBalance(userId, payamount, 'debit', "point");
                console.log(balanceUpdate);
                if (balanceUpdate.error) {
                    console.log(balanceUpdate.error);
                    return balanceUpdate;
                }
                await game.save();
            } else {
                const balanceUpdate = await updateUserBalance(userId, payamount, 'debit', "point");
                console.log(balanceUpdate);
                if (balanceUpdate.error) {
                    console.log(balanceUpdate.error);
                    return balanceUpdate;
                }
                game.players.push({ userId, point, amount: payamount });
                await game.save();
            }
        }
        console.log(`User ${userId} with point ${point} joined the game`);
        await game.populate('players.userId', "_id name email")
        return game;
    } catch (error) {
        console.error('Error joining the game:', error);
        return null;
    }
};

const handleLeave = async (gameId, userId) => {
    try {
        const game = await Game.findById(gameId);
        if (game) {
            const playerIndex = game.players.findIndex(player => player.userId.toString() === userId.toString());
            if (playerIndex !== -1) {
                const amount = game.players[playerIndex].amount;
                const balanceUpdate = await updateUserBalance(userId, amount, 'credit', "point");
                if (balanceUpdate.error) {
                    return balanceUpdate;
                }
                game.players.splice(playerIndex, 1); // Remove the player at the found index
                if (game.players.length === 0) {
                    await Game.deleteOne({ _id: gameId });
                    console.log(`Game ${gameId} deleted as the last player left`);
                } else {
                    await game.save();
                    console.log(`User ${userId} left the game`);
                }
            } else {
                console.log(`User ${userId} not found in the game`);
            }
        }
        await game.populate('players.userId', "_id name email")
        return game; // Return the game object
    } catch (error) {
        console.error('Error leaving the game:', error);
        return null;
    }
};


const attachWSForPointPracticeGame = (io) => {
    io.on('connection', (socket) => {
        console.log('Point game connected');
        // console.log(socket);
        socket.on('join', async (data) => {
            // console.log(data);
            const { userId, point, tableType } = data;
            if (!userId) {
                return socket.emit('gameUpdated', { message: "Userid not found." });
            }
            const game = await handleJoin(userId, point, tableType);
            if (game && game._id) {
                const room = game._id.toString();
                socket.join(room);
                io.to(room).emit('gameUpdated', game);
                socket.emit('joinedRoom', { room });
            } else if (game.message) {
                socket.emit('errorMsg', { message: game.message });
            }
            else {
                socket.emit('errorMsg', { message: 'Unable to join the game.' });
            }
        });

        socket.on('remove', async (data) => {
            const { gameId, userId } = data;
            const room = gameId.toString();
            const game = await handleLeave(gameId, userId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

        socket.on('startcard', async (data) => {
            const { gameId } = data;
            const room = gameId.toString();
            const game = await distributeCards(gameId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('startgame', async (data) => {
            const { gameId } = data;
            const room = gameId.toString();
            const game = await initializeGame(gameId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('opendeckpick', async (data) => {
            const { gameId, playerId } = data;
            const room = gameId.toString();
            const game = await pickFromOpenDeck(gameId, playerId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('closedeckpick', async (data) => {
            const { gameId, playerId } = data;
            const room = gameId.toString();
            const game = await pickFromClosedDeck(gameId, playerId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('discardcard', async (data) => {
            const { gameId, playerId, cardId } = data;
            const room = gameId.toString();
            const game = await discardCard(gameId, playerId, cardId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('show', async (data) => {
            const { gameId, playerId, cards, isStart } = data;
            const room = gameId.toString();
            const game = await handleShow(gameId, playerId, cards, isStart);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('winnershow', async (data) => {
            const { gameId, playerId, cards } = data;
            const room = gameId.toString();
            const game = await handleDeclare(gameId, playerId, cards);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('winner', async (data) => {
            const { gameId, playerId } = data;
            const room = gameId.toString();
            const game = await handleWinner(gameId, playerId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('drop', async (data) => {
            const { gameId, playerId, isStart } = data;
            const room = gameId.toString();
            const game = await handleDrop(gameId, playerId, isStart);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};

module.exports = attachWSForPointPracticeGame;
