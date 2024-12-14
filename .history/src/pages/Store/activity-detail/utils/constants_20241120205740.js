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
      imageUrl: "https://media.st.dl.eccdnx.com/steam/spring2024/banner.jpg",
      title: "2024春节嘉年华",
      subtitle: "新春特惠，好礼相送"
    },
    info: {
      title: "2024游戏春节嘉年华",
      startTime: "2024-02-10 00:00:00",
      endTime: "2024-02-24 23:59:59",
      description: "春节期间，参与活动即可获得新春红包，集齐福字赢取限定皮肤。所有游戏最高可享8折优惠，还有新春限定道具等你来拿！",
      conditions: [
        "Steam帐户状态正常",
        "活动期间每日登录",
        "完成新春任务可获得额外奖励"
      ]
    },
    media: {
      promotion: [
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/spring2024/promo1.jpg",
          title: "新春集福字",
          date: "2024-02-10",
          participants: 250000,
          description: "集齐'福'字赢限定皮肤",
          status: ACTIVITY_STATUS.ONGOING,
          statusText: "进行中"
        },
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/spring2024/promo2.jpg",
          title: "春节红包雨",
          date: "2024-02-10",
          participants: 350000,
          description: "每日登录领取新春红包",
          status: ACTIVITY_STATUS.ONGOING,
          statusText: "进行中"
        }
      ],
      featuredProducts: [
        {
          id: "spring-2024-bundle",
          type: PRODUCT_TYPES.BUNDLE,
          title: "新春特惠礼包",
          price: 88,
          originalPrice: 298,
          discount: 70,
          image: "https://media.st.dl.eccdnx.com/steam/spring2024/bundle.jpg",
          description: "包含5款热门游戏和独家新春装饰",
          items: [
            "赛博朋克2077",
            "艾尔登法环",
            "新春装饰包",
            "红包皮肤",
            "节日代币×1000"
          ],
          activityInfo: {
            id: 1,
            type: ACTIVITY_TYPES.SPRING_FESTIVAL,
            badge: {
              text: "春节特惠",
              color: "red"
            }
          }
        }
      ],
      rewards: [
        {
          id: "spring-coin",
          type: PRODUCT_TYPES.COIN,
          title: "新春代币",
          description: "完成春节任务获得，可在商店兑换奖励",
          image: "https://media.st.dl.eccdnx.com/steam/spring2024/coin.png"
        },
        {
          id: "spring-envelope",
          type: "decoration",
          title: "新春红包装饰",
          description: "限定红包装饰，可用于个人资料展示",
          image: "https://media.st.dl.eccdnx.com/steam/spring2024/envelope.png"
        }
      ],
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
    tasks: [
      {
        id: 1,
        title: "每日签到",
        description: "连续7天登录",
        reward: "新春代币×100",
        type: "daily"
      },
      {
        id: 2,
        title: "收集福字",
        description: "在游戏中收集5个福字",
        reward: "限定春节装扮",
        type: "event"
      },
      {
        id: 3,
        title: "新春消费",
        description: "活动期间累计消费满300元",
        reward: "额外红包×5",
        type: "purchase"
      }
    ]
  },
  {
    id: 2,
    type: ACTIVITY_TYPES.SUMMER_SALE,
    banner: {
      imageUrl: "https://media.st.dl.eccdnx.com/steam/summer2024/banner.jpg",
      title: "2024夏日特惠",
      subtitle: "清凉一夏，超值特惠"
    },
    info: {
      title: "2024夏日游戏节",
      startTime: "2024-06-20 00:00:00",
      endTime: "2024-07-04 23:59:59",
      description: "夏日特惠开启！参与活动赢取夏日限定道具，海量游戏史低价格，还有夏日独家礼包等你来拿！",
      conditions: [
        "Steam帐户状态正常",
        "活动期间完成任务",
        "购买活动特惠商品"
      ]
    },
    media: {
      promotion: [
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/summer2024/promo1.jpg",
          title: "夏日任务",
          date: "2024-06-20",
          participants: 180000,
          description: "完成夏日任务赢取奖励",
          status: ACTIVITY_STATUS.UPCOMING,
          statusText: "即将开始"
        }
      ],
      featuredProducts: [
        {
          id: "summer-2024-bundle",
          type: PRODUCT_TYPES.BUNDLE,
          title: "夏日游戏礼包",
          price: 128,
          originalPrice: 398,
          discount: 65,
          image: "https://media.st.dl.eccdnx.com/steam/summer2024/bundle.jpg",
          description: "包含多款热门游戏和夏日独家装饰",
          items: [
            "赛博朋克2077",
            "艾尔登法环",
            "夏日装饰包",
            "海滩皮肤",
            "节日代币×2000"
          ],
          activityInfo: {
            id: 2,
            type: ACTIVITY_TYPES.SUMMER_SALE,
            badge: {
              text: "夏日特惠",
              color: "blue"
            }
          }
        }
      ],
      rewards: [
        {
          id: "summer-coin",
          type: PRODUCT_TYPES.COIN,
          title: "夏日代币",
          description: "完成夏日任务获得，可在商店兑换奖励",
          image: "https://media.st.dl.eccdnx.com/steam/summer2024/coin.png"
        }
      ],
      coupons: [
        {
          value: "￥100",
          type: "现金券",
          title: "夏日特惠券",
          expireDate: "2024-07-04",
          minAmount: 300,
          conditions: "仅限活动期间使用"
        }
      ]
    },
    tasks: [
      {
        id: 1,
        title: "夏日签到",
        description: "活动期间累计签到10天",
        reward: "夏日代币×200",
        type: "daily"
      },
      {
        id: 2,
        title: "夏日消费",
        description: "活动期间累计消费满500元",
        reward: "限定装扮",
        type: "purchase"
      }
    ]
  }
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