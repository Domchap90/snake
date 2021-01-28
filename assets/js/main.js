
class SnakeGame {

    static NUM_ROWS = 60;
    static NUM_COLS = 120;

    boardCells = [];
    score = 0;

    constructor(board, controls) {

        this.board = board;
        this.controls = controls;

        this.scoreCounter = this.controls.querySelector('.score');

        this.initBoard();

        this.snake = new Snake(this);
        this.food = new Food(this);

        window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                case 'a':
                    this.snake.setDirection('left');
                    break;

                case 'ArrowUp':
                case 'w':
                    this.snake.setDirection('up');
                    break;

                case 'ArrowRight':
                case 'd':
                    this.snake.setDirection('right');
                    break;

                case 'ArrowDown':
                case 's':
                    this.snake.setDirection('down');
                    break;

                case 'Escape':
                    this.snake.pause();
                    break;
            }
        });

    }

    /**
     * Build the board using rows of cells
     */
    initBoard() {

        // Generate a new row
        const newRow = (rowNum) => {
            const row = document.createElement('div');
            row.classList.add('row');
            row.classList.add('row-' + rowNum);
            return row;
        }
        // Generate a new column
        const newCol = (colNum) => {
            const col = document.createElement('div');
            col.classList.add('col');
            col.classList.add('col-' + colNum);
            return col;
        }

        // For each number of rows make a new row element and fill with columns
        for (let r = 0; r < SnakeGame.NUM_ROWS; r++) {

            const row = newRow(r);
            const boardCellsRow = [];

            // For each number of columns make a new column element and add to the row
            for (let c = 0; c < SnakeGame.NUM_COLS; c++) {

                const col = newCol(c);
                row.appendChild(col);
                boardCellsRow.push(col);

            }

            this.board.appendChild(row);
            this.boardCells.push(boardCellsRow);

        }

    }

    /**
     * Begin the game
     */
    play() {

        this.controls.classList.add('playing');

        this.snake.move();
        this.food.move();

    }

    /**
     * Restart the game after game over
     */
    restart() {

        this.snake.reset();
        this.controls.classList.remove('game-over');
        this.board.classList.remove('game-over');
        this.play();

    }

    /**
     * Increment the user's score
     */
    increaseScore(amount) {

        this.score += amount;
        this.scoreCounter.innerText = this.score;

    }

    /**
     * End the game
     */
    async gameOver() {

        this.snake.pause();

        this.controls.classList.remove('playing');
        this.controls.classList.add('game-over');
        this.board.classList.add('game-over');

    }

}

class Snake {

    static STARTING_EDGE_OFFSET = 20;

    tail = [];
    tailLength = 6;
    direction = 'up';
    speed = 160;
    moving = false;

    constructor(game) {

        this.game = game;

        this.init();

    }

    /**
     * Place the snake initially
     */
    init() {

        const x = Math.floor(Math.random() * (SnakeGame.NUM_COLS - Snake.STARTING_EDGE_OFFSET)) + (Snake.STARTING_EDGE_OFFSET / 2);
        const y = Math.floor(Math.random() * (SnakeGame.NUM_ROWS - Snake.STARTING_EDGE_OFFSET)) + (Snake.STARTING_EDGE_OFFSET / 2);
        this.position = { x, y };

        const startCell = this.game.boardCells[y][x];
        startCell.classList.add('snake');

        this.tail.push(startCell);

    }

    /**
     * Move the snake
     */
    move() {

        // If this is the first move, make sure the game isn't paused
        if (!this.moving) {
            this.moving = true;
            this.game.controls.classList.remove('paused');
        }

        // Todo: add the snake moving logic here and check if the snake hits a wall, itself, or food

        // Move another step in `this.speed` number of milliseconds
        this.movementTimer = setTimeout(() => { this.move(); }, this.speed);

    }

    /**
     * Set the snake's direction
     */
    setDirection(direction) {

        // Todo: update the snake's direction here

    }

    /**
     * Pause the snake's movement
     */
    pause() {
        clearTimeout(this.movementTimer);
        this.moving = false;
        this.game.controls.classList.add('paused');
    }

    /**
     * Reset the snake back to the initial defaults
     */
    reset() {

        for (let i = 0; i < this.tail.length; i++) {
            this.tail[i].classList.remove('snake');
        }
        this.tail.length = 0;
        this.tailLength = 6;
        this.direction = 'up';
        this.speed = 160;
        this.moving = false;

        this.init();

    }

}

class Food {

    constructor(game) {

        this.game = game;

    }

    /**
     * Place the food randomly on the board, by adding the class 'food' to one of the cells
     */
    move() {

        // Todo: write this

    }

}
