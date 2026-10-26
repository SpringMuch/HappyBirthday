/**
 * Mini-Games Implementation for Ngũ Phúc Kỳ Duyên
 * 1. Jigsaw 50 Tiles (100% Local file:/// compatible, CSS Sliced, Instant Render)
 * 2. Tower of Hanoi (7 disks)
 * 3. Lights Out (3x3)
 * 4. Water Sort (6 colors, 8 units each, 8 tubes)
 * 5. Unblock Wood (Luxury Vietnamese Lacquerware & Rosewood Theme)
 */

/* ============================================================
   1. PUZZLE GAME (50 BLOCKS - 10 COLS x 5 ROWS)
   ============================================================ */
class JigsawPuzzleGame {
  constructor(containerId, onWinCallback) {
    this.container = document.getElementById(containerId);
    this.onWin = onWinCallback;
    this.cols = 10;
    this.rows = 5;
    this.total = this.cols * this.rows; // 50 pieces
    this.pieces = []; // Array of { originalIndex, currentIndex }
    this.selectedIndex = null;
    this.moveCount = 0;
    this.isWon = false;
    this.showNumbers = false;

    this.init();
  }

  init() {
    this.setupUI();
    this.shuffleAndRender();
  }

  setupUI() {
    const btnReset = document.getElementById('btn-puzzle-reset');
    if (btnReset) {
      btnReset.onclick = () => {
        window.folkAudio.playClack();
        this.shuffleAndRender();
      };
    }

    const btnHint = document.getElementById('btn-puzzle-hint');
    if (btnHint) {
      btnHint.onclick = () => {
        window.folkAudio.playChime(650, 0.4);
        this.showNumbers = !this.showNumbers;
        if (this.showNumbers) {
          this.container.classList.add('show-numbers');
          btnHint.textContent = '💡 Ẩn Số & Trợ Giúp';
        } else {
          this.container.classList.remove('show-numbers');
          btnHint.textContent = '💡 Gợi Ý (Hiện Số)';
        }
        // Auto-place 5 misplaced tiles into correct positions
        this.autoHelpPieces(5);
      };
    }
  }

