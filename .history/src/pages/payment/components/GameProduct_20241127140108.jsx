// E:\Steam\steam-website\src\pages\payment\components\GameProduct.jsx
import React from 'react';
import { Gamepad2, HardDrive, Globe, Star } from 'lucide-react';

const GameProduct = ({ product }) => {
  return (
    <div className="bg-[#111827] rounded-lg shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-72 h-48 md:h-auto">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
            {product.rating}
          </div>
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-white">{product.name}</h3>
              <p className="text-gray-400 mt-1">{product.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">${product.price}</div>
              <div className="text-sm text-gray-400">含税价</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="w-4 h-4 text-blue-500" />
              <span className="text-gray-300">{product.platform}</span>
            </div>
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-blue-500" />
              <span className="text-gray-300">{product.size}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-gray-300">
                {product.languages.slice(0, 2).join(', ')}
                {product.languages.length > 2 ? ' 等' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-blue-500" />
              <span className="text-gray-300">{product.publisher}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {product.genre.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#1a2234] rounded-full text-sm text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameProduct;