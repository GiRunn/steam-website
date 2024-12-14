// src/components/EventSection/index.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import './styles.css';

const EventSection = ({ events }) => {
  const handleSubscribe = (e, eventId) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Subscribe to event:', eventId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="event-section"
    >
      <div className="section-header">
        <h2 className="gradient-text">即将开始的活动</h2>
        <Link to="/events" className="view-all">查看全部活动</Link>
      </div>

      <div className="events-grid">
        {events?.length > 0 ? (
          events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onSubscribe={(e) => handleSubscribe(e, event.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            暂无活动
          </div>
        )}
      </div>
    </motion.div>
  );
};

const EventCard = ({ event, onSubscribe }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const showImage = () => setImageLoaded(true);
  
  return (
    <div className="event-card group">
      <Link to={`/event/${event.id}`} className="block relative">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card-content"
        >
          <div className="img-container">
            {!imageLoaded && (
              <div className="skeleton-loader" />
            )}
            <img 
              src={event.image} 
              alt={event.title}
              className={`img-hover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={showImage}
            />
            <div className={`gradient-overlay ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} />
          </div>

          <div className="event-info">
            <h3 className="event-title line-clamp-2">{event.title}</h3>
            <p className="event-description line-clamp-2">{event.description}</p>
            
            <div className="event-details">
              <div className="detail-item">
                <Calendar className="icon" />
                <span>{event.startDate}</span>
              </div>
              <div className="detail-item">
                <Clock className="icon" />
                <span>{event.endDate}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="subscribe-btn"
              onClick={onSubscribe}
            >
              <span>订阅提醒</span>
            </motion.button>
          </div>
        </motion.div>
      </Link>
    </div>
  );
};

export default EventSection;