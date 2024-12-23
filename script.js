document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('board');
  const subtitleElem = document.getElementById('subtitle');
  const winMessage = document.getElementById('win-message');
  const closeWinBtn = document.getElementById('close-win');
  const photoInput = document.getElementById('photo-input');
  const resetButton = document.getElementById('reset-button');

  const gridSize = 4;
  let cells = [];
  let currentCell = null;
  let initialSelectedWords = [];

  // Load from localStorage if available, else from words.json
  let wordsData = JSON.parse(localStorage.getItem('wordsData'));

  if (wordsData && Array.isArray(wordsData.words) && wordsData.words.length >= 16) {
    setupGame(wordsData);
  } else {
    // Fallback to words.json
    fetch('words.json')
      .then(response => response.json())
      .then(data => {
        if (!data.words || data.words.length < 16) {
          alert('Not enough words in words.json. Need at least 16.');
          return;
        }
        setupGame(data);
      })
      .catch(err => {
        console.error('Error loading words.json:', err);
        alert('Error loading words.json');
      });
  }

  function setupGame(data) {
    subtitleElem.textContent = data.subtitle || '';
    const allWords = data.words;
    initialSelectedWords = choose16RandomWords(allWords);
    createBoard(initialSelectedWords);
  }

  function choose16RandomWords(allWords) {
    return shuffle([...allWords]).slice(0,16);
  }

  function createBoard(words) {
    board.innerHTML = '';
    cells = [];
    board.classList.add('bingo-board');

    for (let i = 0; i < gridSize; i++) {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('bingo-row');

      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('bingo-cell');
        cellDiv.dataset.index = index;

        const cellContent = document.createElement('div');
        cellContent.classList.add('cell-content');
        cellContent.textContent = words[index];

        cellDiv.appendChild(cellContent);
        rowDiv.appendChild(cellDiv);

        cellDiv.addEventListener('click', onCellClick);
        cells.push({
          element: cellDiv,
          word: words[index],
          hasImage: false
        });
      }

      board.appendChild(rowDiv);
    }
  }

  function onCellClick(e) {
    currentCell = cells[e.currentTarget.dataset.index];
    photoInput.value = '';
    photoInput.click();
  }

  photoInput.addEventListener('change', handleFileSelect);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      const img = document.createElement('img');
      img.src = ev.target.result;
      img.classList.add('cell-image');
      currentCell.element.innerHTML = '';
      currentCell.element.appendChild(img);
      currentCell.hasImage = true;
      checkForWin();
    };
    reader.readAsDataURL(file);
  }

  function checkForWin() {
    const complete = cells.map(c => c.hasImage);

    // Check rows
    for (let r=0; r<gridSize; r++) {
      const rowStart = r * gridSize;
      if (complete.slice(rowStart, rowStart+gridSize).every(Boolean)) {
        showWin();
        return;
      }
    }

    // Check columns
    for (let c=0; c<gridSize; c++) {
      let colComplete = true;
      for (let r=0; r<gridSize; r++) {
        if (!complete[r*gridSize + c]) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) {
        showWin();
        return;
      }
    }

    // Check diagonals
    let diag1 = true;
    for (let i=0; i<gridSize; i++) {
      if (!complete[i*gridSize + i]) {
        diag1 = false;
        break;
      }
    }

    let diag2 = true;
    for (let i=0; i<gridSize; i++) {
      if (!complete[i*gridSize + (gridSize - 1 - i)]) {
        diag2 = false;
        break;
      }
    }

    if (diag1 || diag2) {
      showWin();
    }
  }

  function showWin() {
    winMessage.classList.remove('hidden');
  }

  closeWinBtn.addEventListener('click', () => {
    winMessage.classList.add('hidden');
  });

  resetButton.addEventListener('click', () => {
    // Reset the board to original words without images
    createBoard(initialSelectedWords);
  });

  // Utility: shuffle an array
  function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
});