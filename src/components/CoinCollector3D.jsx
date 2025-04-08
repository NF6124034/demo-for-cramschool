import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, Sphere, Sky, Text } from '@react-three/drei';
import { Vector3, MathUtils } from 'three';
import '../styles/CoinCollector3D.css';

// 视角控制组件
const CameraController = ({ position, rotation, setRotation }) => {
  const { camera } = useThree();
  const isDragging = useRef(false);
  const prevPosition = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseDown = (e) => {
      isDragging.current = true;
      prevPosition.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      
      const deltaX = e.clientX - prevPosition.current.x;
      const deltaY = e.clientY - prevPosition.current.y;
      
      setRotation(prev => ({
        x: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, prev.x - deltaY * 0.01)),
        y: prev.y + deltaX * 0.01
      }));
      
      prevPosition.current = { x: e.clientX, y: e.clientY };
    };
    
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setRotation]);
  
  useFrame(() => {
    // 更新相机位置和旋转
    camera.position.x = position[0] - Math.sin(rotation.y) * 5;
    camera.position.y = position[1] + 2 + Math.sin(rotation.x) * 3;
    camera.position.z = position[2] - Math.cos(rotation.y) * 5;
    
    camera.lookAt(position[0], position[1] + 0.5, position[2]);
  });

  return null;
};

// 角色组件
const Player = ({ position, setPosition, walls, onCollision }) => {
  const meshRef = useRef();
  const moveSpeed = 0.1;
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  
  useEffect(() => {
    // 键盘事件处理
    const handleKeyDown = (e) => {
      if ((e.key === 'w' || e.key === 'ArrowUp') && !keys.forward) {
        e.preventDefault(); // 防止页面滚动
        setKeys((prev) => ({ ...prev, forward: true }));
      }
      if ((e.key === 's' || e.key === 'ArrowDown') && !keys.backward) {
        e.preventDefault();
        setKeys((prev) => ({ ...prev, backward: true }));
      }
      if ((e.key === 'a' || e.key === 'ArrowLeft') && !keys.left) {
        e.preventDefault();
        setKeys((prev) => ({ ...prev, left: true }));
      }
      if ((e.key === 'd' || e.key === 'ArrowRight') && !keys.right) {
        e.preventDefault();
        setKeys((prev) => ({ ...prev, right: true }));
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'w' || e.key === 'ArrowUp') {
        e.preventDefault();
        setKeys((prev) => ({ ...prev, forward: false }));
      }
      if (e.key === 's' || e.key === 'ArrowDown') {
        e.preventDefault();
        setKeys((prev) => ({ ...prev, backward: false }));
      }
      if (e.key === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setKeys((prev) => ({ ...prev, left: false }));
      }
      if (e.key === 'd' || e.key === 'ArrowRight') {
        e.preventDefault();
        setKeys((prev) => ({ ...prev, right: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys]);

  useFrame(({ camera }) => {
    if (!meshRef.current) return;

    const moveVector = new Vector3(0, 0, 0);
    
    // 基于相机方向计算移动向量
    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);
    
    // 确保方向向量在水平面上
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    // 计算相机右侧向量
    const cameraRight = new Vector3(1, 0, 0)
      .applyQuaternion(camera.quaternion)
      .normalize();
    
    if (keys.forward) moveVector.add(cameraDirection.clone().multiplyScalar(moveSpeed));
    if (keys.backward) moveVector.add(cameraDirection.clone().multiplyScalar(-moveSpeed));
    if (keys.left) moveVector.add(cameraRight.clone().multiplyScalar(-moveSpeed));
    if (keys.right) moveVector.add(cameraRight.clone().multiplyScalar(moveSpeed));
    
    if (moveVector.length() > 0) {
      const newPosition = [
        position[0] + moveVector.x,
        position[1],
        position[2] + moveVector.z
      ];
      
      // 检测与墙壁的碰撞
      const playerRadius = 0.25;
      let collision = false;
      
      for (const wall of walls) {
        const [wx1, wy1, wz1, wx2, wy2, wz2] = wall;
        
        // 扩展墙壁边界以考虑玩家半径
        const minX = Math.min(wx1, wx2) - playerRadius;
        const maxX = Math.max(wx1, wx2) + playerRadius;
        const minZ = Math.min(wz1, wz2) - playerRadius;
        const maxZ = Math.max(wz1, wz2) + playerRadius;
        
        if (newPosition[0] >= minX && newPosition[0] <= maxX && 
            newPosition[2] >= minZ && newPosition[2] <= maxZ) {
          collision = true;
          break;
        }
      }
      
      if (collision) {
        onCollision();
      } else {
        // 边界检查
        newPosition[0] = Math.max(-8, Math.min(8, newPosition[0]));
        newPosition[2] = Math.max(-8, Math.min(8, newPosition[2]));
        setPosition(newPosition);
      }
    }
  });

  return (
    <Box ref={meshRef} args={[0.5, 0.5, 0.5]} position={position}>
      <meshStandardMaterial color="blue" />
    </Box>
  );
};

// 金币组件
const Coin = ({ position, isCollected }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current || isCollected) return;
    meshRef.current.rotation.y += 0.05;
  });

  if (isCollected) return null;

  return (
    <Sphere 
      ref={meshRef} 
      args={[0.2, 16, 16]} 
      position={position}
    >
      <meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} />
    </Sphere>
  );
};

// 墙壁组件
const Wall = ({ start, end, height }) => {
  // 计算墙的中心点和尺寸
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + 
    Math.pow(end[2] - start[2], 2)
  );
  const rotation = Math.atan2(end[2] - start[2], end[0] - start[0]);

  return (
    <group position={[midX, height/2, midZ]} rotation={[0, rotation, 0]}>
      <Box args={[length, height, 0.2]}>
        <meshStandardMaterial color="red" />
      </Box>
    </group>
  );
};

// 地面平台
const Ground = () => {
  return (
    <Box args={[20, 0.5, 20]} position={[0, -0.5, 0]}>
      <meshStandardMaterial color="#50ff50" />
    </Box>
  );
};

// 界面与分数显示
const Interface = ({ 
  coinsCollected, 
  totalCoins, 
  level, 
  isGameOver, 
  isLevelComplete, 
  onNextLevel, 
  onRestart,
  showInstructions,
  toggleInstructions
}) => {
  return (
    <div className="game-interface">
      <div className="score">
        金幣: {coinsCollected} / {totalCoins}
      </div>
      <div className="level">
        關卡: {level} - {level === 1 ? '簡單' : level === 2 ? '普通' : '困難'}
      </div>
      
      <div className="controls">
        <button 
          className="game-control-button"
          onClick={toggleInstructions}
        >
          {showInstructions ? '隱藏提示' : '顯示提示'}
        </button>
      </div>
      
      {isGameOver && (
        <div className="game-over">
          <div className="message lose-message">遊戲結束！</div>
          <button className="game-button" onClick={onRestart}>重新開始</button>
        </div>
      )}
      
      {isLevelComplete && (
        <div className="level-complete">
          <div className="message win-message">恭喜過關！</div>
          <button className="game-button" onClick={onNextLevel}>
            {level < 3 ? '下一關' : '重新開始'}
          </button>
        </div>
      )}
      
      {showInstructions && (
        <div className="instructions">
          使用 W, A, S, D 或方向鍵移動，滑鼠控制視角
        </div>
      )}
    </div>
  );
};

