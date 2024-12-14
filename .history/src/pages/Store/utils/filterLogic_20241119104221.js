// src/pages/store/utils/storeUtils.js

// 模糊搜索评分计算
const calculateFuzzyScore = (str1, str2) => {
    if (!str1 || !str2) return 0;
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1;
    if (s1.includes(s2)) return 0.9;
    if (s2.includes(s1)) return 0.8;
  
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
  
  // 搜索处理
  const handleSearchFilter = (games, searchTerm) => {
    if (!searchTerm) return games;
  
    const term = searchTerm.toLowerCase().trim();
    return games.map(game => {
      const searchScores = {
        exactMatch: game.title.toLowerCase() === term ? 100 : 0,
        titleContains: game.title.toLowerCase().includes(term) ? 80 : 0,
        tagMatch: game.tags?.some(tag => tag.toLowerCase().includes(term)) ? 60 : 0,
        aliasMatch: game.aliases?.some(alias => alias.toLowerCase().includes(term)) ? 50 : 0,
        pinyinMatch: game.pinyin?.some(py => py.toLowerCase().includes(term)) ? 40 : 0,
        fuzzyMatch: calculateFuzzyScore(game.title, term) * 30,
        numberMatch: (/\d/.test(term) && game.title.match(/\d+/g)?.some(num => term.includes(num))) ? 70 : 0
      };
  
      return {
        ...game,
        searchScore: Math.max(...Object.values(searchScores))
      };
    })
    .filter(game => game.searchScore > 20)
    .sort((a, b) => b.searchScore - a.searchScore);
  };
  
  // 价格过滤
  const handlePriceFilter = (games, priceRange, PRICE_RANGES) => {
    if (!priceRange) return games;
  
    const range = PRICE_RANGES.find(r => r.id === priceRange);
    if (!range) return games;
  
    return games.filter(game => {
      const price = Number(game.price);
      return range.max === null ? 
        price >= range.min : 
        price >= range.min && price <= range.max;
    });
  };
  
  // 类型过滤
  const handleGenreFilter = (games, genres) => {
    if (!genres.length) return games;
  
    return games.filter(game => 
      genres.some(genre => 
        game.genres.map(g => g.toLowerCase())
          .includes(genre.toLowerCase())
      )
    );
  };
  
  // 标签过滤
  const handleTagFilter = (games, tags) => {
    if (!tags.length) return games;
  
    return games.filter(game => 
      tags.every(tag =>
        game.tags.some(t => 
          t.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  };
  
  // 排序处理
  const handleGameSort = (games, sortBy, SORT_OPTIONS) => {
    return [...games].sort((a, b) => {
      try {
        switch (sortBy) {
          case SORT_OPTIONS.PRICE_ASC:
            return a.price - b.price;
          case SORT_OPTIONS.PRICE_DESC:
            return b.price - a.price;
          case SORT_OPTIONS.RELEASE_DATE:
            return new Date(b.releaseDate) - new Date(a.releaseDate);
          case SORT_OPTIONS.RATING:
            return b.rating - a.rating;
          case SORT_OPTIONS.POPULARITY:
          default:
            if (a.searchScore && b.searchScore) {
              return b.searchScore - a.searchScore;
            }
            return b.popularity - a.popularity;
        }
      } catch (error) {
        console.error('Error sorting games:', error);
        return 0;
      }
    });
  };
  
  // 统计筛选数量
  const calculateFilterCounts = (games, filters, PRICE_RANGES) => {
    const counts = {
      priceRanges: {},
      genres: {},
      tags: {}
    };
  
    try {
      let filteredGames = [...games];
  
      // 应用搜索过滤
      if (filters.search) {
        filteredGames = handleSearchFilter(filteredGames, filters.search);
      }
  
      // 统计数量
      filteredGames.forEach(game => {
        // 价格区间统计
        PRICE_RANGES.forEach(range => {
          const price = Number(game.price);
          const inRange = range.max === null 
            ? price >= range.min
            : price >= range.min && price <= range.max;
          
          if (inRange) {
            counts.priceRanges[range.id] = (counts.priceRanges[range.id] || 0) + 1;
          }
        });
  
        // 游戏类型统计
        game.genres.forEach(genre => {
          const key = genre.toLowerCase();
          counts.genres[key] = (counts.genres[key] || 0) + 1;
        });
  
        // 标签统计
        game.tags.forEach(tag => {
          const key = tag.toLowerCase();
          counts.tags[key] = (counts.tags[key] || 0) + 1;
        });
      });
    } catch (error) {
      console.error('Error calculating filter counts:', error);
    }
  
    return counts;
  };
  
  export {
    handleSearchFilter,
    handlePriceFilter,
    handleGenreFilter,
    handleTagFilter,
    handleGameSort,
    calculateFilterCounts
  };