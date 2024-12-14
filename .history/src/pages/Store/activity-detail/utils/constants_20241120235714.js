/**
 * 文件路径: src/pages/store/activity-detail/utils/constants.js
 * 文件作用: 定义节日活动相关的常量、数据结构和工具函数
 */

// 活动类型枚举
const ACTIVITY_TYPES = {
  SPRING_FESTIVAL: 'spring_festival',    // 春节活动
  SUMMER_SALE: 'summer_sale',           // 夏季特惠
  BLACK_FRIDAY: 'black_friday',         // 黑色星期五
  CHRISTMAS: 'christmas',               // 圣诞节
  NEW_YEAR: 'new_year'                 // 新年活动
};

// 活动状态枚举
const ACTIVITY_STATUS = {
  UPCOMING: 'upcoming',    // 即将开始
  ONGOING: 'ongoing',      // 进行中
  ENDED: 'ended'          // 已结束
};

// 商品类型枚举
const PRODUCT_TYPES = {
  GAME: 'game',           // 游戏
  DLC: 'dlc',            // DLC
  BUNDLE: 'bundle',       // 捆绑包
  COIN: 'coin'           // 节日代币
};

// 活动数据
const ACTIVITIES_DATA = [
  {
    id: 12475665,
    type: ACTIVITY_TYPES.SPRING_FESTIVAL,
    banner: {
      imageUrl: "https://img.freepik.com/free-vector/chinese-new-year-banner-design_1017-32064.jpg",
      title: "2024春节嘉年华",
      subtitle: "新春特惠，好礼相送"
    },
    info: {
      title: "2024游戏春节嘉年华",
      startTime: "2024-02-10 00:00:00",
      endTime: "2024-11-24 23:59:59",
      description: "春节期间，参与活动即可获得新春红包，集齐福字赢取限定皮肤。所有游戏最高可享8折优惠，还有新春限定道具等你来拿！",
      conditions: [
        "Steam帐户状态正常",
        "活动期间每日登录",
        "完成新春任务可获得额外奖励"
      ]
    },
    media: {
      coupons: [
        {
          value: "￥50",
          type: "现金券",
          title: "新春购物券",
          expireDate: "2024-02-24",
          minAmount: 200,
          conditions: "仅限活动期间使用"
        },
        {
          value: "20%",
          type: "折扣券",
          title: "春节折扣券",
          expireDate: "2024-02-24",
          minAmount: 0,
          conditions: "可与活动折扣叠加使用"
        }
      ]
    },
  },

  {
    id: 12475665,
    type: ACTIVITY_TYPES.SPRING_FESTIVAL,
    banner: {
      imageUrl: "https://img.freepik.com/free-vector/chinese-new-year-banner-design_1017-32064.jpg",
      title: "2024春节嘉年华",
      subtitle: "新春特惠，好礼相送"
    },
    info: {
      title: "2024游戏春节嘉年华",
      startTime: "2024-02-10 00:00:00",
      endTime: "2024-11-24 23:59:59",
      description: "春节期间，参与活动即可获得新春红包，集齐福字赢取限定皮肤。所有游戏最高可享8折优惠，还有新春限定道具等你来拿！",
      conditions: [
        "Steam帐户状态正常",
        "活动期间每日登录",
        "完成新春任务可获得额外奖励"
      ]
    },
    media: {
      coupons: [
        {
          value: "￥50",
          type: "现金券",
          title: "新春购物券",
          expireDate: "2024-02-24",
          minAmount: 200,
          conditions: "仅限活动期间使用"
        },
        {
          value: "20%",
          type: "折扣券",
          title: "春节折扣券",
          expireDate: "2024-02-24",
          minAmount: 0,
          conditions: "可与活动折扣叠加使用"
        }
      ]
    },
  },


];

/**
 * 获取活动状态
 * @param {string} startTime - 活动开始时间
 * @param {string} endTime - 活动结束时间
 * @returns {string} - 活动状态
 */
const getActivityStatus = (startTime, endTime) => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (now < start) return ACTIVITY_STATUS.UPCOMING;
  if (now > end) return ACTIVITY_STATUS.ENDED;
  return ACTIVITY_STATUS.ONGOING;
};

/**
 * 通过ID获取活动数据
 * @param {number} id - 活动ID
 * @returns {Object|null} - 活动数据或null
 */
const getActivityById = (id) => {
  return ACTIVITIES_DATA.find(activity => activity.id === parseInt(id)) || null;
};

/**
 * 获取活动预览列表
 * @returns {Array} - 活动预览数据数组
 */
const getActivityPreviews = () => {
  return ACTIVITIES_DATA.map(activity => ({
    id: activity.id,
    imageUrl: activity.banner.imageUrl,
    title: activity.banner.title,
    subtitle: activity.banner.subtitle,
    date: activity.info.startTime.split(' ')[0],
    status: getActivityStatus(activity.info.startTime, activity.info.endTime)
  }));
};

/**
 * 获取活动任务列表
 * @param {number} activityId - 活动ID
 * @returns {Array} - 任务列表
 */
const getActivityTasks = (activityId) => {
  const activity = getActivityById(activityId);
  return activity?.tasks || [];
};

/**
 * 获取活动奖励列表
 * @param {number} activityId - 活动ID
 * @returns {Array} - 奖励列表
 */
const getActivityRewards = (activityId) => {
  const activity = getActivityById(activityId);
  return activity?.media.rewards || [];
};

/**
 * 获取游戏当前参与的活动信息
 * @param {number|string} gameId - 游戏ID
 * @returns {Array} - 游戏参与的活动列表
 */
const getGameActivityInfo = (gameId) => {
  const currentActivities = [];
  
  ACTIVITIES_DATA.forEach(activity => {
    const featuredProducts = activity.media.featuredProducts || [];
    const gameProduct = featuredProducts.find(product => 
      product.items?.includes(gameId.toString())
    );

    if (gameProduct) {
      currentActivities.push({
        id: activity.id,
        type: activity.type,
        name: activity.info.title,
        discount: gameProduct.discount,
        startTime: activity.info.startTime,
        endTime: activity.info.endTime,
        badge: gameProduct.activityInfo.badge
      });
    }
  });

  return currentActivities;
};

/**
 * 检查用户是否有资格参与活动
 * @param {Object} user - 用户信息
 * @param {number} activityId - 活动ID
 * @returns {boolean} - 是否有资格
 */
const checkActivityEligibility = (user, activityId) => {
  const activity = getActivityById(activityId);
  if (!activity) return false;
  
  // 实现具体的资格检查逻辑
  const userMeetsConditions = activity.info.conditions.every(condition => {
    // 这里需要根据实际条件实现具体的检查逻辑
    return true;
  });
  
  return userMeetsConditions;
};

// 导出所有常量和函数
export {
  ACTIVITIES_DATA,
  ACTIVITY_TYPES,
  ACTIVITY_STATUS,
  PRODUCT_TYPES,
  getActivityStatus,
  getActivityById,
  getActivityPreviews,
  getActivityTasks,
  getActivityRewards,
  getGameActivityInfo,
  checkActivityEligibility
};