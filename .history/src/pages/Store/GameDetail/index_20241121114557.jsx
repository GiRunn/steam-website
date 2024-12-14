import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { MOCK_GAMES } from '../constants';

// 导入组件
import Hero from './components/Hero';
import Overview from './components/Overview';
import Media from './components/Media';
import Requirements from './components/Requirements';
import Reviews from './components/Reviews';
import Purchase from './components/Purchase';

// 导入全局组件
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LoadingScreen from '../../../components/LoadingScreen';

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟API加载
    const fetchGame = () => {
      setLoading(true);
      setTimeout(() => {
        const foundGame = MOCK_GAMES.find(g => g.id === parseInt(id));
        setGame(foundGame);
        setLoading(false);
      }, 1000);
    };

    fetchGame();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!game) return <div>游戏未找到</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0a0f16]"
    >
      <Navbar />
      
      <main>
        {/* 英雄区 */}
        <Hero game={game} />
        
        {/* 主要内容 */}
        <div className="container mx-auto px-4 lg:px-6 pb-24">
          <div className="flex flex-col lg:flex-row gap-8 mt-8">
            {/* 左侧主要内容 */}
            <div className="flex-1 space-y-24">
              <Overview game={game} />
              <Media game={game} />
              <Requirements game={game} />
              <Reviews game={game} />
            </div>
            
            {/* 右侧购买区 */}
            <div className="w-full lg:w-96">
              <div className="sticky top-24">
                <Purchase game={game} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
};

export default GameDetail;