const displayController = (() => {
    const tilesEl = document.querySelectorAll('.ttt__tiles');
    const overlayEl = document.querySelector('.ttt__outcome__overlay');
    const _clearTiles = () => {
        tilesEl.forEach(el => el.firstChild && el.removeChild(el.firstChild));
    }
    const _toggleClass = (rmvClass, addClass) => {
        overlayEl.classList.remove(rmvClass);
        overlayEl.classList.add(addClass);
    };
    const insertPiece = (el, tttTile, player) => {
        if (el.textContent !== '' && tttTile !== '') return;
        const parent = document.createElement('div');
        parent.classList.add('xo');
        el.append(parent);
        parent.textContent = player.getPiece();
    }
    const changeText = (el, text) => el.textContent = text;
    const toggleOverlay = (endGame) => endGame ? _toggleClass('hide', 'show') : _toggleClass('show', 'hide');
    const redisplayGameboard = () => {
        _clearTiles();
        _toggleClass('show', 'hide');
    }

    return {
        redisplayGameboard,
        toggleOverlay,
        insertPiece,
        changeText,
        overlayEl
    }
})();

//TTT is the acronym for Tic-Tac-Toe
const TTT = (() => {
    let currentTurn = 'x';
    let gamemode = localStorage.getItem('gamemode') ? localStorage.getItem('gamemode') : 'ai';
    const board =
        [['', '', ''],
        ['', '', ''],
        ['', '', '']];
    const possibleOutcomes = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const _tileNumToIndices = (n) => {
        // 0 1 2
        // 3 4 5
        // 6 7 8
        if (!n) return [0, 0];
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
            if (board[boardPos[0]][boardPos[1]] === '') return;
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
        currentTurn = 'x';
    };
    const filterFilledBoard = (outcome, piece) => {
        const winningLen = outcome.filter(index => getBoardPos(index) === piece).length;
        return winningLen;
    }
    const setGamemode = (newGamemode) => gamemode = newGamemode;
    const getGamemode = () => gamemode;
    const isThereAWinner = (piece) => {
        const checkForAWinner = possibleOutcomes.find(outcome => filterFilledBoard(outcome, piece) === 3);
        return !!checkForAWinner;
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
    const move = (p1, p2, currentPlayer) => setTimeout(() => bestMove(p1, p2, currentPlayer), 200);
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
    function _AIMove(p1, p2) {
        const currentPlayer = TTT.getTurn() === 'x' ? p1 : p2;
        const nextPlayer = TTT.getTurn() === 'x' ? p2 : p1;
        p2.move(p1, p2, currentPlayer);
        _changeTurn(currentPlayer, nextPlayer);
    }

    function _playerMove(p1, p2) {
        const tilesEl = document.querySelectorAll('.ttt__tiles');
        tilesEl.forEach((el, i) => {
            //Each move
            el.onclick = (e) => {
                const currentPlayer = TTT.getTurn() === 'x' ? p1 : p2;
                const nextPlayer = TTT.getTurn() === 'x' ? p2 : p1;
                if (!TTT.getBoardPos(i)) {
                    displayController.insertPiece(el, TTT.getBoardPos(i), currentPlayer);
                    TTT.updateBoard(TTT.getTurn(), i);
                    _changeTurn(currentPlayer, nextPlayer);
                }
            };
        })
    }

    function _restartGame() {
        TTT.clearBoard();
        displayController.redisplayGameboard();
        startGame();
    }

    function _clickOverlayToHide() {
        displayController.overlayEl.addEventListener('click', () => {
            _restartGame();
        })
    }

    //change the turn for the other player
    function _changeTurn(currentPlayer, nextPlayer) {
        _checkIfThereIsAWinner(currentPlayer);
        displayController.changeText(userTurnEl, `${nextPlayer.getName()}\'s turn`);
        TTT.getTurn() === 'x' ? TTT.setTurn('o') : TTT.setTurn('x');
    }

    //display winner when it is detected that there's a winner
    function _endGame(isGameover, currentPlayer) {
        displayController.toggleOverlay(isGameover);
        displayController.changeText(winnerTxt, `${currentPlayer.getName()} won!`);
    }

    function _checkIfThereIsAWinner(currentPlayer) {
        const isGameover = TTT.isThereAWinner(TTT.getTurn());
        _endGame(isGameover, currentPlayer);
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
        _clickOverlayToHide(); //add event listener to overlay
    }

    const startGame = () => {
        const p1 = _players().p1;
        const p2 = _players().p2;
        displayController.changeText(userTurnEl, `${p1.getName()}\'s turn`);
        if (TTT.getGamemode() === 'ai' && TTT.getTurn('o')) {
            _AIMove(p1, p2);
        } else {
            _playerMove(p1, p2);
        }
    }
    return { toggleGamemode, initializePreparationBeforeTTT, startGame }
})()

game.toggleGamemode();
game.initializePreparationBeforeTTT();
game.startGame();