// 关卡配置
const levels = [
  // 关卡1：简单
  {
    playerStart: [0, 0, 7],
    coins: [
      { id: 1, position: [3, 0, 3] },
      { id: 2, position: [-3, 0, -3] },
      { id: 3, position: [3, 0, -3] },
      { id: 4, position: [-3, 0, 3] }
    ],
    walls: [
      // 外墙
      [-8, 0, -8, 8, 1, -8],  // 北墙
      [8, 0, -8, 8, 1, 8],    // 东墙
      [8, 0, 8, -8, 1, 8],    // 南墙
      [-8, 0, 8, -8, 1, -8],  // 西墙
      
      // 简单的内部墙壁
      [-3, 0, 0, 3, 1, 0],
    ]
  },
  
  // 关卡2：普通
  {
    playerStart: [0, 0, 7],
    coins: [
      { id: 1, position: [3, 0, 3] },
      { id: 2, position: [-3, 0, -3] },
      { id: 3, position: [5, 0, -5] },
      { id: 4, position: [-5, 0, 5] },
      { id: 5, position: [0, 0, 0] },
      { id: 6, position: [-6, 0, -2] }
    ],
    walls: [
      // 外墙
      [-8, 0, -8, 8, 1, -8],
      [8, 0, -8, 8, 1, 8],
      [8, 0, 8, -8, 1, 8],
      [-8, 0, 8, -8, 1, -8],
      
      // 内部墙壁
      [-4, 0, 4, 4, 1, 4],
      [-4, 0, 4, -4, 1, -4],
      [0, 0, 4, 0, 1, -4],
      [-4, 0, 0, 4, 1, 0],
    ]
  },
  
  // 关卡3：困难
  {
    playerStart: [-7, 0, 7],
    coins: [
      { id: 1, position: [7, 0, -7] },
      { id: 2, position: [7, 0, 7] },
      { id: 3, position: [0, 0, 0] },
      { id: 4, position: [-4, 0, -4] },
      { id: 5, position: [4, 0, -4] },
      { id: 6, position: [4, 0, 4] },
      { id: 7, position: [-4, 0, 4] },
      { id: 8, position: [-7, 0, -7] }
    ],
    walls: [
      // 外墙
      [-8, 0, -8, 8, 1, -8],
      [8, 0, -8, 8, 1, 8],
      [8, 0, 8, -8, 1, 8],
      [-8, 0, 8, -8, 1, -8],
      
      // 复杂的内部墙壁 - 迷宫状
      [-6, 0, -6, -2, 1, -6],
      [-2, 0, -6, -2, 1, -2],
      [-6, 0, -2, -6, 1, 2],
      [-6, 0, 2, -2, 1, 2],
      [-2, 0, 2, -2, 1, 6],
      [-6, 0, 6, -2, 1, 6],
      
      [2, 0, -6, 6, 1, -6],
      [2, 0, -6, 2, 1, -2],
      [2, 0, -2, 6, 1, -2],
      [6, 0, -2, 6, 1, 2],
      [2, 0, 2, 6, 1, 2],
      [2, 0, 2, 2, 1, 6],
      
      [-2, 0, -2, 2, 1, 0],
    ]
  }
];

