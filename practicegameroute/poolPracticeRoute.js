const { handleJoin, handleLeave, distributeCards, pickFromOpenDeck, pickFromClosedDeck, discardCard, handleShow, handleDeclare, selectWinner, resetGameData, handleDrop, initializeGame  } = require("../practicegameController/poolPracticeGame");

const attachWSforPoolPracticeGame = (io) => {
    io.on('connection', (socket) => {
        console.log('Pool Game connected');
        socket.on('join', async (data) => {
            const { userId, point, tableType,poolType } = data;
            if(!userId){
                return socket.emit('gameUpdated', { message:"Userid not found." })
            }
            const game = await handleJoin(userId, point, tableType, poolType);
            if (game && game._id) {
                const room = game._id.toString();
                socket.join(room);

                io.to(room).emit('gameUpdated', game);
                socket.emit('joinedRoom', { room });
            } else {
                socket.emit('errorMsg', { message: 'Unable to join the game.' });
            }
        });
        socket.on('remove', async (data) => {
            const { poolId, userId } = data;
            const room = poolId.toString();

            const game = await handleLeave(poolId, userId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

        socket.on('startcard', async (data) => {
            const { poolId, currentPlayerIndex } = data;
            const room = poolId.toString();
            const game = await distributeCards(poolId, currentPlayerIndex);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

        socket.on('startgame', async (data) => {
            const { poolId, } = data;
            const room = poolId.toString();
            const game = await initializeGame(poolId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

        socket.on('opendeckpick', async (data) => {
            const { poolId, playerId } = data;
            const room = poolId.toString();
            const game = await pickFromOpenDeck(poolId, playerId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

        socket.on('closedeckpick', async (data) => {
            const { poolId, playerId, } = data;
            const room = poolId.toString();
            const game = await pickFromClosedDeck(poolId, playerId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

        socket.on('discardcard', async (data) => {
            const { poolId, playerId, cardId, } = data;
            const room = poolId.toString();
            const game = await discardCard(poolId, playerId, cardId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

        socket.on('show', async (data) => {
            const { poolId, playerId, cards, isStart} = data;
            const room = poolId.toString();
            const game = await handleShow(poolId, playerId, cards, isStart);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

         socket.on('winnershow', async (data) => {
            const { poolId, playerId, cards } = data;
            const room = poolId.toString();
            const game = await handleDeclare(poolId, playerId, cards);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

        socket.on('winner', async (data) => {
            const { poolId } = data;
            const room = poolId.toString();
            const game = await selectWinner(poolId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

        socket.on('resetgame', async (data) => {
            const { poolId } = data;
            const room = poolId.toString();
            const game = await resetGameData(poolId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

        socket.on('drop', async (data) => {
            const { poolId, playerId, isStart } = data;
            const room = poolId.toString();
            const game = await handleDrop(poolId, playerId, isStart);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

         socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};

module.exports = attachWSforPoolPracticeGame;