  shuffleAndRender() {
    this.moveCount = 0;
    this.selectedIndex = null;
    this.isWon = false;

    // Create 0..49 order
    const order = Array.from({ length: this.total }, (_, i) => i);

    // Shuffle with Fisher-Yates
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    // Map into current pieces array
    this.pieces = order.map((origIdx, currentIdx) => ({
      originalIndex: origIdx,
      currentIndex: currentIdx
    }));

    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    this.pieces.forEach((piece, index) => {
      const tile = document.createElement('div');
      tile.className = 'puzzle-piece';

      if (index === this.selectedIndex) {
        tile.classList.add('selected');
      }
      if (piece.originalIndex === index) {
        tile.classList.add('correct');
      }

      // Calculate background slice coordinates for piece.originalIndex (0..49)
      const origCol = piece.originalIndex % this.cols;
      const origRow = Math.floor(piece.originalIndex / this.cols);

      // Percentage formula for CSS background-position: (col / (cols - 1)) * 100%
      const posX = (origCol / (this.cols - 1)) * 100;
      const posY = (origRow / (this.rows - 1)) * 100;

      tile.style.backgroundImage = "url('birthday_photo.jpg')";
      tile.style.backgroundSize = "1000% 500%";
      tile.style.backgroundPosition = `${posX}% ${posY}%`;

      // Number badge for hint
      const numSpan = document.createElement('span');
      numSpan.className = 'piece-num';
      numSpan.textContent = piece.originalIndex + 1;
      tile.appendChild(numSpan);

      // Click to select / swap
      tile.onclick = () => this.handleTileClick(index);

      // HTML5 Drag and Drop support
      tile.draggable = true;
      tile.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', index.toString());
      };
      tile.ondragover = (e) => e.preventDefault();
      tile.ondrop = (e) => {
        e.preventDefault();
        const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(fromIdx) && fromIdx !== index) {
          this.swapPieces(fromIdx, index);
        }
      };

      this.container.appendChild(tile);
    });

    this.updateStats();
  }

  handleTileClick(index) {
    if (this.isWon) return;

    if (this.selectedIndex === null) {
      this.selectedIndex = index;
      window.folkAudio.playClack();
      this.render();
    } else if (this.selectedIndex === index) {
      this.selectedIndex = null;
      this.render();
    } else {
      this.swapPieces(this.selectedIndex, index);
      this.selectedIndex = null;
    }
  }

  swapPieces(i, j) {
    [this.pieces[i], this.pieces[j]] = [this.pieces[j], this.pieces[i]];
    this.moveCount++;
    window.folkAudio.playClack();
    this.render();
    this.checkWin();
  }

  autoHelpPieces(count = 5) {
    let placed = 0;
    for (let i = 0; i < this.total && placed < count; i++) {
      if (this.pieces[i].originalIndex !== i) {
        const targetIdx = this.pieces.findIndex(p => p.originalIndex === i);
        if (targetIdx !== -1) {
          [this.pieces[i], this.pieces[targetIdx]] = [this.pieces[targetIdx], this.pieces[i]];
          placed++;
        }
      }
    }
    this.render();
    this.checkWin();
  }

  checkWin() {
    const isAllCorrect = this.pieces.every((p, idx) => p.originalIndex === idx);
    if (isAllCorrect && !this.isWon) {
      this.isWon = true;
      window.folkAudio.playGong();
      if (this.onWin) this.onWin(1);
    }
  }

  updateStats() {
    const correctCount = this.pieces.filter((p, idx) => p.originalIndex === idx).length;
    const elCorrect = document.getElementById('puzzle-correct-count');
    const elMoves = document.getElementById('puzzle-move-count');
    if (elCorrect) elCorrect.textContent = correctCount;
    if (elMoves) elMoves.textContent = this.moveCount;
  }
}

/* ============================================================
   2. TOWER OF HANOI (7 DISKS)
   ============================================================ */
class HanoiGame {
  constructor(onWinCallback) {
    this.onWin = onWinCallback;
    this.numDisks = 7;
    this.pegs = [[], [], []];
    this.selectedPeg = null;
    this.moves = 0;
    this.history = [];
    this.isWon = false;
    this.init();
  }

  init() {
    this.setupUI();
    this.reset();
  }

  setupUI() {
    for (let i = 0; i < 3; i++) {
      const stand = document.querySelector(`.hanoi-peg-col[data-peg="${i}"] .peg-stand`);
      const btn = document.querySelector(`button.folk-btn-peg[data-peg="${i}"]`);
      
      const clickHandler = () => this.handlePegAction(i);
      if (stand) stand.onclick = clickHandler;
      if (btn) btn.onclick = clickHandler;
    }

    const btnUndo = document.getElementById('btn-hanoi-undo');
    if (btnUndo) btnUndo.onclick = () => this.undo();

    const btnReset = document.getElementById('btn-hanoi-reset');
    if (btnReset) {
      btnReset.onclick = () => {
        window.folkAudio.playClack();
        this.reset();
      };
    }

    const btnAuto = document.getElementById('btn-hanoi-autosolve');
    if (btnAuto) btnAuto.onclick = () => this.hintStep();
  }

  reset() {
    this.pegs = [
      Array.from({ length: this.numDisks }, (_, i) => this.numDisks - i),
      [],
      []
    ];
    this.selectedPeg = null;
    this.moves = 0;
    this.history = [];
    this.isWon = false;
    this.render();
  }

  handlePegAction(pegIdx) {
    if (this.isWon) return;

    if (this.selectedPeg === null) {
      if (this.pegs[pegIdx].length === 0) return;
      this.selectedPeg = pegIdx;
      window.folkAudio.playClack();
      this.render();
    } else {
      if (this.selectedPeg === pegIdx) {
        this.selectedPeg = null;
        this.render();
        return;
      }
      this.moveDisk(this.selectedPeg, pegIdx);
      this.selectedPeg = null;
    }
  }