// 主游戏组件
const CoinCollector3D = () => {
  const [level, setLevel] = useState(1);
  const [playerPosition, setPlayerPosition] = useState([0, 0, 0]);
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0 });
  const [coins, setCoins] = useState([]);
  const [walls, setWalls] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // 初始化和切换关卡
  useEffect(() => {
    const currentLevel = levels[level - 1];
    
    if (currentLevel) {
      setPlayerPosition(currentLevel.playerStart);
      setCoins(currentLevel.coins.map(coin => ({ ...coin, collected: false })));
      setWalls(currentLevel.walls);
      setIsGameOver(false);
      setIsLevelComplete(false);
      setCameraRotation({ x: 0, y: Math.PI });  // 初始相机方向
    }
  }, [level]);
  
  // 计算收集到的金币数量
  const coinsCollected = coins.filter(coin => coin.collected).length;
  const totalCoins = coins.length;
  
  // 检测与金币的碰撞
  useEffect(() => {
    const checkCoinCollisions = () => {
      if (isGameOver || isLevelComplete) return;
      
      const updatedCoins = coins.map(coin => {
        if (coin.collected) return coin;
        
        // 简单的距离检测
        const dx = playerPosition[0] - coin.position[0];
        const dz = playerPosition[2] - coin.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < 0.7) {
          return { ...coin, collected: true };
        }
        
        return coin;
      });
      
      if (JSON.stringify(updatedCoins) !== JSON.stringify(coins)) {
        setCoins(updatedCoins);
      }
    };
    
    checkCoinCollisions();
  }, [playerPosition, coins, isGameOver, isLevelComplete]);
  
  // 检查是否完成关卡
  useEffect(() => {
    if (coinsCollected === totalCoins && totalCoins > 0 && !isLevelComplete && !isGameOver) {
      setIsLevelComplete(true);
    }
  }, [coinsCollected, totalCoins, isLevelComplete, isGameOver]);
  
  // 处理墙壁碰撞
  const handleWallCollision = () => {
    if (!isGameOver && !isLevelComplete) {
      setIsGameOver(true);
    }
  };
  
  // 进入下一关或重新开始
  const handleNextLevel = () => {
    if (level < 3) {
      setLevel(level + 1);
    } else {
      setLevel(1);  // 游戏通关，重新开始
    }
  };
  
  // 重新开始当前关卡
  const handleRestart = () => {
    const currentLevel = levels[level - 1];
    setPlayerPosition(currentLevel.playerStart);
    setCoins(currentLevel.coins.map(coin => ({ ...coin, collected: false })));
    setIsGameOver(false);
    setCameraRotation({ x: 0, y: Math.PI });
  };

  // 处理全屏显示切换
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // 切换显示/隐藏提示
  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  // 防止方向键滚动页面
  useEffect(() => {
    const preventArrowScroll = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
        return false;
      }
    };
    
    window.addEventListener('keydown', preventArrowScroll);
    
    return () => {
      window.removeEventListener('keydown', preventArrowScroll);
    };
  }, []);

  return (
    <>
      <div className={`coin-collector-game ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="fullscreen-toggle">
          <button 
            className="fullscreen-button"
            onClick={handleFullscreenToggle}
            aria-label={isFullscreen ? "縮小" : "放大"}
          >
            {isFullscreen ? "縮小" : "放大"}
          </button>
        </div>
        
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Sky sunPosition={[100, 20, 100]} />
          
          <Ground />
          
          <CameraController 
            position={playerPosition} 
            rotation={cameraRotation}
            setRotation={setCameraRotation}
          />
          
          <Player 
            position={playerPosition} 
            setPosition={setPlayerPosition}
            walls={walls}
            onCollision={handleWallCollision}
          />
          
          {/* 渲染墙壁 */}
          {walls.map((wall, index) => (
            <Wall 
              key={index} 
              start={[wall[0], wall[1], wall[2]]} 
              end={[wall[3], wall[4], wall[5]]} 
              height={1.5}
            />
          ))}
          
          {/* 渲染金币 */}
          {coins.map((coin) => (
            <Coin 
              key={coin.id}
              position={coin.position}
              isCollected={coin.collected}
            />
          ))}
        </Canvas>
        
        <Interface 
          coinsCollected={coinsCollected}
          totalCoins={totalCoins}
          level={level}
          isGameOver={isGameOver}
          isLevelComplete={isLevelComplete}
          onNextLevel={handleNextLevel}
          onRestart={handleRestart}
          showInstructions={showInstructions}
          toggleInstructions={toggleInstructions}
        />
      </div>
      
      {/* 添加覆盖层，提供更好的视觉效果并防止闪烁 */}
      <div className="game-overlay" onClick={isFullscreen ? handleFullscreenToggle : undefined}></div>
    </>
  );
};

export default CoinCollector3D;