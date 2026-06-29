let score = 0;
const targetScore = 22;
let moveInterval = null;
let currentDirection = null;
let playerX = 100;
let enemyX = 170; // Tracked as offset distance from the RIGHT border edge
let playerHealth = 6;
let enemyHealth = 22;
let isKO = false;
let currentPhase = 1;

// Per-phase UI labels and battle start text for the current matchup
const combatStates = {
    1: { pLabel: "YUJI ITADORI", trackLabel: "PHASE 1: OKKOTSU SHOWDOWN", startMsg: "MATCH START: ITADORI VS. OKKOTSU!" },
    2: { pLabel: "HAKARI KINJI", trackLabel: "PHASE 2: KASHIMO SHOWDOWN", startMsg: "HAKARI ENTERS! KASHIMO FIGHTS BACK!" },
    3: { pLabel: "YUJI ITADORI", trackLabel: "PHASE 3: COURTROOM", startMsg: "FINAL STAND: ITADORI VS. HIGURUMA!" }
};

function startMove(direction) {
    if (moveInterval || isKO) return;
    currentDirection = direction;
    
    moveInterval = setInterval(() => {
        const playerEl = document.getElementById('player-sprite');
        const enemyEl = document.getElementById('enemy-sprite');
        
        const playerRect = playerEl.getBoundingClientRect();
        const enemyRect = enemyEl.getBoundingClientRect();
        const absoluteGap = enemyRect.left - playerRect.right;

        if (currentDirection === '+') {
            // Forward movement constraint - stops before overlapping model
            if (absoluteGap > 10 && playerRect.right < (window.innerWidth - 40)) {
                playerX += 8;
            }
        } else if (currentDirection === '-') {
            // Backward movement boundary safety check
            if (playerX > 20) {
                playerX -= 8;
            }
        }

        // Simulating subtle reactive enemy tracking pacing adjustments
        if (absoluteGap > 180) {
            enemyX += 0.6; 
        }

        playerEl.style.left = `${playerX}px`;
        enemyEl.style.right = `${enemyX}px`;
    }, 20);
}

function stopMove() {
    clearInterval(moveInterval);
    moveInterval = null;
}

function updateHealthUI() {
    document.getElementById('player-health').innerText = `HP: ${playerHealth.toString().padStart(2, '0')}`;
    document.getElementById('enemy-health').innerText = `ENEMY HP: ${enemyHealth.toString().padStart(2, '0')}`;
}

function showKO(message, loserEl) {
    const koBanner = document.getElementById('ko-banner');
    koBanner.innerText = message;
    koBanner.classList.remove('hidden-element');
    loserEl.classList.add('ko-state');
    stopMove();
    isKO = true;
    document.getElementById('console-controls').style.pointerEvents = 'none';

    // Show retry button when player loses
    const retryBtn = document.getElementById('retry-button');
    if (message.includes('HERO')) {
        retryBtn.classList.remove('hidden-element');
    }
}

function handlePhaseWin(phaseIndex, enemyEl) {
    stopMove();
    isKO = true;
    document.getElementById('console-controls').style.pointerEvents = 'none';
    
    const koBanner = document.getElementById('ko-banner');
    koBanner.innerText = `PHASE ${phaseIndex} CLEARED`;
    koBanner.classList.remove('hidden-element');

    setTimeout(() => {
        if (phaseIndex < 3) {
            const map = {
                1: ["bg-phase-1", "bg-phase-2"],
                2: ["bg-phase-2", "bg-phase-3"]
            };
            const args = map[phaseIndex];
            
            // Advance state tracking parameters safely
            shiftMatchConfigurations(phaseIndex + 1, args[0], args[1]);
            
            score = 0;
            enemyHealth = 22;
            updateHealthUI();
            document.getElementById('score-counter').innerText = `00 / ${targetScore} HIT`;
            isKO = false;
        } else {
            executeMatchVictory();
        }
    }, 3000);
}

function hideKO() {
    const koBanner = document.getElementById('ko-banner');
    koBanner.classList.add('hidden-element');
    document.getElementById('console-controls').style.pointerEvents = 'auto';
}

