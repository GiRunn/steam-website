// src/pages/Community/PostDetail/components/AnchorNavigation/index.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AnchorNavigation = ({ content = '', offset = 80 }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // 提取所有标题
    const doc = new DOMParser().parseFromString(content, 'text/html');
    const headingElements = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const extractedHeadings = headingElements.map((heading, index) => ({
      id: heading.id || `heading-${index}`,
      text: heading.textContent,
      level: parseInt(heading.tagName[1])
    }));
    setHeadings(extractedHeadings);
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(heading => 
        document.getElementById(heading.id)
      ).filter(Boolean);

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        const rect = element.getBoundingClientRect();
        
        if (rect.top <= offset) {
          setActiveId(element.id);
          return;
        }
      }

      setActiveId('');
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, offset]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto hidden lg:block">
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2 text-gray-400">目录导航</h4>
        <ul className="space-y-2">
          {headings.map(heading => (
            <li 
              key={heading.id}
              style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.id);
                  if (element) {
                    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                  }
                }}
                className={`
                  block text-sm py-1 px-2 rounded transition-colors
                  ${activeId === heading.id
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-gray-200'
                  }
                `}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

AnchorNavigation.propTypes = {
  content: PropTypes.string.isRequired,
  offset: PropTypes.number
};

export default React.memo(AnchorNavigation);