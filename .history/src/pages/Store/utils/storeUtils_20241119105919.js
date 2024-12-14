// src/pages/store/utils/storeFilterUtils.js

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
 * 根据标签ID获取标签标签
 * @param {string} tagId - 标签ID
 * @returns {string} - 标签标签
 */
const getTagLabelById = (tagId) => {
  const tag = SPECIAL_TAGS.find(t => t.id === tagId);
  return tag ? tag.label : tagId;
};

/**
 * 根据类型ID获取类型标签
 * @param {string} genreId - 类型ID
 * @returns {string} - 类型标签
 */
const getGenreLabelById = (genreId) => {
  const genre = GAME_GENRES.find(g => g.id === genreId);
  return genre ? genre.label : genreId;
};

/**
 * 处理游戏类型过滤
 * @param {Array} games - 游戏列表
 * @param {Array} selectedGenres - 选中的游戏类型ID列表
 * @returns {Array} - 过滤后的游戏列表
 */
const handleGenreFilter = (games, selectedGenres) => {
  if (!selectedGenres?.length) return games;
  if (!Array.isArray(games)) return [];

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
  if (!selectedTags?.length) return games;
  if (!Array.isArray(games)) return [];

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
 * 组合过滤函数
 * @param {Array} games - 游戏列表
 * @param {Object} filters - 过滤条件对象
 * @returns {Array} - 过滤后的游戏列表
 */
const applyFilters = (games, filters) => {
  try {
    let filteredGames = [...games];

    // 应用类型过滤
    if (filters.genres?.length) {
      filteredGames = handleGenreFilter(filteredGames, filters.genres);
    }

    // 应用标签过滤
    if (filters.tags?.length) {
      filteredGames = handleTagFilter(filteredGames, filters.tags);
    }

    return filteredGames;
  } catch (error) {
    console.error('Error applying filters:', error);
    return games;
  }
};

export {
  handleGenreFilter,
  handleTagFilter,
  applyFilters,
  normalizeString,
  getTagLabelById,
  getGenreLabelById
};