function triggerAttack(type) {
    if (isKO) return;

    const playerEl = document.getElementById('player-sprite');
    const enemyEl = document.getElementById('enemy-sprite');
    const logBox = document.getElementById('system-log');
    const flashEl = document.getElementById('hit-flash');

    let phase = currentPhase;

    // Instantly commit character attack visual layout class matching active context
    playerEl.className = `sprite-character player-p${phase}-${type}`;
    
    // Computing accurate structural distance matrix via bounding dimensions
    const playerRect = playerEl.getBoundingClientRect();
    const enemyRect = enemyEl.getBoundingClientRect();
    const distanceBetween = enemyRect.left - playerRect.right;
    
    const enemyMove = Math.random() > 0.5 ? 'punch' : 'kick';
    const counterDamage = 1;
    const phase2SingleCounterKey = 'phase2Countered';

    function finalizePostHit() {
        document.getElementById('score-counter').innerText = `${score < 10 ? '0' + score : score} / ${targetScore} HIT`;
        enemyEl.className = `sprite-character enemy-p${phase}-${enemyMove}`;
        flashEl.classList.remove('hidden-element');
        logBox.innerText = `STRIKE CONNECTED! ENEMY ${enemyMove.toUpperCase()} COUNTER!`;
        updateHealthUI();

        if (enemyHealth === 0) {
            handlePhaseWin(phase, enemyEl);
            return;
        }

        if (playerHealth === 0) {
            showKO('K.O.! HERO DOWN', playerEl);
            return;
        }

        confetti({ particleCount: 4, spread: 15, colors: ['#ff0055', '#00f3ff'] });

    }

    // HIT RESOLUTION FIELD MAP MECHANICS
    if (distanceBetween <= 65) {
        score++;
        enemyHealth = Math.max(0, enemyHealth - 1);

        // Phase 2: Dynamic single phase entrance pause-counter mechanics
        if (phase === 2 && !sessionStorage.getItem(phase2SingleCounterKey)) {
            logBox.innerText = 'ENEMY PAUSES...';
            enemyEl.className = `sprite-character enemy-p${phase}-idle`;
            setTimeout(() => {
                // Pre-check layout safety sequence state boundaries before reducing health values
                if (isKO) return;
                playerHealth = Math.max(0, playerHealth - counterDamage);
                sessionStorage.setItem(phase2SingleCounterKey, '1');
                finalizePostHit();
            }, 600);
            return;
        }

        finalizePostHit();
        return;
    }

    // MISS RESOLUTION FIELD MAP MECHANICS
    enemyEl.className = `sprite-character enemy-p${phase}-${enemyMove}`;
    
    if (phase === 2 && !sessionStorage.getItem(phase2SingleCounterKey)) {
        logBox.innerText = 'ENEMY PAUSES...';
        setTimeout(() => {
            if (isKO) return;
            playerHealth = Math.max(0, playerHealth - counterDamage);
            sessionStorage.setItem(phase2SingleCounterKey, '1');
            logBox.innerText = `MISSED! ENEMY ${enemyMove.toUpperCase()} COUNTERS! -${counterDamage} HP`;
            flashEl.classList.add('hidden-element');
            updateHealthUI();
            if (playerHealth === 0) {
                showKO('K.O.! HERO DOWN', playerEl);
                return;
            }
        }, 600);
    } else {
        logBox.innerText = `MISSED! ENEMY ${enemyMove.toUpperCase()} COUNTERS!`;
        flashEl.classList.add('hidden-element');
        updateHealthUI();
    }

    setTimeout(() => {
        // Safety lock check: if round has wrapped, prevent overwriting phase change configurations
        if (isKO) return;

        playerEl.className = `sprite-character player-p${currentPhase}-idle`;
        enemyEl.className = `sprite-character enemy-p${currentPhase}-idle`;
        flashEl.classList.add('hidden-element');
    }, 280);
}

function shiftMatchConfigurations(phaseIndex, oldBg, newBg) {
    const playerEl = document.getElementById('player-sprite');
    const enemyEl = document.getElementById('enemy-sprite');
    const stageEl = document.getElementById('battle-stage');
    const config = combatStates[phaseIndex];
    
    hideKO();
    playerEl.classList.remove('ko-state');
    enemyEl.classList.remove('ko-state');
    isKO = false;

    stageEl.classList.remove(oldBg);
    stageEl.classList.add(newBg);

    playerEl.className = `sprite-character player-p${phaseIndex}-idle`;
    enemyEl.className = `sprite-character enemy-p${phaseIndex}-idle`;

    // Snap locations back to pristine initial setup states
    playerX = 100;
    enemyX = 100;
    playerEl.style.left = "100px";
    enemyEl.style.right = "100px";

    document.getElementById('player-label').innerText = config.pLabel;
    document.getElementById('game-alert').innerText = config.trackLabel;
    document.getElementById('system-log').innerText = config.startMsg;

    if (phaseIndex === 2) {
        sessionStorage.removeItem('phase2Countered');
    }
    
    currentPhase = phaseIndex;
}

function executeMatchVictory() {
    stopMove();
    document.getElementById('game-hud').style.display = 'none';
    document.getElementById('battle-stage').style.display = 'none';
    document.getElementById('console-controls').style.display = 'none';

    const revealScreen = document.getElementById('birthday-reveal');
    revealScreen.style.display = "flex";
    revealScreen.classList.remove('hidden-view');

    let end = Date.now() + (4 * 1000);
    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 65, origin: { x: 0 }, colors: ['#ff0055', '#ffcc00'] });
        confetti({ particleCount: 5, angle: 120, spread: 65, origin: { x: 1 }, colors: ['#ff0055', '#ffcc00'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

// Retry handler linkage configuration
const retryBtn = document.getElementById('retry-button');
if (retryBtn) {
    retryBtn.addEventListener('click', () => {
        isKO = false;
        hideKO();
        document.getElementById('console-controls').style.pointerEvents = 'auto';
        retryBtn.classList.add('hidden-element');
        
        // Restore health and pull targeted instance variables directly from active phase context
        playerHealth = 2;
        updateHealthUI();
        
        const playerEl = document.getElementById('player-sprite');
        playerEl.classList.remove('ko-state');
        playerEl.className = `sprite-character player-p${currentPhase}-idle`;
    });
}