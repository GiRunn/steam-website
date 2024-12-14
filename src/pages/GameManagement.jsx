// src/pages/GameManagement.jsx
import { useEffect, useState } from 'react';
import { gameService } from '../services/api';

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await gameService.getGames();
        setGames(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // 创建新游戏
  const handleCreateGame = async (gameData) => {
    try {
      const newGame = await gameService.createGame(gameData);
      setGames(prevGames => [...prevGames, newGame]);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  return (
    <div>
      {/* 游戏列表渲染 */}
      {games.map(game => (
        <div key={game.id}>
          <h3>{game.title}</h3>
          <p>{game.description}</p>
          <span>¥{game.price}</span>
        </div>
      ))}
    </div>
  );
};