const displayController = (() => {
    const tilesEl = document.querySelectorAll('.ttt__tiles');
    const overlayEl = document.querySelector('.ttt__outcome__overlay');
    const _clearTiles = () => {
        tilesEl.forEach(el => {
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        });
    }
    const _toggleClass = (rmvClass, addClass) => {
        overlayEl.classList.remove(rmvClass);
        overlayEl.classList.add(addClass);
    };
    const _insertChildNode = (el, text) => {
        const parent = document.createElement('div');
        parent.classList.add('xo');
        el.append(parent);
        parent.textContent = text;
    }
    const insertPiece = (el, tttTile, player) => {
        if (el.textContent !== '' && tttTile !== '') return;
        _insertChildNode(el, player.getPiece());
    }
    const changeText = (el, text) => el.textContent = text;
    const toggleOverlay = (endGame) =>
        endGame ? _toggleClass('hide', 'show')
            : _toggleClass('show', 'hide');
    const redisplayGameboard = () => {
        _clearTiles();
        _toggleClass('show', 'hide');
    }
    const updateBoard = (board) => {
        _clearTiles();
        tilesEl.forEach((el, n) => {
            const minusOne = n % 3 === 0 ? 0 : 1;
            const xy = [Math.ceil(n / 3) - minusOne, n % 3];
            _insertChildNode(el, board[xy[0]][xy[1]]);
        })

    }
    return {
        redisplayGameboard,
        toggleOverlay,
        insertPiece,
        changeText,
        updateBoard,
        overlayEl,
    }
})();

//TTT is the acronym for Tic-Tac-Toe
//Gameboard Module Pattern
const TTT = (() => {
    let currentTurn = 'x';
    let gamemode = localStorage.getItem('gamemode') ? localStorage.getItem('gamemode') : 'ai';
    const board =
        [['', '', ''],
        ['', '', ''],
        ['', '', '']];
    const possibleOutcomes = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const _tileNumToIndices = (n) => {
        if (!n) return [0, 0];
        //Prevent using Math.ceil to whole number (n)
        const minusOne = n % 3 === 0 ? 0 : 1;
        return [Math.ceil(n / 3) - minusOne, n % 3];
    }
    const setTurn = (turn) => currentTurn = turn;
    const getTurn = () => currentTurn;
    const getBoard = () => board;
    const getBoardPos = (i) => {
        const xy = _tileNumToIndices(i);
        return board[xy[0]][xy[1]];
    };
    const updateBoard = (piece, boardPos) => {
        if (Array.isArray(boardPos)) {
            board[boardPos[0]][boardPos[1]] = piece;
        } else {
            const xy = _tileNumToIndices(boardPos);
            board[xy[0]][xy[1]] = piece;
        }
    }
    const clearBoard = () => {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                board[i][j] = '';
            }
        }
        setTurn('x');
    };
    const filterFilledBoard = (outcome, piece, board = null) => {
        //if there's another board passed as an argument
        //use that board instead
        const requestedBoard = (i) => {
            const xy = _tileNumToIndices(i);
            return board !== null ? board[xy[0]][xy[1]] : getBoardPos(i);
        }
        const winningLen = outcome.filter(i => requestedBoard(i) == piece).length;
        return winningLen;
    }
    const setGamemode = (newGamemode) => gamemode = newGamemode;
    const getGamemode = () => gamemode;
    const isThereAWinner = (piece, board = null) => {
        const checkForAWinner = possibleOutcomes.find(outcome => filterFilledBoard(outcome, piece, board) === 3);
        return checkForAWinner ? piece : null;
    }
    const isBoardFull = (customBoard = null) => {
        let openSpots = 0;
        if (customBoard) {
            customBoard.forEach(c => c.forEach(v => v == '' ? openSpots++ : openSpots));
        } else {
            board.forEach(c => c.forEach(v => v == '' ? openSpots++ : openSpots));
        }
        return openSpots === 0;
    }
    return {
        updateBoard,
        clearBoard,
        getBoardPos,
        getBoard,
        setTurn,
        getTurn,
        setGamemode,
        getGamemode,
        isThereAWinner,
        isBoardFull
    }
})();

const Player = (name, xo) => {
    const user = name;
    const piece = xo;
    const getName = () => user;
    const getPiece = () => piece;
    return { getName, getPiece }
}

const AI = (name, xo) => {
    const prototypePlayer = Player(name, xo);
    const move = (p1, p2, currentPlayer) => bestMove(p1, p2, currentPlayer);
    return Object.assign({}, prototypePlayer, { move })
}