  moveDisk(fromPeg, toPeg) {
    const fromStack = this.pegs[fromPeg];
    const toStack = this.pegs[toPeg];

    if (fromStack.length === 0) return;

    const movingDisk = fromStack[fromStack.length - 1];
    const topOfTo = toStack.length > 0 ? toStack[toStack.length - 1] : Infinity;

    if (movingDisk > topOfTo) {
      window.folkAudio.playClack();
      alert("Đĩa lớn không thể đặt lên đĩa nhỏ hơn!");
      this.render();
      return;
    }

    this.history.push({ from: fromPeg, to: toPeg });
    fromStack.pop();
    toStack.push(movingDisk);
    this.moves++;
    window.folkAudio.playChime(300 + movingDisk * 60, 0.35);

    this.render();
    this.checkWin();
  }

  undo() {
    if (this.history.length === 0 || this.isWon) return;
    const last = this.history.pop();
    const disk = this.pegs[last.to].pop();
    this.pegs[last.from].push(disk);
    this.moves = Math.max(0, this.moves - 1);
    this.selectedPeg = null;
    window.folkAudio.playClack();
    this.render();
  }

  hintStep() {
    if (this.isWon) return;

    const steps = [];
    const solve = (n, from, to, aux) => {
      if (n === 1) {
        steps.push({ from, to });
        return;
      }
      solve(n - 1, from, aux, to);
      steps.push({ from, to });
      solve(n - 1, aux, to, from);
    };
    solve(this.numDisks, 0, 2, 1);

    if (this.moves < steps.length) {
      const step = steps[this.moves];
      this.moveDisk(step.from, step.to);
    } else {
      for (let f = 0; f < 3; f++) {
        for (let t = 0; t < 3; t++) {
          if (f !== t && this.pegs[f].length > 0) {
            const disk = this.pegs[f][this.pegs[f].length - 1];
            const top = this.pegs[t].length > 0 ? this.pegs[t][this.pegs[t].length - 1] : Infinity;
            if (disk < top) {
              this.moveDisk(f, t);
              return;
            }
          }
        }
      }
    }
  }

  checkWin() {
    if (this.pegs[2].length === this.numDisks && !this.isWon) {
      this.isWon = true;
      window.folkAudio.playGong();
      if (this.onWin) this.onWin(2);
    }
  }

  render() {
    const elMove = document.getElementById('hanoi-move-count');
    if (elMove) elMove.textContent = this.moves;

    for (let i = 0; i < 3; i++) {
      const pegContainer = document.getElementById(`peg-disks-${i}`);
      const stand = document.querySelector(`.hanoi-peg-col[data-peg="${i}"] .peg-stand`);
      if (!pegContainer) continue;

      pegContainer.innerHTML = '';

      if (this.selectedPeg === i) {
        stand?.classList.add('selected-peg');
      } else {
        stand?.classList.remove('selected-peg');
      }

      this.pegs[i].forEach((diskSize, idx) => {
        const diskEl = document.createElement('div');
        diskEl.className = `hanoi-disk disk-size-${diskSize}`;
        diskEl.textContent = `Tầng ${diskSize}`;

        if (this.selectedPeg === i && idx === this.pegs[i].length - 1) {
          diskEl.classList.add('lifted');
        }

        pegContainer.appendChild(diskEl);
      });
    }
  }
}

/* ============================================================
   3. LIGHTS OUT GAME (3x3 LANTERNS)
   ============================================================ */
class LightsOutGame {
  constructor(containerId, onWinCallback) {
    this.container = document.getElementById(containerId);
    this.onWin = onWinCallback;
    this.size = 3;
    this.grid = [];
    this.moves = 0;
    this.isWon = false;
    this.init();
  }

  init() {
    const btnReset = document.getElementById('btn-lights-reset');
    if (btnReset) {
      btnReset.onclick = () => {
        window.folkAudio.playClack();
        this.reset();
      };
    }

    const btnHint = document.getElementById('btn-lights-hint');
    if (btnHint) {
      btnHint.onclick = () => this.autoHint();
    }

    this.reset();
  }

