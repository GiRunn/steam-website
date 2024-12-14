// E:\Steam\steam-website\src\pages\CustomerService\components\Header.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const Header = () => {
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <div className="mb-12">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f1621] to-[#1a1f2c] rounded-2xl p-8">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }}
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4"
            >
              有什么可以帮您？
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg"
            >
              搜索您需要的帮助，或浏览下方的常见问题
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto relative"
          >
            <input
              type="text"
              placeholder="搜索问题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-14 pr-4 bg-[#0f1621] border border-gray-800 rounded-xl 
                text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Header;