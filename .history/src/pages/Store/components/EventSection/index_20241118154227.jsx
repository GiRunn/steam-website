import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import './styles.css';

const EventSection = ({ events }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="event-section"
    >
      <div className="section-header">
        <h2 className="gradient-text">即将开始的活动</h2>
        <Link to="/events" className="view-all">
          查看全部活动
        </Link>
      </div>

      <div className="events-grid">
        {events.map((event) => (
          <Link
            to={`/event/${event.id}`}
            key={event.id}
            className="event-card group"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="card-content"
            >
              <div className="img-container">
                <img
                  src={event.image}
                  alt={event.title}
                  className="img-hover"
                />
                <div className="gradient-overlay" />
              </div>

              <div className="event-info">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>
                
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
                  onClick={(e) => {
                    e.preventDefault();
                    // 订阅逻辑
                  }}
                >
                  订阅提醒
                </motion.button>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default EventSection;