  reset() {
    this.moves = 0;
    this.isWon = false;

    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(true));

    const scrambleCount = 6;
    for (let k = 0; k < scrambleCount; k++) {
      const r = Math.floor(Math.random() * this.size);
      const c = Math.floor(Math.random() * this.size);
      this.toggleDirect(r, c);
    }

    if (this.checkAllOn()) {
      this.toggleDirect(1, 1);
    }

    this.render();
  }

  toggleDirect(r, c) {
    const deltas = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
    deltas.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
        this.grid[nr][nc] = !this.grid[nr][nc];
      }
    });
  }

  handleCellClick(r, c) {
    if (this.isWon) return;

    this.toggleDirect(r, c);
    this.moves++;
    window.folkAudio.playChime(440 + (r * 3 + c) * 35, 0.3);

    this.render();
    this.checkWin();
  }

  checkAllOn() {
    return this.grid.every(row => row.every(val => val === true));
  }

  checkWin() {
    if (this.checkAllOn() && !this.isWon) {
      this.isWon = true;
      window.folkAudio.playGong();
      if (this.onWin) this.onWin(3);
    }
  }

  autoHint() {
    if (this.isWon) return;
    const currentOn = this.countOn();
    let bestR = 1, bestC = 1, maxGain = -99;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        this.toggleDirect(r, c);
        const gain = this.countOn() - currentOn;
        if (gain > maxGain) {
          maxGain = gain;
          bestR = r;
          bestC = c;
        }
        this.toggleDirect(r, c);
      }
    }

    this.handleCellClick(bestR, bestC);
  }

  countOn() {
    let count = 0;
    this.grid.forEach(row => row.forEach(val => { if (val) count++; }));
    return count;
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';
    const onCount = this.countOn();

    const elOn = document.getElementById('lights-on-count');
    const elMoves = document.getElementById('lights-moves');
    if (elOn) elOn.textContent = onCount;
    if (elMoves) elMoves.textContent = this.moves;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const isOn = this.grid[r][c];
        const cell = document.createElement('div');
        cell.className = `lantern-cell ${isOn ? 'on' : 'off'}`;

        cell.innerHTML = `
          <svg viewBox="0 0 50 60" class="lantern-icon">
            <line x1="25" y1="0" x2="25" y2="10" stroke="#ffd152" stroke-width="2"/>
            <path d="M12,12 H38 L44,34 Q25,52 6,34 Z" fill="${isOn ? '#cf443b' : '#331b12'}" stroke="#ffd152" stroke-width="2"/>
            <circle cx="25" cy="30" r="${isOn ? '8' : '4'}" fill="${isOn ? '#ffffa0' : '#4a2818'}"/>
            <line x1="25" y1="46" x2="25" y2="58" stroke="#cf443b" stroke-width="2.5"/>
            <circle cx="25" cy="58" r="2.5" fill="#ffd152"/>
          </svg>
          <span class="lantern-num">${r * 3 + c + 1}</span>
        `;

        cell.onclick = () => this.handleCellClick(r, c);
        this.container.appendChild(cell);
      }
    }
  }
}

/* ============================================================
   4. WATER SORT PUZZLE (6 COLORS, 8 UNITS EACH, 8 TUBES)
   ============================================================ */
class WaterSortGame {
  constructor(containerId, onWinCallback) {
    this.container = document.getElementById(containerId);
    this.onWin = onWinCallback;
    this.numColors = 6;
    this.tubeCapacity = 8;
    this.totalTubes = 8;
    this.tubes = [];
    this.selectedTube = null;
    this.moves = 0;
    this.history = [];
    this.isWon = false;

    this.colorClasses = [
      'color-red',
      'color-gold',
      'color-green',
      'color-blue',
      'color-purple',
      'color-brown'
    ];

    this.init();
  }

