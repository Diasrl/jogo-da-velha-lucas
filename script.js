// --- Seleção de elementos ---
const modeSelect = document.getElementById("modeSelect");
const levelContainer = document.getElementById("levelContainer");
const levelSelect = document.getElementById("levelSelect");
const symbolSelect = document.getElementById("symbolSelect");
const color1Select = document.getElementById("color1Select");
const color2Container = document.getElementById("color2Container");
const color2Select = document.getElementById("color2Select");
const startBtn = document.getElementById("startBtn");
const menuDiv = document.getElementById("menu");
const gameBoardDiv = document.getElementById("gameBoard");
const cells = document.querySelectorAll(".cell");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");

// --- Variáveis do jogo ---
let board = Array(9).fill("");
let currentPlayer = "X";
let player1Symbol = "X";
let player2Symbol = "O";
let player1Color = "orange";
let player2Color = "black";
let vsComputer = false;
let level = "easy";
let gameActive = false;

const winningConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// --- Menu ---
modeSelect.addEventListener("change", () => {
  if(modeSelect.value === "computer") {
    levelContainer.classList.remove("hidden");
    color2Container.classList.remove("hidden");
  } else {
    levelContainer.classList.add("hidden");
    color2Container.classList.remove("hidden");
  }
});

startBtn.addEventListener("click", () => {
  if(!modeSelect.value || !symbolSelect.value || !color1Select.value || !color2Select.value ||
     (modeSelect.value==="computer" && !levelSelect.value)){
    alert("Escolha todas as opções!");
    return;
  }

  vsComputer = modeSelect.value==="computer";
  level = levelSelect.value || "easy";
  player1Symbol = symbolSelect.value;
  player2Symbol = player1Symbol==="X"?"O":"X";
  player1Color = color1Select.value;
  player2Color = color2Select.value;

  currentPlayer = "X"; 
  board.fill("");
  cells.forEach(c => { c.textContent=""; c.style.color="black"; });

  menuDiv.classList.add("hidden");
  gameBoardDiv.classList.remove("hidden");
  gameActive = true;
  statusEl.textContent = `Jogador ${currentPlayer}, sua vez!`;

  if(vsComputer && player2Symbol==="X") setTimeout(computerMove, 400);
});

// --- Jogadas ---
cells.forEach(cell => {
  cell.addEventListener("click", () => {
    const idx = cell.getAttribute("data-index");
    if(!gameActive || board[idx] !== "") return;

    if(!vsComputer || currentPlayer===player1Symbol) {
      markCell(cell, idx, currentPlayer===player1Symbol?player1Color:player2Color);
      if(checkWin()) return endGame(getWinMessage());
      else if(!board.includes("")) return endGame("Empate!");
      nextTurn();
      if(vsComputer && currentPlayer===player2Symbol) setTimeout(computerMove, 400);
    }
  });
});

function markCell(cell, idx, color){
  board[idx] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.style.color = color;
}

function nextTurn(){
  currentPlayer = currentPlayer==="X"?"O":"X";
  statusEl.textContent = `Jogador ${currentPlayer}, sua vez!`;
}

function checkWin(){
  return winningConditions.some(c => c.every(i => board[i]===currentPlayer));
}

function checkWinnerBoard(b, player){
  return winningConditions.some(c => c.every(i => b[i]===player));
}

// --- Mensagem final ---
function getWinMessage(){
  if(!vsComputer) return `${currentPlayer} venceu!`;
  if(currentPlayer===player1Symbol){
    switch(level){
      case "easy": return "FACIL NÉ!";
      case "medium": return "AINDA FACIL!";
      case "hard": return "VOCE É BOM MESMO EM!";
      case "impossible": return "NAO É POSSIVEL QUE VOCE GANHOU 😱";
      case "ssj3": return "VOCE É MELHOR QUE GOKU!";
    }
  } else {
    if(level==="ssj3") return "NINGUEM VENCE GOKU SUPER SAYAJIN 3, TENTE OUTRA VEZ INSETO! 😂";
    return "Computador venceu!";
  }
}

function endGame(msg){
  statusEl.textContent = msg;
  gameActive=false;
}

// --- Reiniciar e Menu ---
restartBtn.addEventListener("click", () => {
  board.fill("");
  cells.forEach(c => { c.textContent=""; c.style.color="black"; });
  gameActive=true;
  currentPlayer="X";
  statusEl.textContent = `Jogador ${currentPlayer}, sua vez!`;
  if(vsComputer && currentPlayer===player2Symbol) setTimeout(computerMove,400);
});

menuBtn.addEventListener("click", () => {
  board.fill("");
  cells.forEach(c => { c.textContent=""; c.style.color="black"; });
  gameActive=false;
  menuDiv.classList.remove("hidden");
  gameBoardDiv.classList.add("hidden");
});

// --- IA ---
function computerMove(){
  if(!gameActive) return;
  let idx;
  const empty = board.map((v,i)=>v===""?i:null).filter(v=>v!==null);

  switch(level){
    case "easy":
      idx = empty[Math.floor(Math.random()*empty.length)];
      break;
    case "medium":
      idx = mediumMove();
      break;
    case "hard":
      idx = hardMove();
      break;
    case "impossible":
      idx = impossibleMove();
      break;
    case "ssj3":
      idx = ssj3Move();
      break;
  }

  markCell(cells[idx], idx, player2Color);
  if(checkWin()) return endGame(getWinMessage());
  else if(!board.includes("")) return endGame("Empate!");
  nextTurn();
}

// --- Níveis ---
function mediumMove(){ /* bloqueia e tenta ganhar */ 
  for(let i of board.keys()){
    if(board[i]===""){
      board[i]=player2Symbol;
      if(checkWinnerBoard(board, player2Symbol)){ board[i]=""; return i;}
      board[i]="";
    }
  }
  for(let i of board.keys()){
    if(board[i]===""){
      board[i]=player1Symbol;
      if(checkWinnerBoard(board, player1Symbol)){ board[i]=""; return i;}
      board[i]="";
    }
  }
  const empty = board.map((v,i)=>v===""?i:null).filter(v=>v!==null);
  return empty[Math.floor(Math.random()*empty.length)];
}

function hardMove(){ return Math.random()<0.5?mediumMove():minimaxMove(board,player2Symbol,0).index; }
function impossibleMove(){ return Math.random()<0.1?mediumMove():minimaxMove(board,player2Symbol,0).index; }
function ssj3Move(){ return minimaxMove(board,player2Symbol,0).index; }

function minimaxMove(newBoard, player, depth=0){
  const avail = newBoard.map((v,i)=>v===""?i:null).filter(v=>v!==null);
  if(checkWinnerBoard(newBoard, player1Symbol)) return {score:-10+depth};
  if(checkWinnerBoard(newBoard, player2Symbol)) return {score:10-depth};
  if(avail.length===0) return {score:0};

  const moves=[];
  for(let i of avail){
    const move={index:i};
    newBoard[i]=player;
    const result=minimaxMove(newBoard, player===player2Symbol?player1Symbol:player2Symbol,depth+1);
    move.score=result.score;
    newBoard[i]="";
    moves.push(move);
  }

  let bestMove;
  if(player===player2Symbol){
    let bestScore=-Infinity;
    moves.forEach(m=>{if(m.score>bestScore){bestScore=m.score; bestMove=m;}});
    return bestMove;
  } else {
    let bestScore=Infinity;
    moves.forEach(m=>{if(m.score<bestScore){bestScore=m.score; bestMove=m;}});
    return bestMove;
  }
}
