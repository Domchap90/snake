document.addEventListener('DOMContentLoaded', (event) => {
    // const close = document.getElementById('close');
    // close.addEventListener("click", hideModal);
})

function hideModal() {

    document.querySelector('.modal-background').style.display = "none";
}

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
        this.food.deleteFood(this.food.x, this.food.y);
        this.score = 0;
        this.scoreCounter.innerText = this.score;
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
        this.registerScore();
    }

    getHighScores() {
        
        const xhr = new XMLHttpRequest();
        const url='https://snake.howbout.app/api/dominic/high-scores';
        
        xhr.open("GET", url);
        xhr.onreadystatechange =  () => {
    
            if (xhr.readyState === 4 && xhr.status === 200) {
                let r = JSON.parse(xhr.responseText);

                r.sort((a, b) => {
                    return b['score'] - a['score'];
                });
                r = r.slice(0, 10);

                // Reset inner HTML before appending top 10 scores.
                document.querySelector('#high-scores tbody').innerHTML = '';

                // Initialize counter for ranks col.
                let counter = 1;

                for (let entry of r){
                    document.querySelector('#high-scores tbody').innerHTML += `<tr>
                            <td>${counter}</td>
                            <td>${entry['name']}</td>
                            <td>${entry['score']}</td>
                            <td>${getTime(entry['created_at'])} on ${getDate(entry['created_at'])}</td>
                        </tr>`;
                    counter++;
                }
                document.querySelector('.modal-background').style.display = "block";
            }
        };
        xhr.send();
        
    }

    registerScore() {
        const xhr = new XMLHttpRequest();
        const url='https://snake.howbout.app/api/dominic/high-scores';
        const data = {
                        "name": "Dominic",
                        "score": this.score
                    }
        xhr.open("POST", url);

        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200 ) {
                
            }
        };

        xhr.send(JSON.stringify(data));        
    }

    // hideModal() {
    //     console.log('hideModal entered.')
    //     document.querySelector('.modal-background').style.display = "none";
    // }
}

class Snake {

    static STARTING_EDGE_OFFSET = 20;

    tail = [];
    tailLength = 6;
    direction = 'up';
    speed = 160;
    moving = false;
    deltaY = 0;
    deltaX = 0;

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
        this.setDirection(this.direction);
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
        this.position.x += this.deltaX;
        this.position.y += this.deltaY;

        if (this.checkPosition() === false)
            return this.game.gameOver();

        // When snake head meets the same cell as food.
        if (this.game.food.x === this.position.x && this.game.food.y === this.position.y) {
            this.game.food.move();
            this.tailLength++;
            if (this.speed > 4)
                this.speed -= 5;
            console.log('speed changed to '+this.speed)
            this.game.increaseScore(1);
            this.game.food.deleteFood(this.position.x, this.position.y);
            
        }

        const head = this.game.boardCells[this.position.y][this.position.x];

        // When head meets the rest of the tail
        if(head.classList.contains('snake')) 
            return this.game.gameOver();

        this.tail.push(head);

        // Maintain tail length as head advances 
        if (this.tail.length > this.tailLength) {
            const tailEndExtra = this.tail.shift();
            tailEndExtra.classList.remove('snake');
        } 
        head.classList.add('snake');


        // Move another step in `this.speed` number of milliseconds
        this.movementTimer = setTimeout(() => { this.move(); }, this.speed);

    }

    /**
     * Set the snake's direction
     */
    setDirection(direction) {

        switch(direction){
            case('up'):
                this.deltaY = -1;
                this.deltaX = 0;
                break;
            case('right'):
                this.deltaY = 0;
                this.deltaX = 1;
                break;
            case('down'):
                this.deltaY = 1;
                this.deltaX = 0;
                break;
            case('left'):
                this.deltaY = 0;
                this.deltaX = -1;
                break;
        }

    }

    checkPosition() {

        if (this.position.x >= SnakeGame.NUM_COLS || this.position.x < 0 || this.position.y >= SnakeGame.NUM_ROWS || this.position.y < 0)
            return false;

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
    x;
    y;
    // foodCell;
    
    constructor(game) {

        this.game = game;

    }

    /**
     * Place the food randomly on the board, by adding the class 'food' to one of the cells
     */
    move() {

        // Todo: write this
        this.x = Math.floor(Math.random() * SnakeGame.NUM_COLS);
        this.y = Math.floor(Math.random() * SnakeGame.NUM_ROWS);

        const foodCell = this.game.boardCells[this.y][this.x];
        foodCell.classList.add('food');
    }

    deleteFood(x, y) {
        const foodCell = this.game.boardCells[y][x];
        foodCell.classList.remove('food');
    }

}

function getDate(isodate) {
    // const regex = /[\d\d\d\d-\d\d-\d\d]/g;
    const date = isodate.split('T')[0];
    return date.split("-").reverse().join("/");
}

function getTime(isodate) {
    const regex = /T\d\d:\d\d/g;
    const time = isodate.match(regex).toString();
    return time.substring(1);
}