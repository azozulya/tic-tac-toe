const info = document.querySelector('.game__info');
const board = document.querySelector('.game__board');
const startBtn = document.querySelector('.game__start');
const stepsContainer = document.querySelector('.steps');
const userX = info.querySelector('[data-user="X"]');
const userO = info.querySelector('[data-user="O"]');
const message = info.querySelector('.message');

let squares = Array(9).fill(null);
let steps = [];
let isActiveGame = true;
let stepNum = 0;
let isXnext = true;

const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
const restartBtn = `<button class="btn game__start" onClick="initGame()">Restart game</button>`;
const soundX = new Audio('./audio/boing.mp3');
const soundO = new Audio('./audio/plink.mp3');

const getSign = () => isXnext ? 'X' : 'O';

const playSound = () => isXnext ? soundX && soundX.play() : soundO && soundO.play();

const addCells = num => {
  let cells = '';

  for(let i = 0; i < num; i++) {
    cells += `<button data-id="${ i }" data-coord="[${ getCoord(i) }]" class="game__board-cell"></button>`;
  }
  return cells;
}

const clickHandler = event => {
  const el = event.target;

  if(el.innerText !== '')
    return;

  if(el.classList.contains('game__board-cell') ) {
    playSound();
    
    el.value = el.innerText = getSign();
    el.classList.add(`sign-${ getSign() }`);
    isXnext = !isXnext;
    squares[el.dataset.id] = el.value;
    stepNum++;
    addStep(el.value, el.dataset.coord);

    stepNum > 4 && checkWinner(squares);  
    
    isActiveGame && changeUser();
  }  
}

const changeUser = () => {
  let current, next;

  if(isXnext) {
    current = userO;
    next = userX;
  } else {
    current = userX;
    next = userO;
  }
  next.classList.add('current');
  current.classList.remove('current');
  showMessage(`Player ${ getSign() } turn`);
}


function addStep(step, coord = ""){
    const stepBtn = document.createElement('button');
    stepBtn.innerText = 'Go to #' + stepNum;
    stepBtn.setAttribute('data-step', stepNum); 
    stepBtn.classList.add('step__btn');

    const li = document.createElement('li');
    li.classList.add('step');
    li.appendChild(stepBtn);
    li.append(step + ": " + coord);

    stepsContainer.appendChild(li);
    addToHistory();
}

const addToHistory = () => steps[stepNum] = squares.slice();

const getStepFromHistory = (step) => { 
  const curr = steps[step]; 
  const cells = board.querySelectorAll('.game__board-cell');

  Array.from(cells).map((cell, idx) => { 
    cell.classList.remove('win');
    
    return cell.value = cell.innerText = curr[idx] === null ? '' : curr[idx];
  });
}

const getCoord = i => {
    const x = (i < 3) ? 1 : ((i < 6) ? 2 : 3);
    const y = (i < 3) ? i + 1 : ((i < 6) ? i - 2 : i - 5);
    return [x, y];
}

const checkWinner = squares => { 
  const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];

      if (squares[a] && squares[b] && squares[c] && squares[a] === squares[b] && squares[a] === squares[c]) { 
        const cells = board.querySelectorAll('.game__board-cell');
        Array.from(cells)
              .filter((_, idx) => lines[i].includes(idx))
              .forEach(btn => btn.classList.add('win'));        
        
        stopGame(`Player ${squares[a]} wins in ${ stepNum } steps!`, `Winner ${squares[a]} in ${ stepNum } steps`);
        return;
      }
  }
  if(stepNum === 9) {
    stopGame("It's tie! Try again.", `Tie`);
  }
}


const stopGame = (message, resultMessage) => {
  board.removeEventListener('click', clickHandler);
  isActiveGame = false;
  saveResult({ text: resultMessage, steps: steps, date: new Date().toLocaleDateString('en-EN', options) });
  showMessage(`${ message } ${ restartBtn }`);
  stepsContainer.classList.remove('hidden');
}

const showMessage = (mes, style = '') => { 
  message.innerText = '';
  message.insertAdjacentHTML('afterbegin', mes);
}

const saveResult = str => {
  const stat = JSON.parse(localStorage.getItem('gameStat')); 
  const newStat = stat ? [str, ...stat] : [str];

  localStorage.setItem('gameStat', JSON.stringify(newStat.length > 10 ? newStat.slice(0, 10) : newStat));
}

const getWinnerList = () => {
  const winners = JSON.parse(localStorage.getItem('gameStat'));

  if(winners) {
    const list = winners.map(({text, steps, date}, idx) => {
      return `
        <div class="last-games__item">
          <div>${ idx + 1 }.</div>
          <div class="last-games__item-date">${ date }</div>
          <div> ${ text }</div>
        </div>      
      `;
    });

    const div = document.createElement('div');
    div.classList.add('last-games');
    div.insertAdjacentHTML('afterbegin', "<h2>Last games</h2>");
    div.insertAdjacentHTML('beforeend', list.join(''));
    
    stepsContainer.insertAdjacentHTML('afterbegin', "<h2>Trace the game</h2>")
    stepsContainer.insertAdjacentElement('afterend', div);
  }   
}

const initGame = () => {
  board.removeEventListener('click', clickHandler);
  board.innerText = '';
  board.insertAdjacentHTML('afterbegin', addCells(9));
  board.addEventListener('click', clickHandler);

  squares = Array(9).fill(null);
  steps = [];  
  isActiveGame = true;
  isXnext = true;
  stepNum = 0;
  
  userX.classList.add('current');

  stepsContainer.innerText = '';
  stepsContainer.classList.add('hidden');

  const lastGames = document.querySelector('.last-games'); 
  lastGames && lastGames.remove();

  getWinnerList();
  showMessage(`Player ${ getSign() } turn`);
}

const getStepHandler = event => {
  const el = event.target;

  if(el.classList.contains('step__btn')) {
    const activeBtn = stepsContainer.querySelector('.active');
    activeBtn && activeBtn.classList.remove('active');

    el.classList.add('active');

    getStepFromHistory(el.dataset.step);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initGame();

  stepsContainer.addEventListener('click', getStepHandler);
});
