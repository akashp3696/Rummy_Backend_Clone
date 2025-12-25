const { handleJoin, handleLeave, distributeCards, pickFromOpenDeck, pickFromClosedDeck, discardCard, handleShow, handleDeclare, selectWinner,                                                       resetGameData, handleDrop, initializeGame  } = require("../practicegameController/dealPracticeGame");



const attachWSforDealPracticeGame = (io) => {
    io.on('connection', (socket) => {
        console.log('Deal Game connected');
        socket.on('join', async (data) => {
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
            }else if (game.message){
                socket.emit('errorMsg', { message: game.message});
            }
             else {
                socket.emit('errorMsg', { message:'Unable to join the game.'});
            }
        });



        socket.on('remove', async (data) => {
            const { dealId, userId } = data;
            const room = dealId.toString();
            const game = await handleLeave(dealId, userId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });



        socket.on('startcard', async (data) => {
            const { dealId, currentPlayerIndex } = data;
            const room = dealId.toString();
            const game = await distributeCards(dealId, currentPlayerIndex);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('startgame', async (data) => {
            const { dealId } = data;
            const room = dealId.toString();
            const game = await initializeGame(dealId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('opendeckpick', async (data) => {
            const { dealId, playerId } = data;
            const room = dealId.toString();
            const game = await pickFromOpenDeck(dealId, playerId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('closedeckpick', async (data) => {
            const { dealId, playerId } = data;
            const room = dealId.toString();
            const game = await pickFromClosedDeck(dealId, playerId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('discardcard', async (data) => {
            const { dealId, playerId, cardId } = data;
            const room = dealId.toString();
            const game = await discardCard(dealId, playerId, cardId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('show', async (data) => {
            const { dealId, playerId, cards, isStart } = data;
            const room = dealId.toString();
            const game = await handleShow(dealId, playerId, cards, isStart);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('winnershow', async (data) => {
            const { dealId, playerId, cards } = data;
            const room = dealId.toString();
            const game = await handleDeclare(dealId, playerId, cards);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('winner', async (data) => {
            const { dealId} = data;
            const room = dealId.toString();
            const game = await selectWinner(dealId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('resetgame', async (data) => {
            const { dealId} = data;
            const room = dealId.toString();
            const game = await resetGameData(dealId);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });


        socket.on('drop', async (data) => {
            const { dealId, playerId, isStart } = data;
            const room = dealId.toString();
            const game = await handleDrop(dealId, playerId, isStart);
            if (game) {
                io.to(room).emit('gameUpdated', game);
            }
        });

        
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};

module.exports = attachWSforDealPracticeGame;