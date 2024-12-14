// src/pages/store/utils/storeUtils.js

import { GAME_GENRES, SPECIAL_TAGS } from '../constants';

/**
 * 标准化字符串用于比较
 * @param {string} str - 输入字符串
 * @returns {string} - 标准化后的字符串
 */
const normalizeString = (str) => {
  return str?.toString().toLowerCase().trim() || '';
};

/**
 * 根据标签ID获取标签文本
 * @param {string} tagId - 标签ID
 * @returns {string} - 标签文本
 */
const getTagLabelById = (tagId) => {
  const tag = SPECIAL_TAGS.find(t => t.id === tagId);
  return tag ? tag.label : tagId;
};

/**
 * 根据类型ID获取类型文本
 * @param {string} genreId - 类型ID
 * @returns {string} - 类型文本
 */
const getGenreLabelById = (genreId) => {
  const genre = GAME_GENRES.find(g => g.id === genreId);
  return genre ? genre.label : genreId;
};

/**
 * 模糊搜索评分计算
 * @param {string} str1 - 字符串1
 * @param {string} str2 - 字符串2
 * @returns {number} - 相似度评分
 */
const calculateFuzzyScore = (str1, str2) => {
  if (!str1 || !str2) return 0;
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);
  
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

/**
 * 处理游戏搜索过滤
 * @param {Array} games - 游戏列表
 * @param {string} searchTerm - 搜索关键词
 * @returns {Array} - 过滤后的游戏列表
 */
const handleSearchFilter = (games, searchTerm) => {
  if (!searchTerm || !games?.length) return games;

  const term = normalizeString(searchTerm);
  
  return games.map(game => {
    const searchScores = {
      // 完全匹配
      exactMatch: normalizeString(game.title) === term ? 100 : 0,
      // 标题包含
      titleContains: normalizeString(game.title).includes(term) ? 80 : 0,
      // 标签匹配
      tagMatch: game.tags?.some(tag => normalizeString(tag).includes(term)) ? 60 : 0,
      // 特征匹配
      featureMatch: game.features?.some(feature => normalizeString(feature).includes(term)) ? 50 : 0,
      // 模糊匹配
      fuzzyMatch: calculateFuzzyScore(game.title, term) * 30,
      // 数字匹配
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

/**
 * 处理价格过滤
 * @param {Array} games - 游戏列表
 * @param {string} priceRange - 价格区间ID
 * @param {Array} PRICE_RANGES - 价格区间配置
 * @returns {Array} - 过滤后的游戏列表
 */
const handlePriceFilter = (games, priceRange, PRICE_RANGES) => {
  if (!priceRange || !games?.length) return games;

  const range = PRICE_RANGES.find(r => r.id === priceRange);
  if (!range) return games;

  return games.filter(game => {
    const price = Number(game.price) || 0;
    return range.max === null ? 
      price >= range.min : 
      price >= range.min && price <= range.max;
  });
};

/**
 * 处理游戏类型过滤
 * @param {Array} games - 游戏列表
 * @param {Array} selectedGenres - 选中的游戏类型ID列表
 * @returns {Array} - 过滤后的游戏列表
 */
const handleGenreFilter = (games, selectedGenres) => {
  if (!selectedGenres?.length || !games?.length) return games;

  return games.filter(game => {
    // 将游戏标签转换为可能的类型
    const gameTags = (game.tags || []).map(normalizeString);
    
    // 检查选中的类型是否存在于游戏标签中
    return selectedGenres.some(genreId => {
      const genreLabel = normalizeString(getGenreLabelById(genreId));
      return gameTags.some(tag => tag.includes(genreLabel) || genreLabel.includes(tag));
    });
  });
};

/**
 * 处理特殊标签过滤
 * @param {Array} games - 游戏列表
 * @param {Array} selectedTags - 选中的标签ID列表
 * @returns {Array} - 过滤后的游戏列表
 */
const handleTagFilter = (games, selectedTags) => {
  if (!selectedTags?.length || !games?.length) return games;

  return games.filter(game => {
    const gameTags = (game.tags || []).map(normalizeString);
    const gameFeatures = (game.features || []).map(normalizeString);
    const playerCount = normalizeString(game.playerCount);
    
    // 合并所有可能包含标签的字段
    const allGameTags = [...gameTags, ...gameFeatures, playerCount];
    
    // 检查是否所有选中的标签都存在
    return selectedTags.every(tagId => {
      const tagLabel = normalizeString(getTagLabelById(tagId));
      
      // 特殊处理一些标签
      switch(tagId) {
        case 'singleplayer':
          return playerCount.includes('单人');
        case 'multiplayer':
          return playerCount.includes('多人');
        case 'controller':
          return gameFeatures.some(f => f.includes('手柄'));
        default:
          return allGameTags.some(tag => 
            tag.includes(tagLabel) || tagLabel.includes(tag)
          );
      }
    });
  });
};

/**
 * 处理游戏排序
 * @param {Array} games - 游戏列表
 * @param {string} sortBy - 排序方式
 * @param {Object} SORT_OPTIONS - 排序选项配置
 * @returns {Array} - 排序后的游戏列表
 */
const handleGameSort = (games, sortBy, SORT_OPTIONS) => {
  if (!games?.length) return games;

  return [...games].sort((a, b) => {
    try {
      switch (sortBy) {
        case SORT_OPTIONS.PRICE_ASC:
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        case SORT_OPTIONS.PRICE_DESC:
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        case SORT_OPTIONS.RELEASE_DATE:
          return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
        case SORT_OPTIONS.RATING:
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        case SORT_OPTIONS.POPULARITY:
        default:
          if (a.searchScore !== undefined && b.searchScore !== undefined) {
            return b.searchScore - a.searchScore;
          }
          // 如果没有搜索分数，使用评分和评价数量的加权计算
          const aPopularity = ((Number(a.rating) || 0) * (Number(a.reviews?.total) || 0)) / 100;
          const bPopularity = ((Number(b.rating) || 0) * (Number(b.reviews?.total) || 0)) / 100;
          return bPopularity - aPopularity;
      }
    } catch (error) {
      console.error('Error sorting games:', error);
      return 0;
    }
  });
};

/**
 * 统计筛选数量
 * @param {Array} games - 游戏列表 
 * @param {Object} filters - 过滤条件
 * @param {Array} PRICE_RANGES - 价格区间配置
 * @returns {Object} - 统计结果
 */
const calculateFilterCounts = (games, filters, PRICE_RANGES) => {
  if (!games?.length) return {
    priceRanges: {},
    genres: {},
    tags: {}
  };

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
        const price = Number(game.price) || 0;
        const inRange = range.max === null 
          ? price >= range.min
          : price >= range.min && price <= range.max;
        
        if (inRange) {
          counts.priceRanges[range.id] = (counts.priceRanges[range.id] || 0) + 1;
        }
      });

      // 游戏类型统计
      const gameTags = (game.tags || []).map(normalizeString);
      GAME_GENRES.forEach(genre => {
        const genreLabel = normalizeString(genre.label);
        if (gameTags.some(tag => tag.includes(genreLabel) || genreLabel.includes(tag))) {
          counts.genres[genre.id] = (counts.genres[genre.id] || 0) + 1;
        }
      });

      // 特殊标签统计
      SPECIAL_TAGS.forEach(specialTag => {
        const tagLabel = normalizeString(specialTag.label);
        const allGameTags = [
          ...(game.tags || []).map(normalizeString),
          ...(game.features || []).map(normalizeString),
          normalizeString(game.playerCount)
        ];

        // 特殊处理一些标签
        let hasTag = false;
        switch(specialTag.id) {
          case 'singleplayer':
            hasTag = allGameTags.some(t => t.includes('单人'));
            break;
          case 'multiplayer':
            hasTag = allGameTags.some(t => t.includes('多人'));
            break;
          case 'controller':
            hasTag = allGameTags.some(t => t.includes('手柄'));
            break;
          default:
            hasTag = allGameTags.some(tag => tag.includes(tagLabel) || tagLabel.includes(tag));
        }

        if (hasTag) {
          counts.tags[specialTag.id] = (counts.tags[specialTag.id] || 0) + 1;
        }
      });
    });
  } catch (error) {
    console.error('Error calculating filter counts:', error);
  }

  return counts;
};

// 组合所有过滤器的函数
const applyAllFilters = (games, filters, PRICE_RANGES, SORT_OPTIONS) => {
  try {
    let filteredGames = [...games];

    // 应用搜索过滤
    if (filters.search) {
      filteredGames = handleSearchFilter(filteredGames, filters.search);
    }

    // 应用价格过滤
    if (filters.priceRange) {
      filteredGames = handlePriceFilter(filteredGames, filters.priceRange, PRICE_RANGES);
    }

    // 应用类型过滤
    if (filters.genres?.length) {
      filteredGames = handleGenreFilter(filteredGames, filters.genres);
    }

    // 应用标签过滤
    if (filters.tags?.length) {
      filteredGames = handleTagFilter(filteredGames, filters.tags);
    }

    // 应用排序
    if (filters.sortBy) {
      filteredGames = handleGameSort(filteredGames, filters.sortBy, SORT_OPTIONS);
    }

    return filteredGames;
  } catch (error) {
    console.error('Error applying filters:', error);
    return games;
  }
};

export {
  handleSearchFilter,
  handlePriceFilter,
  handleGenreFilter,
  handleTagFilter,
  handleGameSort,
  calculateFilterCounts,
  applyAllFilters,
  calculateFuzzyScore,
  normalizeString,
  getTagLabelById,
  getGenreLabelById
};