  init() {
    const btnReset = document.getElementById('btn-water-reset');
    if (btnReset) {
      btnReset.onclick = () => {
        window.folkAudio.playClack();
        this.reset();
      };
    }

    const btnUndo = document.getElementById('btn-water-undo');
    if (btnUndo) btnUndo.onclick = () => this.undo();

    this.reset();
  }

  reset() {
    this.moves = 0;
    this.selectedTube = null;
    this.history = [];
    this.isWon = false;

    let pool = [];
    for (let c = 0; c < this.numColors; c++) {
      for (let k = 0; k < this.tubeCapacity; k++) {
        pool.push(c);
      }
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    this.tubes = [];
    for (let i = 0; i < this.numColors; i++) {
      this.tubes.push(pool.slice(i * this.tubeCapacity, (i + 1) * this.tubeCapacity));
    }
    this.tubes.push([]);
    this.tubes.push([]);

    this.render();
  }

  handleTubeClick(tubeIdx) {
    if (this.isWon) return;

    if (this.selectedTube === null) {
      if (this.tubes[tubeIdx].length === 0) return;
      this.selectedTube = tubeIdx;
      window.folkAudio.playClack();
      this.render();
    } else {
      if (this.selectedTube === tubeIdx) {
        this.selectedTube = null;
        this.render();
        return;
      }

      this.pourWater(this.selectedTube, tubeIdx);
      this.selectedTube = null;
    }
  }

  pourWater(fromIdx, toIdx) {
    const fromTube = this.tubes[fromIdx];
    const toTube = this.tubes[toIdx];

    if (fromTube.length === 0) return;
    if (toTube.length >= this.tubeCapacity) {
      window.folkAudio.playClack();
      return;
    }

    const movingColor = fromTube[fromTube.length - 1];
    const toTopColor = toTube.length > 0 ? toTube[toTube.length - 1] : null;

    if (toTopColor !== null && toTopColor !== movingColor) {
      window.folkAudio.playClack();
      return;
    }

    let unitsToMove = 0;
    for (let i = fromTube.length - 1; i >= 0; i--) {
      if (fromTube[i] === movingColor) {
        unitsToMove++;
      } else {
        break;
      }
    }

    const availableSpace = this.tubeCapacity - toTube.length;
    const actualMoveCount = Math.min(unitsToMove, availableSpace);

    if (actualMoveCount === 0) return;

    this.history.push({
      from: fromIdx,
      to: toIdx,
      count: actualMoveCount,
      color: movingColor
    });

    for (let k = 0; k < actualMoveCount; k++) {
      toTube.push(fromTube.pop());
    }

    this.moves++;
    window.folkAudio.playWaterPour();

    this.render();
    this.checkWin();
  }

  undo() {
    if (this.history.length === 0 || this.isWon) return;
    const last = this.history.pop();
    for (let k = 0; k < last.count; k++) {
      this.tubes[last.from].push(this.tubes[last.to].pop());
    }
    this.moves = Math.max(0, this.moves - 1);
    this.selectedTube = null;
    window.folkAudio.playWaterPour();
    this.render();
  }

  checkWin() {
    let completedCount = 0;
    this.tubes.forEach(tube => {
      if (tube.length === this.tubeCapacity) {
        const first = tube[0];
        if (tube.every(c => c === first)) {
          completedCount++;
        }
      }
    });

    if (completedCount === this.numColors && !this.isWon) {
      this.isWon = true;
      window.folkAudio.playGong();
      if (this.onWin) this.onWin(4);
    }
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';
    let completedCount = 0;

    this.tubes.forEach((tube, idx) => {
      const isComplete = tube.length === this.tubeCapacity && tube.every(c => c === tube[0]);
      if (isComplete) completedCount++;

      const tubeEl = document.createElement('div');
      tubeEl.className = 'water-tube';
      if (idx === this.selectedTube) tubeEl.classList.add('selected');
      if (isComplete) tubeEl.classList.add('completed');

      tube.forEach(colorIdx => {
        const layer = document.createElement('div');
        layer.className = `water-layer ${this.colorClasses[colorIdx]}`;
        tubeEl.appendChild(layer);
      });

      tubeEl.onclick = () => this.handleTubeClick(idx);
      this.container.appendChild(tubeEl);
    });

    const elComplete = document.getElementById('water-completed-tubes');
    const elMove = document.getElementById('water-move-count');
    if (elComplete) elComplete.textContent = completedCount;
    if (elMove) elMove.textContent = this.moves;
  }
}

/* ============================================================
   5. UNBLOCK WOOD PUZZLE (LUXURY VIETNAMESE WOODCRAFT)
   ============================================================ */
class UnblockWoodGame {
  constructor(boardId, onWinCallback) {
    this.board = document.getElementById(boardId);
    this.onWin = onWinCallback;
    this.gridSize = 6;
    this.blocks = [];
    this.moves = 0;
    this.isWon = false;
    this.init();
  }

