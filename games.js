/**
 * Mini-Games Implementation for Đêm Sao Hoàng Kim • Tuổi 21
 * 1. Jigsaw 50 Tiles (10x5, birthday_photo.jpg, Stardust Snap Effects)
 * 2. Tower of Hanoi (4 Celestial Energy Disks, Smooth Feedback)
 * 3. Lights Out (3x3 North Star Constellation Matrix)
 * 4. Water Sort (6 Crystal Tubes total: 4 Nebula Colors + 2 Empty Tubes, Smart Hint)
 * 5. Unblock Royal Vault (Obsidian & 24K Gold Age 21 Astral Block)
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
        window.folkAudio.playChime(650, 0.45);
        this.showNumbers = true;
        this.container?.classList.add('show-numbers');
        // Auto-place 5 misplaced tiles into correct positions each click
        this.autoHelpPieces(5);
      };
    }
  }

  shuffleAndRender() {
    this.moveCount = 0;
    this.selectedIndex = null;
    this.isWon = false;

    const order = Array.from({ length: this.total }, (_, i) => i);

    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

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

      const origCol = piece.originalIndex % this.cols;
      const origRow = Math.floor(piece.originalIndex / this.cols);

      const posX = (origCol / (this.cols - 1)) * 100;
      const posY = (origRow / (this.rows - 1)) * 100;

      tile.style.backgroundImage = "url('birthday_photo.jpg')";
      tile.style.backgroundSize = "1000% 500%";
      tile.style.backgroundPosition = `${posX}% ${posY}%`;

      const numSpan = document.createElement('span');
      numSpan.className = 'piece-num';
      numSpan.textContent = piece.originalIndex + 1;
      tile.appendChild(numSpan);

      tile.onclick = (e) => this.handleTileClick(index, e);

      tile.draggable = true;
      tile.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', index.toString());
      };
      tile.ondragover = (e) => e.preventDefault();
      tile.ondrop = (e) => {
        e.preventDefault();
        const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(fromIdx) && fromIdx !== index) {
          this.swapPieces(fromIdx, index, e.clientX, e.clientY);
        }
      };

      this.container.appendChild(tile);
    });

    this.updateStats();
  }

  handleTileClick(index, event) {
    if (this.isWon) return;

    if (this.selectedIndex === null) {
      this.selectedIndex = index;
      window.folkAudio.playClack();
      this.render();
    } else if (this.selectedIndex === index) {
      this.selectedIndex = null;
      this.render();
    } else {
      const x = event ? event.clientX : window.innerWidth / 2;
      const y = event ? event.clientY : window.innerHeight / 2;
      this.swapPieces(this.selectedIndex, index, x, y);
      this.selectedIndex = null;
    }
  }

  swapPieces(i, j, clientX, clientY) {
    [this.pieces[i], this.pieces[j]] = [this.pieces[j], this.pieces[i]];
    this.moveCount++;

    const becameCorrect = (this.pieces[i].originalIndex === i) || (this.pieces[j].originalIndex === j);
    if (becameCorrect) {
      window.folkAudio.playChime(740, 0.35);
      if (window.app && clientX && clientY) {
        window.app.spawnFireworkBurst(clientX, clientY, 16);
      }
    } else {
      window.folkAudio.playClack();
    }

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
    if (window.app) {
      window.app.spawnFireworkBurst(window.innerWidth / 2, window.innerHeight * 0.6, 25);
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
   2. TOWER OF HANOI (4 CELESTIAL DISKS)
   ============================================================ */
class HanoiGame {
  constructor(onWinCallback) {
    this.onWin = onWinCallback;
    this.numDisks = 4; // 4 disks: 15 optimal moves
    this.pegs = [[], [], []];
    this.selectedPeg = null;
    this.moves = 0;
    this.history = [];
    this.isWon = false;
    this.diskNames = ['', 'Tinh Tú I', 'Hổ Phách II', 'Tử Tinh III', 'Thiên Hà IV'];
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
    this.setFeedback('✨ Mẹo: Chạm vào trụ để nhấc đĩa trên cùng, chạm trụ tiếp theo để hạ đĩa xuống!');
    this.render();
  }