const game = (() => {
    //Switch toggle mode instances
    const playerInput = document.getElementById('player-input');
    const userTurnEl = document.querySelector('.ttt__current-user');
    const winnerTxt = document.querySelector('.ttt__outcome__winner');

    function _players() {
        const p1 = TTT.getGamemode() === 'ai' ? Player('Player', 'x') : Player('Player1', 'x');
        const p2 = TTT.getGamemode() === 'ai' ? AI('AI', 'o') : Player('Player2', 'o');
        return { p1, p2 }
    }
    function _AIMove(p1, p2, currentPlayer) {
        p2.move(p1, p2, currentPlayer);
        _changeTurn(p2, p1);
    }

    function _playerMove(p1, p2) {
        const tilesEl = document.querySelectorAll('.ttt__tiles');
        tilesEl.forEach((el, i) => {
            //Each move
            el.onclick = (e) => {
                const isAiCurrentPlayer = TTT.getGamemode() === 'ai' && TTT.getTurn() === 'o';
                if (!TTT.getBoardPos(i) && !isAiCurrentPlayer) {
                    const currentPlayer = TTT.getTurn() === 'x' ? p1 : p2;
                    const nextPlayer = TTT.getTurn() === 'x' ? p2 : p1;
                    displayController.insertPiece(el, TTT.getBoardPos(i), currentPlayer);
                    TTT.updateBoard(TTT.getTurn(), i);
                    _changeTurn(currentPlayer, nextPlayer);
                    const isAiTurn = TTT.getGamemode() === 'ai' && !TTT.isThereAWinner(currentPlayer.getPiece());
                    if (isAiTurn) {
                        setTimeout(() => {
                            _AIMove(p1, p2, currentPlayer);
                        }, 700)
                    }
                }
            };
        })
    }

    function _restartGame() {
        TTT.clearBoard();
        displayController.redisplayGameboard();
        startGame();
    }

    //  add event listener to overlay which
    //  redisplay the board as if the game refreshed
    function _clickOverlayToHide() {
        displayController.overlayEl.addEventListener('click', _restartGame.bind());
    }

    //display winner when it is detected that there's a winner
    function _endGame(isGameover, currentPlayer) {
        displayController.toggleOverlay(isGameover);
        displayController.changeText(winnerTxt, `${currentPlayer.getName()} won!`);
    }

    function _checkIfThereIsAWinner(currentPlayer) {
        const isGameover = TTT.isThereAWinner(currentPlayer.getPiece());
        //It ends with a draw if the board is filled without a winner
        if (TTT.isBoardFull() && !isGameover) {
            displayController.toggleOverlay(TTT.isBoardFull());
            displayController.changeText(winnerTxt, ' draw');
        } else {
            _endGame(isGameover, currentPlayer);
        }
    }

    //change the turn for the other player
    function _changeTurn(currentPlayer, nextPlayer) {
        _checkIfThereIsAWinner(currentPlayer);
        displayController.changeText(userTurnEl, `${nextPlayer.getName()}\'s turn`);
        TTT.getTurn() === 'x' ? TTT.setTurn('o') : TTT.setTurn('x');
    }

    function equals3(a, b, c) {
        return a == b && b == c && a != '';
    }

    function checkBestMoveResult(board) {
        let winner = TTT.isThereAWinner('o', board);
        if (winner == null && TTT.isBoardFull(board)) {
            return 'tie';
        } else {
            return winner;
        }
    }

    //switch the opponent between a player and AI
    const toggleGamemode = () => {
        playerInput.onchange = (e) => {
            TTT.setGamemode(e.target.checked ? 'player' : 'ai');
            _restartGame();
            const newGamemode = TTT.getGamemode();
            setTimeout(() => {
                localStorage.setItem('gamemode', newGamemode);
            }, 200);
        }
    }

    //initialized variable before the start of the game
    const initializePreparationBeforeTTT = () => {
        const fetchedGamemode = localStorage.getItem('gamemode');
        const currentPlayerInputValue = fetchedGamemode === 'player' ? true : false;
        playerInput.checked = currentPlayerInputValue;
        _clickOverlayToHide();
    }

    const startGame = () => {
        const p1 = _players().p1;
        const p2 = _players().p2;
        displayController.changeText(userTurnEl, `${p1.getName()}\'s turn`);
        _playerMove(p1, p2);
    }

    const updateBoard = (piece, boardPos) => {
        TTT.updateBoard(piece, boardPos);
        const updatedBoard = TTT.getBoard();
        displayController.updateBoard(updatedBoard);
    }
    return {
        toggleGamemode,
        initializePreparationBeforeTTT,
        startGame,
        updateBoard,
        checkBestMoveResult
    }
})()

game.toggleGamemode();
game.initializePreparationBeforeTTT();
game.startGame();