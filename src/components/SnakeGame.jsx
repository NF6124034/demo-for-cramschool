import { useState, useEffect, useRef } from 'react';
import '../styles/SnakeGame.css';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const Direction = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
};

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const gameContainerRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(Direction.RIGHT);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  // Generate random food position
  const generateFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    // Make sure food doesn't spawn on snake
    const isOnSnake = snake.some(segment => 
      segment.x === newFood.x && segment.y === newFood.y
    );
    
    if (isOnSnake) {
      return generateFood();
    }
    
    return newFood;
  };

  // Reset game state
  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection(Direction.RIGHT);
    setScore(0);
    setGameOver(false);
    setSpeed(INITIAL_SPEED);
  };

  // Handle keyboard controls with preventDefault to stop page scrolling
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted) return;
      
      // Prevent default behavior for arrow keys when game is active
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
      
      switch(e.key) {
        case "ArrowUp":
          if (direction !== Direction.DOWN) setDirection(Direction.UP);
          break;
        case "ArrowDown":
          if (direction !== Direction.UP) setDirection(Direction.DOWN);
          break;
        case "ArrowLeft":
          if (direction !== Direction.RIGHT) setDirection(Direction.LEFT);
          break;
        case "ArrowRight":
          if (direction !== Direction.LEFT) setDirection(Direction.RIGHT);
          break;
        case " ": // Space key to pause/resume
          setGameStarted(prev => !prev);
          break;
        default:
          break;
      }
    };

    // Only add event listener when component is focused
    const handleFocus = () => {
      window.addEventListener('keydown', handleKeyPress);
    };

    const handleBlur = () => {
      window.removeEventListener('keydown', handleKeyPress);
    };

    // Setup listeners when game is running
    if (gameStarted && !gameOver && gameContainerRef.current) {
      // Add focus to container when game starts
      gameContainerRef.current.focus();
      
      // Add keyboard event listener
      window.addEventListener('keydown', handleKeyPress);
      
      // Add focus/blur listeners
      gameContainerRef.current.addEventListener('focus', handleFocus);
      gameContainerRef.current.addEventListener('blur', handleBlur);
    }

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (gameContainerRef.current) {
        gameContainerRef.current.removeEventListener('focus', handleFocus);
        gameContainerRef.current.removeEventListener('blur', handleBlur);
      }
    };
  }, [gameStarted, gameOver, direction]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        // Move head based on direction
        switch(direction) {
          case Direction.UP:
            head.y -= 1;
            break;
          case Direction.DOWN:
            head.y += 1;
            break;
          case Direction.LEFT:
            head.x -= 1;
            break;
          case Direction.RIGHT:
            head.x += 1;
            break;
          default:
            break;
        }

        // Check for collisions with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Check for collisions with self
        for (let i = 0; i < newSnake.length; i++) {
          if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
            setGameOver(true);
            return prevSnake;
          }
        }

        // Check if snake eats food
        if (head.x === food.x && head.y === food.y) {
          // Increase score
          setScore(s => s + 10);
          // Generate new food
          setFood(generateFood());
          // Increase speed slightly
          setSpeed(s => Math.max(s - 5, 50));
          // Don't remove tail to grow snake
        } else {
          // Remove tail
          newSnake.pop();
        }

        // Add new head to beginning
        newSnake.unshift(head);
        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [gameStarted, gameOver, food, direction, speed]);

  // Draw game on canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = 'green';
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Draw snake head
        ctx.fillStyle = '#006400'; // Dark green for head
      } else {
        ctx.fillStyle = '#32CD32'; // Lime green for body
      }
      ctx.fillRect(
        segment.x * CELL_SIZE, 
        segment.y * CELL_SIZE, 
        CELL_SIZE, 
        CELL_SIZE
      );
      
      // Add eyes to head
      if (index === 0) {
        ctx.fillStyle = 'white';
        const eyeSize = CELL_SIZE / 5;
        let eyeX1, eyeX2, eyeY1, eyeY2;
        
        switch(direction) {
          case Direction.RIGHT:
            eyeX1 = eyeX2 = segment.x * CELL_SIZE + CELL_SIZE * 0.7;
            eyeY1 = segment.y * CELL_SIZE + CELL_SIZE * 0.3;
            eyeY2 = segment.y * CELL_SIZE + CELL_SIZE * 0.7;
            break;
          case Direction.LEFT:
            eyeX1 = eyeX2 = segment.x * CELL_SIZE + CELL_SIZE * 0.3;
            eyeY1 = segment.y * CELL_SIZE + CELL_SIZE * 0.3;
            eyeY2 = segment.y * CELL_SIZE + CELL_SIZE * 0.7;
            break;
          case Direction.UP:
            eyeX1 = segment.x * CELL_SIZE + CELL_SIZE * 0.3;
            eyeX2 = segment.x * CELL_SIZE + CELL_SIZE * 0.7;
            eyeY1 = eyeY2 = segment.y * CELL_SIZE + CELL_SIZE * 0.3;
            break;
          case Direction.DOWN:
            eyeX1 = segment.x * CELL_SIZE + CELL_SIZE * 0.3;
            eyeX2 = segment.x * CELL_SIZE + CELL_SIZE * 0.7;
            eyeY1 = eyeY2 = segment.y * CELL_SIZE + CELL_SIZE * 0.7;
            break;
        }
        
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw food
    ctx.fillStyle = 'red';
    ctx.beginPath();
    const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.arc(centerX, centerY, CELL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw grid (optional)
    if (false) { // Set to true if you want to see grid lines
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
        ctx.stroke();
      }
    }
  }, [snake, food, direction]);

  const startGame = () => {
    resetGame();
    setGameStarted(true);
    // Focus the game container when starting
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  };
  
  const toggleGame = () => {
    if (gameOver) {
      startGame();
    } else {
      setGameStarted(!gameStarted);
      
      // Focus the game container when toggling
      if (gameContainerRef.current && !gameStarted) {
        gameContainerRef.current.focus();
      }
    }
  };

  // Add touch controls for mobile devices
  const handleTouchStart = (e) => {
    if (!gameStarted || gameOver) return;
    
    // Store the initial touch position
    const touchStartX = e.touches[0].clientX;
    const touchStartY = e.touches[0].clientY;
    
    const handleTouchMove = (e) => {
      if (!gameStarted) return;
      
      // Prevent default behavior to avoid page scrolling
      e.preventDefault();
      
      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Determine swipe direction based on the largest movement
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && direction !== Direction.LEFT) {
          setDirection(Direction.RIGHT);
        } else if (deltaX < 0 && direction !== Direction.RIGHT) {
          setDirection(Direction.LEFT);
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && direction !== Direction.UP) {
          setDirection(Direction.DOWN);
        } else if (deltaY < 0 && direction !== Direction.DOWN) {
          setDirection(Direction.UP);
        }
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div 
      className="snake-game-container" 
      ref={gameContainerRef}
      tabIndex={0} // Makes div focusable
      onTouchStart={handleTouchStart}
    >
      <div className="game-header">
        <h2>貪吃蛇遊戲</h2>
        <div className="score-display">分數: {score}</div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="game-canvas"
      />
      
      <div className="game-controls">
        <button onClick={toggleGame} className="game-button">
          {gameOver ? '重新開始' : gameStarted ? '暫停' : '開始'}
        </button>
        {gameStarted && !gameOver && (
          <button onClick={() => setGameStarted(false)} className="game-button">
            暫停
          </button>
        )}
      </div>
      
      {!gameStarted && !gameOver && (
        <div className="game-instructions">
          <p>使用方向鍵移動貪吃蛇</p>
          <p>吃紅色的食物增加分數</p>
          <p>碰到牆壁或自己就會遊戲結束</p>
          <p><strong>空白鍵</strong>可暫停或繼續遊戲</p>
          <p>手機可使用觸控滑動控制</p>
        </div>
      )}
      
      {gameOver && (
        <div className="game-over">
          <h3>遊戲結束!</h3>
          <p>最終分數: {score}</p>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;