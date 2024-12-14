// src/pages/Store/components/EventSection/index.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import EventCard from './EventCard';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Tooltip } from '@/components/ui/Tooltip';
import { encryptData } from '@/utils/encryption';

const EventSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 模拟活动数据
  const mockEvents = [
    {
      id: encryptData('1'), // 加密ID
      title: "2024春节特卖",
      description: "数千款游戏史低价,还有新春专属道具等你来拿!",
      image: "https://picsum.photos/800/400?random=1",
      startDate: "2024-02-10",
      endDate: "2024-02-17", 
      startTime: "10:00",
      participantsCount: 15234,
      rewards: [
        {
          type: "discount",
          value: "85%"
        },
        {
          type: "coupon",
          value: "￥50"
        }
      ],
      tags: ["特卖", "限时", "节日"]
    },
    {
      id: encryptData('2'),
      title: "独立游戏节",
      description: "发现独立游戏的无限魅力,百款精品独立游戏限时特惠",
      image: "https://picsum.photos/800/400?random=2", 
      startDate: "2024-03-01",
      endDate: "2024-03-15",
      startTime: "00:00",
      participantsCount: 8976,
      rewards: [
        {
          type: "discount",
          value: "75%"
        }
      ],
      tags: ["独立游戏", "特惠"]
    }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents(mockEvents);
      } catch (err) {
        setError("获取活动数据失败");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (error) {
    return (
      <div className="text-center p-8 bg-red-500/10 rounded-xl">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <section className="w-full py-8">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              即将开始的活动
            </h2>
            <Link 
              to="/events"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              查看全部
            </Link>
          </div>
        </motion.div>

        {loading ? (
          <LoadingScreen />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {events.map((event, index) => (
                <EventCard 
                  key={event.id}
                  event={event}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventSection;