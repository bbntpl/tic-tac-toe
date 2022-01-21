//Switch toggle mode instances
const playerInput = document.getElementById('player-input');
const playerInputLabel = document.querySelector('#label-player > .knob');

const displayController = (() => {
    const tilesEl = document.querySelectorAll('.ttt__tiles');
    const userTurnEl = document.querySelector('.ttt__current-user');
    const overlayEl = document.querySelector('.ttt__outcome__overlay');
    const winnerTxt = document.querySelector('.ttt__outcome__winner');
    const _clearTiles = () => {
        tilesEl.forEach(el => {
            if (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        });
    }
    const insertPiece = (el, tttTile, player) => {
        if (el.textContent !== '' && tttTile !== '') return;
        const parent = document.createElement('div');
        parent.classList.add('xo');
        el.append(parent);
        parent.textContent = player.getPiece();
    }
    const changeTurnText = (name) => userTurnEl.textContent = `${name}\'s turn`;
    const insertWinnerName = (name) => winnerTxt.textContent = `${name} won!`;
    const _hideOverlay = () => {
        overlayEl.classList.remove('show');
        overlayEl.classList.add('hide');
    };
    const _showOverlay = () => {
        overlayEl.classList.remove('hide');
        overlayEl.classList.add('show');
    };
    const toggleOverlay = (endGame) => endGame ? _showOverlay() : _hideOverlay();
    const redisplayGameboard = () => {
        _clearTiles();
        _hideOverlay();
    }
    return {
        redisplayGameboard,
        toggleOverlay,
        insertPiece,
        insertWinnerName,
        changeTurnText
    }
})();

//TTT is the acronym for Tic-Tac-Toe
//Module object for Tic Tac Toe
const TTT = (() => {
    let currentTurn = 'x';
    let gamemode = localStorage.getItem('gamemode')
        ? localStorage.getItem('gamemode') : 'ai';
    const board =
        [['', '', ''],
        ['', '', ''],
        ['', '', '']];
    const possibleOutcomes = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 7]
    ];
    const _tileNumToIndices = (n) => {
        //If the tile is the first number(0) return [0,0]
        if (!n) return [0, 0];
        return [Math.ceil(n / 3) - 1, n % 3];
    }
    const setTurn = (turn) => currentTurn = turn;
    const getTurn = () => currentTurn;
    const getBoardPos = (i) => {
        const xy = _tileNumToIndices(i);
        return board[xy[0]][xy[1]];
    };
    const updateBoard = (piece, index) => {
        const xy = _tileNumToIndices(index);
        if (board[xy[0]][xy[1]] === '') {
            board[xy[0]][xy[1]] = piece;
        }
    }
    const clearBoard = () => board.map(v => v.map(v => v = ''));
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
        setTurn,
        getTurn,
        setGamemode,
        getGamemode,
        isThereAWinner,
    }
})();

//Factory function player
const Player = (name, xo) => {
    const user = name;
    const piece = xo;
    const getName = () => user;
    const getPiece = () => piece;
    return { getName, getPiece }
}

//Factory function AI
const AI = (name, xo) => {
    const prototypePlayer = Player(name, xo);
    const move = () => setTimeout(() => bestMove(), 200);
    return Object.assign({}, prototypePlayer, { move })
}

//switch the opponent between a player and AI
function toggleGamemode() {
    const switchMode = (newGamemode) => {
        //check the mode toggle switch if the mode is AI
        playerInput.checked = newGamemode === 'ai' ? false : true;
        return newGamemode === 'ai' ? 'the AI' : '2nd player';
    }
    playerInput.onchange = (e) => {
        TTT.setGamemode(e.target.checked ? 'player' : 'ai');
        restartGame();
        const newGamemode = TTT.getGamemode();
        setTimeout(() => {
            const switchModeLabel = `Play against ${switchMode(newGamemode)}`;
            playerInputLabel.textContent = switchModeLabel;
            localStorage.setItem('gamemode', newGamemode);
        }, 200);
    }
}

function changeTurn(currentPlayer, nextPlayer) {
    checkIfThereIsAWinner(currentPlayer);
    displayController.changeTurnText(nextPlayer.getName());
    TTT.getTurn() === 'x' ? TTT.setTurn('o') : TTT.setTurn('x');
}

function endGame(isGameover, currentPlayer) {
    displayController.toggleOverlay(isGameover);
    displayController.insertWinnerName(currentPlayer.getName());
}
function checkIfThereIsAWinner(currentPlayer) {
    const isGameover = TTT.isThereAWinner(TTT.getTurn());
    endGame(isGameover, currentPlayer);
}

function initializePreparationBeforeTTT() {
    if (localStorage.getItem('gamemode') === 'player') {
        playerInput.checked = true;
        playerInputLabel.textContent = 'Play against 2nd player';
    } else {
        playerInput.checked = false;
        playerInputLabel.textContent = 'Play against the AI';
    }
}
function startGame() {
    const tilesEl = document.querySelectorAll('.ttt__tiles');
    const p1 = TTT.getGamemode() === 'ai' ? Player('Player', 'x') : Player('Player1', 'x');
    const p2 = TTT.getGamemode() === 'ai' ? Player('AI', 'o') : Player('Player2', 'o');
    displayController.changeTurnText(p1.getName());
    console.log(p2);
    //allow the first player to do the first move
    if (TTT.getGamemode() === 'ai' && TTT.getTurn('o')) {
        const currentPlayer = TTT.getTurn() === 'x' ? p1 : p2;
        const nextPlayer = TTT.getTurn() === 'x' ? p2 : p1;
        p2.move();
        changeTurn(currentPlayer, nextPlayer);
    }
    tilesEl.forEach((el, i) => {
        //Each move
        el.onclick = (e) => {
            const currentPlayer = TTT.getTurn() === 'x' ? p1 : p2;
            const nextPlayer = TTT.getTurn() === 'x' ? p2 : p1;
            if (!TTT.getBoardPos(i)) {
                displayController.insertPiece(el, TTT.getBoardPos(i), currentPlayer);
                TTT.updateBoard(TTT.getTurn(), i);
                changeTurn(currentPlayer, nextPlayer);
            }
        };
    })
}

function restartGame() {
    TTT.clearBoard();
    displayController.redisplayGameboard();
    startGame();
}

toggleGamemode();
initializePreparationBeforeTTT();
startGame();