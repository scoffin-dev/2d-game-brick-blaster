var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");  

var gameDifficultySelector = document.getElementById("select-game-difficulty");
var gameDifficulty = 0;
var startButton = document.getElementById("start-button");
var stopButton = document.getElementById("stop-button");
var viewRulesButton = document.getElementById("view-rules-button");
var rulesList = document.getElementById("rules");

var ballSpeed = 30;

// starting coordinates
var x = canvas.width/2;
var y = canvas.height-30;

// define movement
var dx = 2;
var dy = -2;

var ballRadius = 10;
var ballColor = "orange";

var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width-paddleWidth) / 2;

var rightPressed = false;
var leftPressed = false;

var brickRowCount = 3;
var brickColumnCount = 5;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;

var bricks = [];
for(var c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(var r=0; r<brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 }; // status indicates if brick has been hit or not
    }
}

var score = 0;

var lives = 3;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// paddle movement
function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") { // Right and Left are IE specific (everyone else uses ArrowRight/Left)
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}
function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

// detect when the ball hits a brick
function collisionDetection() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];
            if(b.status == 1) {
                if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    ballColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6); // change to random color on bounce
                    if(score == brickRowCount*brickColumnCount) {
                        setTimeout(function(){ alert("CRUSHED IT! Your final score = " + score); }, 100);
                        setTimeout(function(){ document.location.reload(); clearInterval(interval); }, 500);
                    }
                }
            }
        }
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+score, 8, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status == 1) {
                var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
                var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "red";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function draw() {    
    // clear the canvas so the last frame isn't displayed
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();

    // detect when bricks are hit
    collisionDetection();
    
    // make ball bounce off top wall of canvas or end game if ball hits bottom wall
    if(y + dy < ballRadius) {
        ballColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6); // change to random color on bounce
        dy = -dy;
    } else if(y + dy > canvas.height-ballRadius) { // if the ball hits the paddle, it moves back into the playing area
        if(x > paddleX && x < paddleX + paddleWidth) {
            ballColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6); // change to random color on bounce
            dy = -dy;
        }
        else {
            lives--;
            if(!lives) {
                setTimeout(function(){ alert("Better luck next time... Final score = " + score); }, 100);
                setTimeout(function(){ document.location.reload(); clearInterval(interval); }, 500);
            }
            else {
                x = canvas.width/2;
                y = canvas.height-30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width-paddleWidth)/2;
            }
        }
    }
    // make ball bounce off left and right walls of canvas
    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        ballColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6); // change to random color on bounce
        dx = -dx;
    }
    
    x += dx;
    y += dy;

    // when right or left arrow is pressed, move the paddle accordingly within the confines of the canvas
    if(rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    }
    else if(leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    // move the ball
    // var interval = setInterval(draw, ballSpeed); 
}

gameDifficultySelector.onchange = function() {
    gameDifficulty = gameDifficultySelector.value;
}

var startAndStopButton = document.getElementById("start-and-stop-button");

var startOrStop = "start";

startAndStopButton.onclick = function() {
    if(startOrStop == "start") {
        startAndStopButton.value = "Start";
        if(gameDifficulty == 0) {
            alert("You must select a level of difficulty before starting the game.");
        } else {
            if(gameDifficulty == 1) {
                    ballSpeed = 30;
            } else if(gameDifficulty == 2) {
                    ballSpeed = 20;
            } else {
                    ballSpeed = 15;
            }
            console.log("START: game difficulty = level " + gameDifficulty + " and ball speed = " + ballSpeed + " ms");
            var interval = setInterval(draw, ballSpeed); 
            startAndStopButton.classList.remove("start");
            startAndStopButton.classList.add("stop");
            startAndStopButton.value = "Stop";
            startOrStop = "stop";
        }
    } else {
        document.location.reload();
        clearInterval(interval); // Needed for Chrome to end game
        startAndStopButton.classList.remove("stop");
        startAndStopButton.classList.add("start");
        startAndStopButton.value = "Start";
        startOrStop = "start";
    }
};

var clicks = 1;

viewRulesButton.onclick = function() {
    if(clicks == 1) {
        rulesList.classList.remove("collapse");
        rulesList.classList.add("expand");
        clicks = 2;        
        viewRulesButton.value = "Close Game Rules";
    } else {
        rulesList.classList.remove("expand");
        rulesList.classList.add("collapse");
        clicks = 1;        
        viewRulesButton.value = "View Game Rules";
    }
}
