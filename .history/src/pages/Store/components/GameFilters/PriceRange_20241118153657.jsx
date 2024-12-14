// src/pages/Store/components/GameFilters/PriceRange.jsx
import React from 'react';
import { Range, getTrackBackground } from 'react-range';

const PriceRange = ({ value, onChange, min, max }) => {
  const formatPrice = (price) => `￥${price}`;

  return (
    <div className="px-2">
      <Range
        step={10}
        min={min}
        max={max}
        values={value}
        onChange={onChange}
        renderTrack={({ props, children }) => (
          <div
            className="h-3 w-full"
            style={{
              ...props.style,
            }}
          >
            <div
              ref={props.ref}
              className="h-1 w-full rounded-full"
              style={{
                background: getTrackBackground({
                  values: value,
                  colors: ['#1e293b', '#3b82f6', '#1e293b'],
                  min,
                  max,
                }),
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            className={`h-4 w-4 rounded-full shadow-lg focus:outline-none
              ${isDragged ? 'bg-blue-600' : 'bg-blue-500'}`}
          >
            <div
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap"
            >
              {formatPrice(value[props.key === '0' ? 0 : 1])}
            </div>
          </div>
        )}
      />
      <div className="flex justify-between mt-4 text-sm text-gray-400">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
};