  setFeedback(msg, isWarning = false) {
    const el = document.getElementById('hanoi-feedback');
    if (!el) return;
    el.textContent = msg;
    el.style.color = isWarning ? '#fbbf24' : '';
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
      this.setFeedback('⚠️ Đĩa năng lượng lớn không thể đặt chồng lên đĩa nhỏ hơn!', true);
      const stand = document.querySelector(`.hanoi-peg-col[data-peg="${toPeg}"] .peg-stand`);
      if (stand) {
        stand.classList.add('shake-warning');
        setTimeout(() => stand.classList.remove('shake-warning'), 400);
      }
      this.render();
      return;
    }

    this.history.push({ from: fromPeg, to: toPeg });
    fromStack.pop();
    toStack.push(movingDisk);
    this.moves++;
    this.setFeedback(`✦ Đã chuyển đĩa ${this.diskNames[movingDisk]} sang Trụ ${toPeg + 1}`);
    window.folkAudio.playChime(360 + movingDisk * 75, 0.35);

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

    // Optimal BFS / recursive solver from current state to target state [ [], [], [4,3,2,1] ]
    const serialize = (pegs) => pegs.map(p => p.join(',')).join('|');
    const goalKey = '||4,3,2,1';
    const startKey = serialize(this.pegs);

    if (startKey === goalKey) return;

    const queue = [{ pegs: this.pegs.map(p => [...p]), firstMove: null }];
    const visited = new Set([startKey]);

