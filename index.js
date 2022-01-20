//DOM instances
const displayController = (() => {
    const tilesEl = document.querySelectorAll('.ttt__tiles');
    const currentTurnEl = document.querySelector('.ttt__current-user');
    const overlayEl = document.querySelector('.ttt__outcome__overlay');
    const winnerTxt = document.querySelector('.ttt__outcome__winner');
    const _clearTiles = () => {
        tilesEl.forEach(el => {
            if (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        });
    }
    const insertPiece = (el, player) => {
        if (player.getName() === 'AI' && el.target.textContent !== '') return;
        const parent = document.createElement('div');
        parent.classList.add('xo');
        el.append(parent);
        parent.textContent = player.getPiece();
    }
    const changeTurnText = (name) => {
        currentTurnEl.textContent = `${name}\'s turn`;
    }
    const insertWinnerName = (name) => {
        winnerTxt.textContent = `${name} won!`
    }
    const _hideOverlay = () => overlayEl.classList.add('hide');
    const _showOverlay = () => overlayEl.classList.remove('show');
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
    const slots =
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
    const updateSlots = (piece, index) => {
        const xy = _tileNumToIndices(index);
        if (slots[xy[0]][xy[1]] === '') {
            console.log(slots);
            slots[xy[0]][xy[1]] = piece;
        }
    }

    const clearSlots = () => slots.map(v => v.map(v => v = ''));
    const filterFilledSlots = (outcome, piece) => {
        const winningLen = outcome.filter(index => {
            const pos = _tileNumToIndices(index);
            slots[pos[0]][pos[1]] === piece;
        }).length;
        console.log(winningLen);
        return winningLen === 3;
    }
    const setTurn = (turn) => currentTurn = turn;
    const getTurn = () => currentTurn;
    const getSlots = () => slots;
    const setGamemode = (newGamemode) => gamemode = newGamemode;
    const getGamemode = () => gamemode;
    const isThereAWinner = (piece) => {
        const checkForAWinner = possibleOutcomes.find(outcome => filterFilledSlots(outcome, piece));
        return !!checkForAWinner;
    }
    return {
        updateSlots,
        clearSlots,
        getSlots,
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
    const playerInput = document.getElementById('player-input');
    const switchMode = () => {
        console.log(TTT.getGamemode());
        if (TTT.getGamemode() === 'ai') {
            playerInput.checked = false;
            return 'the AI'
        } else {
            playerInput.checked = true;
            return 'another player';
        }
    }
    playerInput.onchange = (e) => {
        const newGamemode = TTT.setGamemode(e.checked ? 'ai' : 'player');
        restartGame();
        setTimeout(() => {
            e.target.textContent = `Play with ${switchMode()}`;
            localStorage.setItem('gamemode', newGamemode);
        }, 200);
    }
}

function changeTurn(i) {
    TTT.getTurn() === 'x' ? TTT.setTurn('o') : TTT.setTurn('x');
    checkIfThereIsAWinner(i);
}
function checkIfThereIsAWinner(i) {
    const isGameover = TTT.isThereAWinner(i, TTT.getTurn());
    displayController.toggleOverlay(isGameover);
}

function startGame() {
    const tilesEl = document.querySelectorAll('.ttt__tiles');
    const p1 = TTT.getGamemode() === 'ai' ? Player('Player', 'x') : Player('Player1', 'x');
    const p2 = TTT.getGamemode() === 'ai' ? Player('AI', 'o') : Player('Player2', 'o');
    //allow the first player to do the first move
    tilesEl.forEach((el, i) => {
        //Each move
        el.onclick = (e) => {
            const currentPlayer = TTT.getTurn() === 'x' ? p1 : p2;
            displayController.insertPiece(el, currentPlayer);
            TTT.updateSlots(TTT.getTurn(), i);
            changeTurn(i);
        };
    })
}

function restartGame() {
    TTT.clearSlots();
    displayController.redisplayGameboard();
    startGame();
}

toggleGamemode();
startGame();