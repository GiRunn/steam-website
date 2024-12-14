// src/pages/store/utils/filterLogic.js

// 模糊搜索评分计算
export const calculateFuzzyScore = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1;
    if (s1.includes(s2)) return 0.9;
    if (s2.includes(s1)) return 0.8;
  
    // 编辑距离计算
    const matrix = Array(s1.length + 1).fill().map(() => Array(s2.length + 1).fill(0));
    
    for (let i = 0; i <= s1.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        matrix[i][j] = Math.min(
          matrix[i-1][j-1] + (s1[i-1] === s2[j-1] ? 0 : 1),
          matrix[i-1][j] + 1,
          matrix[i][j-1] + 1
        );
      }
    }
    
    return (Math.max(s1.length, s2.length) - matrix[s1.length][s2.length]) / Math.max(s1.length, s2.length);
  };
  
  // 游戏过滤逻辑
  export const filterGames = (games, filters) => {
    return games.filter(game => {
      try {
        // 1. 搜索过滤
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase().trim();
          const searchScores = [
            game.title.toLowerCase() === searchTerm ? 100 : 0,
            game.title.toLowerCase().includes(searchTerm) ? 80 : 0,
            game.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ? 60 : 0,
            game.aliases?.some(alias => alias.toLowerCase().includes(searchTerm)) ? 50 : 0,
            game.pinyin?.some(py => py.toLowerCase().includes(searchTerm)) ? 40 : 0,
            calculateFuzzyScore(game.title, searchTerm) * 30
          ];
          
          if (Math.max(...searchScores) <= 20) return false;
        }
  
        // 2. 游戏类型过滤
        if (filters.genres.length > 0) {
          const gameGenres = Array.isArray(game.genres) ? 
            game.genres.map(g => g.toLowerCase()) : [];
          
          if (!filters.genres.some(genre => 
            gameGenres.includes(genre.toLowerCase())
          )) return false;
        }
  
        // 3. 标签过滤
        if (filters.tags.length > 0) {
          const allGameTags = [
            ...(Array.isArray(game.features) ? game.features : []),
            ...(Array.isArray(game.tags) ? game.tags : [])
          ].map(t => t.toLowerCase());
          
          if (!filters.tags.every(tag => 
            allGameTags.some(t => t.includes(tag.toLowerCase()))
          )) return false;
        }
  
        // 4. 价格过滤
        if (filters.priceRange) {
          const range = PRICE_RANGES.find(r => r.id === filters.priceRange);
          if (range) {
            const price = Number(game.price);
            if (range.max === null) {
              if (price < range.min) return false;
            } else {
              if (price < range.min || price > range.max) return false;
            }
          }
        }
  
        return true;
      } catch (error) {
        console.error('Error filtering game:', error, game);
        return false;
      }
    });
  };
  
  // 统计筛选数量
  export const calculateFilterCounts = (games, filters) => {
    const counts = {
      genres: {},
      tags: {},
      priceRanges: {}
    };
  
    try {
      // 获取基础过滤结果（不包括当前统计的维度）
      const baseFilteredGames = (excludeFilter) => {
        return games.filter(game => {
          let include = true;
  
          // 应用搜索过滤
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase().trim();
            const scores = [
              game.title.toLowerCase() === searchTerm ? 100 : 0,
              game.title.toLowerCase().includes(searchTerm) ? 80 : 0,
              game.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ? 60 : 0,
              game.aliases?.some(alias => alias.toLowerCase().includes(searchTerm)) ? 50 : 0,
              calculateFuzzyScore(game.title, searchTerm) * 30
            ];
            if (Math.max(...scores) <= 20) include = false;
          }
  
          // 应用类型过滤
          if (excludeFilter !== 'genres' && filters.genres.length > 0 && include) {
            const gameGenres = Array.isArray(game.genres) ? 
              game.genres.map(g => g.toLowerCase()) : [];
            if (!filters.genres.some(genre => 
              gameGenres.includes(genre.toLowerCase())
            )) include = false;
          }
  
          // 应用标签过滤
          if (excludeFilter !== 'tags' && filters.tags.length > 0 && include) {
            const allGameTags = [
              ...(Array.isArray(game.features) ? game.features : []),
              ...(Array.isArray(game.tags) ? game.tags : [])
            ].map(t => t.toLowerCase());
            
            if (!filters.tags.every(tag => 
              allGameTags.some(t => t.includes(tag.toLowerCase()))
            )) include = false;
          }
  
          // 应用价格过滤
          if (excludeFilter !== 'priceRange' && filters.priceRange && include) {
            const range = PRICE_RANGES.find(r => r.id === filters.priceRange);
            if (range) {
              const price = Number(game.price);
              if (range.max === null) {
                if (price < range.min) include = false;
              } else {
                if (price < range.min || price > range.max) include = false;
              }
            }
          }
  
          return include;
        });
      };
  
      // 计算各维度的数量
      // 1. 价格区间
      const gamesForPrice = baseFilteredGames('priceRange');
      PRICE_RANGES.forEach(range => {
        counts.priceRanges[range.id] = gamesForPrice.filter(game => {
          const price = Number(game.price);
          return range.max === null ? 
            price >= range.min : 
            price >= range.min && price <= range.max;
        }).length;
      });
  
      // 2. 游戏类型
      const gamesForGenres = baseFilteredGames('genres');
      gamesForGenres.forEach(game => {
        if (Array.isArray(game.genres)) {
          game.genres.forEach(genre => {
            const key = genre.toLowerCase();
            counts.genres[key] = (counts.genres[key] || 0) + 1;
          });
        }
      });
  
      // 3. 标签
      const gamesForTags = baseFilteredGames('tags');
      gamesForTags.forEach(game => {
        const allTags = [
          ...(Array.isArray(game.features) ? game.features : []),
          ...(Array.isArray(game.tags) ? game.tags : [])
        ];
        
        allTags.forEach(tag => {
          const key = tag.toLowerCase();
          counts.tags[key] = (counts.tags[key] || 0) + 1;
        });
      });
  
    } catch (error) {
      console.error('Error calculating filter counts:', error);
    }
  
    return counts;
  };