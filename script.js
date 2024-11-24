class SimonGame {
    constructor() {
        this.sequence = [];
        this.playerSequence = [];
        this.score = 0;
        this.buttons = document.querySelectorAll('.button');
        this.startButton = document.getElementById('start-btn');
        this.scoreElement = document.getElementById('score');
        this.statusElement = document.getElementById('game-status');
        this.isPlaying = false;
        this.sounds = {};
        
        this.initializeSounds();
        this.addEventListeners();
    }

    initializeSounds() {
        const frequencies = {
            'green': 261.6, // C4
            'red': 329.6,   // E4
            'yellow': 392,  // G4
            'blue': 523.2   // C5
        };

        for (const [color, freq] of Object.entries(frequencies)) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            
            this.sounds[color] = {
                context: audioContext,
                oscillator: oscillator,
                gainNode: gainNode
            };
        }
    }

    addEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        
        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (this.isPlaying) {
                    const color = button.dataset.color;
                    this.handlePlayerInput(color);
                }
            });
        });
    }

    startGame() {
        this.sequence = [];
        this.playerSequence = [];
        this.score = 0;
        this.isPlaying = true;
        this.scoreElement.textContent = this.score;
        this.statusElement.textContent = '';
        this.startButton.textContent = 'Restart Game';
        this.addToSequence();
    }

    addToSequence() {
        const colors = ['green', 'red', 'yellow', 'blue'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.sequence.push(randomColor);
        this.playSequence();
    }

    async playSequence() {
        this.isPlaying = false;
        this.statusElement.textContent = 'Watch the sequence...';
        
        for (let i = 0; i < this.sequence.length; i++) {
            await this.delay(500);
            await this.activateButton(this.sequence[i]);
        }
        
        this.isPlaying = true;
        this.statusElement.textContent = 'Your turn!';
        this.playerSequence = [];
    }

    async activateButton(color) {
        const button = document.querySelector(`[data-color="${color}"]`);
        button.classList.add('active');
        this.playSound(color);
        await this.delay(300);
        button.classList.remove('active');
        await this.delay(100);
    }

    playSound(color) {
        const sound = this.sounds[color];
        const time = sound.context.currentTime;
        
        sound.oscillator.start(time);
        sound.gainNode.gain.setValueAtTime(0.5, time);
        sound.gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        
        setTimeout(() => {
            sound.oscillator.stop();
            this.initializeSounds(); // Reinitialize for next play
        }, 500);
    }

    handlePlayerInput(color) {
        this.playerSequence.push(color);
        this.activateButton(color);

        const currentIndex = this.playerSequence.length - 1;
        
        if (this.playerSequence[currentIndex] !== this.sequence[currentIndex]) {
            this.gameOver();
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            this.score++;
            this.scoreElement.textContent = this.score;
            this.playerSequence = [];
            setTimeout(() => this.addToSequence(), 1000);
        }
    }

    gameOver() {
        this.isPlaying = false;
        this.statusElement.textContent = 'Game Over! Press Start to play again';
        this.startButton.textContent = 'Start Game';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SimonGame();
});