  init() {
    const btnReset = document.getElementById('btn-unblock-reset');
    if (btnReset) {
      btnReset.onclick = () => {
        window.folkAudio.playClack();
        this.reset();
      };
    }

    const btnHint = document.getElementById('btn-unblock-hint');
    if (btnHint) {
      btnHint.onclick = () => this.autoHint();
    }

    // Recalculate block positions on mobile screen rotation / resize
    window.addEventListener('resize', () => {
      if (document.getElementById('screen-game-unblock')?.classList.contains('active')) {
        this.render();
      }
    });

    this.reset();
  }

  reset() {
    this.moves = 0;
    this.isWon = false;

    // Classic solvable layout
    this.blocks = [
      { id: 'target', r: 2, c: 1, len: 2, orientation: 'h', isTarget: true },
      { id: 'b1', r: 0, c: 0, len: 2, orientation: 'v', isTarget: false },
      { id: 'b2', r: 0, c: 1, len: 3, orientation: 'h', isTarget: false },
      { id: 'b3', r: 1, c: 3, len: 3, orientation: 'v', isTarget: false },
      { id: 'b4', r: 1, c: 4, len: 2, orientation: 'v', isTarget: false },
      { id: 'b5', r: 3, c: 1, len: 2, orientation: 'h', isTarget: false },
      { id: 'b6', r: 4, c: 0, len: 2, orientation: 'v', isTarget: false },
      { id: 'b7', r: 4, c: 2, len: 2, orientation: 'h', isTarget: false },
      { id: 'b8', r: 3, c: 4, len: 2, orientation: 'v', isTarget: false },
      { id: 'b9', r: 5, c: 2, len: 3, orientation: 'h', isTarget: false }
    ];

    this.render();
  }

  render() {
    if (!this.board) return;
    this.board.innerHTML = '';
    const elMove = document.getElementById('unblock-move-count');
    if (elMove) elMove.textContent = this.moves;

    const boardWidth = this.board.clientWidth || 360;
    const cellSize = boardWidth / this.gridSize;

    this.blocks.forEach(block => {
      const el = document.createElement('div');
      el.className = `wood-block ${block.isTarget ? 'wood-block-target' : 'wood-block-normal'}`;

      const w = block.orientation === 'h' ? block.len * cellSize : cellSize;
      const h = block.orientation === 'v' ? block.len * cellSize : cellSize;
      const x = block.c * cellSize;
      const y = block.r * cellSize;

      el.style.width = `${w - 6}px`;
      el.style.height = `${h - 6}px`;
      el.style.left = `${x + 3}px`;
      el.style.top = `${y + 3}px`;

      if (block.isTarget) {
        // Grand Lacquer Red block with gold cloud motifs & centered text
        el.innerHTML = `
          <div class="lacquer-gloss"></div>
          <div class="lacquer-gold-border"></div>
          <span class="target-title">❖ MỤC TIÊU ❖</span>
          <span class="target-arrow">➔</span>
        `;
      } else {
        // Elegant rosewood block with wood grain & brass studs
        el.innerHTML = `
          <div class="wood-grain-highlight"></div>
          <div class="wood-carved-groove"></div>
          <span class="wood-brass-stud stud-1"></span>
          <span class="wood-brass-stud stud-2"></span>
        `;
      }

      this.setupDrag(el, block, cellSize);
      this.board.appendChild(el);
    });
  }