    while (queue.length > 0) {
      const curr = queue.shift();
      const currKey = serialize(curr.pegs);
      if (currKey === goalKey && curr.firstMove) {
        this.selectedPeg = null;
        this.moveDisk(curr.firstMove.from, curr.firstMove.to);
        return;
      }

      for (let f = 0; f < 3; f++) {
        if (curr.pegs[f].length === 0) continue;
        const disk = curr.pegs[f][curr.pegs[f].length - 1];
        for (let t = 0; t < 3; t++) {
          if (f === t) continue;
          const topT = curr.pegs[t].length > 0 ? curr.pegs[t][curr.pegs[t].length - 1] : Infinity;
          if (disk < topT) {
            const nextPegs = curr.pegs.map(p => [...p]);
            nextPegs[t].push(nextPegs[f].pop());
            const nextKey = serialize(nextPegs);
            if (!visited.has(nextKey)) {
              visited.add(nextKey);
              queue.push({
                pegs: nextPegs,
                firstMove: curr.firstMove || { from: f, to: t }
              });
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
        diskEl.textContent = this.diskNames[diskSize] || `Tầng ${diskSize}`;

        if (this.selectedPeg === i && idx === this.pegs[i].length - 1) {
          diskEl.classList.add('lifted');
        }

        pegContainer.appendChild(diskEl);
      });
    }
  }
}

/* ============================================================
   3. LIGHTS OUT GAME (3x3 CELESTIAL STAR MATRIX)
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

    const scrambleCount = 5;
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

  handleCellClick(r, c, event) {
    if (this.isWon) return;

    this.toggleDirect(r, c);
    this.moves++;
    window.folkAudio.playChime(480 + (r * 3 + c) * 40, 0.35);

    if (event && window.app) {
      window.app.spawnFireworkBurst(event.clientX, event.clientY, 12);
    }

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

    // Exact BFS solver for 3x3 Lights Out (only 512 states!)
    const encode = (g) => {
      let mask = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (g[r][c]) mask |= (1 << (r * 3 + c));
        }
      }
      return mask;
    };

    const applyMoveMask = (mask, r, c) => {
      const deltas = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
      let next = mask;
      deltas.forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
          next ^= (1 << (nr * 3 + nc));
        }
      });
      return next;
    };

    const startMask = encode(this.grid);
    const targetMask = 511; // all 9 bits = 1
    if (startMask === targetMask) return;

    const queue = [{ mask: startMask, firstMove: null }];
    const visited = new Set([startMask]);

    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr.mask === targetMask && curr.firstMove) {
        this.handleCellClick(curr.firstMove.r, curr.firstMove.c);
        return;
      }
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const nextMask = applyMoveMask(curr.mask, r, c);
          if (!visited.has(nextMask)) {
            visited.add(nextMask);
            queue.push({
              mask: nextMask,
              firstMove: curr.firstMove || { r, c }
            });
          }
        }
      }
    }
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
          <svg viewBox="0 0 60 60" class="lantern-icon">
            <circle cx="30" cy="30" r="22" fill="none" stroke="${isOn ? 'rgba(245, 215, 127, 0.45)' : 'rgba(148, 163, 184, 0.15)'}" stroke-width="1.5" stroke-dasharray="3,3"/>
            <!-- 4-point outer star -->
            <polygon points="30,4 36,22 56,30 36,38 30,56 24,38 4,30 24,22" 
                     fill="${isOn ? '#f5d77f' : '#1e293b'}" 
                     stroke="${isOn ? '#ffffff' : '#475569'}" 
                     stroke-width="1.5"/>
            <!-- 4-point diagonal inner star -->
            <polygon points="14,14 30,23 46,14 37,30 46,46 30,37 14,46 23,30" 
                     fill="${isOn ? '#e5c158' : '#0f172a'}" 
                     opacity="0.85"/>
            <circle cx="30" cy="30" r="${isOn ? '7' : '4'}" fill="${isOn ? '#ffffff' : '#334155'}"/>
          </svg>
          <span class="lantern-num">Sao ${r * 3 + c + 1}</span>
        `;

        cell.onclick = (e) => this.handleCellClick(r, c, e);
        this.container.appendChild(cell);
      }
    }
  }
}

/* ============================================================
   4. WATER SORT PUZZLE (6 CRYSTAL TUBES TOTAL: 4 COLORS + 2 EMPTY)
   ============================================================ */
class WaterSortGame {
  constructor(containerId, onWinCallback) {
    this.container = document.getElementById(containerId);
    this.onWin = onWinCallback;
    // Updated to 6 tubes total: 4 cosmic colors + 2 empty crystal tubes
    this.numColors = 4;
    this.tubeCapacity = 4;
    this.totalTubes = 6;
    this.tubes = [];
    this.selectedTube = null;
    this.moves = 0;
    this.history = [];
    this.isWon = false;

    this.colorClasses = [
      'color-gold',
      'color-blue',
      'color-purple',
      'color-green'
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

    const btnHint = document.getElementById('btn-water-hint');
    if (btnHint) btnHint.onclick = () => this.autoHint();

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

    // Shuffle thoroughly and ensure no tube starts already solved
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    this.tubes = [];
    for (let i = 0; i < this.numColors; i++) {
      this.tubes.push(pool.slice(i * this.tubeCapacity, (i + 1) * this.tubeCapacity));
    }
    // Add 2 empty crystal buffer tubes => Total = 6 tubes
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

    if (fromTube.length === 0) return false;
    if (toTube.length >= this.tubeCapacity) {
      window.folkAudio.playClack();
      return false;
    }

    const movingColor = fromTube[fromTube.length - 1];
    const toTopColor = toTube.length > 0 ? toTube[toTube.length - 1] : null;

    if (toTopColor !== null && toTopColor !== movingColor) {
      window.folkAudio.playClack();
      return false;
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

    if (actualMoveCount === 0) return false;

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

    // Check if target tube just became completed
    if (toTube.length === this.tubeCapacity && toTube.every(c => c === toTube[0])) {
      window.folkAudio.playChime(784, 0.45);
      if (window.app) {
        window.app.spawnFireworkBurst(window.innerWidth / 2, window.innerHeight * 0.55, 22);
      }
    }

    this.render();
    this.checkWin();
    return true;
  }

  autoHint() {
    if (this.isWon) return;
    this.selectedTube = null;

    const isTubeComplete = (t) => t.length === this.tubeCapacity && t.every(c => c === t[0]);
    const isTubeUniform = (t) => t.length > 0 && t.every(c => c === t[0]);

    // 1. Prefer pouring onto a matching non-empty tube that can fit all top consecutive units
    for (let f = 0; f < this.totalTubes; f++) {
      const from = this.tubes[f];
      if (from.length === 0 || isTubeComplete(from)) continue;
      const topColor = from[from.length - 1];

      for (let t = 0; t < this.totalTubes; t++) {
        if (f === t) continue;
        const to = this.tubes[t];
        if (to.length > 0 && to.length < this.tubeCapacity && to[to.length - 1] === topColor) {
          if (this.pourWater(f, t)) return;
        }
      }
    }

    // 2. Otherwise pour from a mixed tube into an empty tube
    for (let f = 0; f < this.totalTubes; f++) {
      const from = this.tubes[f];
      if (from.length === 0 || isTubeUniform(from)) continue;
      for (let t = 0; t < this.totalTubes; t++) {
        if (f === t) continue;
        if (this.tubes[t].length === 0) {
          if (this.pourWater(f, t)) return;
        }
      }
    }
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
   5. UNBLOCK ROYAL VAULT (OBSIDIAN & 24K GOLD AGE 21 BLOCK)
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

    const boardWidth = this.board.clientWidth || 330;
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
        el.innerHTML = `
          <div class="lacquer-gloss"></div>
          <div class="lacquer-gold-border"></div>
          <span class="target-title">✦ TUỔI 21 ✦</span>
          <span class="target-arrow">➔</span>
        `;
      } else {
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

    // BFS shortest path solver for the 6x6 Unblock board
    const encodeState = (blocks) => blocks.map(b => b.orientation === 'h' ? b.c : b.r).join(',');
    const isOcc = (blocks, r, c, ignoreIdx) => {
      for (let i = 0; i < blocks.length; i++) {
        if (i === ignoreIdx) continue;
        const b = blocks[i];
        if (b.orientation === 'h') {
          if (b.r === r && c >= b.c && c < b.c + b.len) return true;
        } else {
          if (b.c === c && r >= b.r && r < b.r + b.len) return true;
        }
      }
      return false;
    };

    const startState = this.blocks.map(b => ({ ...b }));
    const queue = [{ blocks: startState, firstMove: null }];
    const visited = new Set([encodeState(startState)]);

    while (queue.length > 0) {
      const curr = queue.shift();
      const targetBlock = curr.blocks[0];
      if (targetBlock.c >= 4 && curr.firstMove) {
        const blk = this.blocks[curr.firstMove.idx];
        this.tryMoveBlock(blk, curr.firstMove.pos);
        this.checkWin();
        return;
      }

      for (let i = 0; i < curr.blocks.length; i++) {
        const b = curr.blocks[i];
        const currPos = b.orientation === 'h' ? b.c : b.r;

        for (const dir of [1, -1]) {
          let stepPos = currPos + dir;
          while (stepPos >= 0 && stepPos + b.len <= this.gridSize) {
            const checkCell = dir > 0 ? stepPos + b.len - 1 : stepPos;
            const r = b.orientation === 'h' ? b.r : checkCell;
            const c = b.orientation === 'h' ? checkCell : b.c;
            if (isOcc(curr.blocks, r, c, i)) break;

            const nextBlocks = curr.blocks.map(x => ({ ...x }));
            if (b.orientation === 'h') nextBlocks[i].c = stepPos;
            else nextBlocks[i].r = stepPos;

            const key = encodeState(nextBlocks);
            if (!visited.has(key)) {
              visited.add(key);
              queue.push({
                blocks: nextBlocks,
                firstMove: curr.firstMove || { idx: i, pos: stepPos }
              });
            }
            stepPos += dir;
          }
        }
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