  setupDrag(el, block, cellSize) {
    let startX = 0;
    let startY = 0;
    let startBlockPos = block.orientation === 'h' ? block.c : block.r;
    let isDragging = false;

    const onPointerDown = (e) => {
      if (this.isWon) return;
      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);
      startBlockPos = block.orientation === 'h' ? block.c : block.r;
      el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const currentX = e.clientX || (e.touches && e.touches[0].clientX);
      const currentY = e.clientY || (e.touches && e.touches[0].clientY);

      const delta = block.orientation === 'h' ? (currentX - startX) : (currentY - startY);
      const deltaCells = Math.round(delta / cellSize);

      if (deltaCells !== 0) {
        const targetPos = startBlockPos + deltaCells;
        if (this.tryMoveBlock(block, targetPos)) {
          startX = currentX;
          startY = currentY;
          startBlockPos = targetPos;
        }
      }
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        this.render();
        this.checkWin();
      }
    };

    el.onpointerdown = onPointerDown;
    el.onpointermove = onPointerMove;
    el.onpointerup = onPointerUp;
    el.onpointercancel = onPointerUp;
  }

  isOccupied(r, c, ignoreBlock) {
    for (let b of this.blocks) {
      if (b === ignoreBlock) continue;
      if (b.orientation === 'h') {
        if (b.r === r && c >= b.c && c < b.c + b.len) return true;
      } else {
        if (b.c === c && r >= b.r && r < b.r + b.len) return true;
      }
    }
    return false;
  }

  tryMoveBlock(block, newPos) {
    if (block.orientation === 'h') {
      if (newPos < 0 || newPos + block.len > this.gridSize) return false;
      const step = newPos > block.c ? 1 : -1;
      let curr = block.c;

      while (curr !== newPos) {
        const next = curr + step;
        const checkCol = step > 0 ? next + block.len - 1 : next;
        if (this.isOccupied(block.r, checkCol, block)) return false;
        curr = next;
      }

      if (block.c !== newPos) {
        block.c = newPos;
        this.moves++;
        window.folkAudio.playClack();
        this.render();
        return true;
      }
    } else {
      if (newPos < 0 || newPos + block.len > this.gridSize) return false;
      const step = newPos > block.r ? 1 : -1;
      let curr = block.r;

      while (curr !== newPos) {
        const next = curr + step;
        const checkRow = step > 0 ? next + block.len - 1 : next;
        if (this.isOccupied(checkRow, block.c, block)) return false;
        curr = next;
      }

      if (block.r !== newPos) {
        block.r = newPos;
        this.moves++;
        window.folkAudio.playClack();
        this.render();
        return true;
      }
    }
    return false;
  }

  autoHint() {
    if (this.isWon) return;
    const target = this.blocks.find(b => b.isTarget);
    
    if (this.tryMoveBlock(target, target.c + 1)) return;

    for (let b of this.blocks) {
      if (b.orientation === 'v' && b.r <= 2 && b.r + b.len > 2) {
        if (this.tryMoveBlock(b, b.r - 1) || this.tryMoveBlock(b, b.r + 1)) {
          return;
        }
      }
    }

    for (let b of this.blocks) {
      if (b.orientation === 'h') {
        if (this.tryMoveBlock(b, b.c + 1) || this.tryMoveBlock(b, b.c - 1)) return;
      } else {
        if (this.tryMoveBlock(b, b.r + 1) || this.tryMoveBlock(b, b.r - 1)) return;
      }
    }
  }

  checkWin() {
    const target = this.blocks.find(b => b.isTarget);
    if (target && target.c >= 4 && !this.isWon) {
      this.isWon = true;
      window.folkAudio.playGong();
      if (this.onWin) this.onWin(5);
    }
  }
}
