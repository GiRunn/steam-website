// src/pages/store/activity-detail/utils/constants.js

/**
 * 活动与游戏关联的完整逻辑：
 * 1. 游戏可以参与多个活动
 * 2. 活动可以包含多个游戏
 * 3. 游戏卡片需要显示当前参与的活动信息
 * 4. 活动详情页显示参与的游戏时保持游戏卡片的一致性
 */

// 活动类型枚举
export const ACTIVITY_TYPES = {
  DISCOUNT: 'discount',    // 折扣活动
  NEW_RELEASE: 'new',      // 新品发售
  DLC: 'dlc',             // DLC发售
  SEASON: 'season',       // 季节性活动
  PUBLISHER: 'publisher'   // 发行商特惠
};

// 游戏参与活动的数据结构
export const GAME_ACTIVITIES = {
  1: [ // 赛博朋克2077
    {
      id: 1,
      type: ACTIVITY_TYPES.DLC,
      name: "黑色狂潮发售特惠",
      discount: 25,
      startTime: "2024-08-15 00:00:00",
      endTime: "2024-08-30 23:59:59",
      badge: {
        text: "DLC特惠",
        color: "blue"
      }
    }
  ],
  2: [ // 艾尔登法环
    {
      id: 2,
      type: ACTIVITY_TYPES.DLC,
      name: "影之国度发售特惠",
      discount: 20,
      startTime: "2024-09-01 00:00:00",
      endTime: "2024-09-15 23:59:59",
      badge: {
        text: "DLC特惠",
        color: "purple"
      }
    }
  ]
};

// 活动数据
export const ACTIVITIES_DATA = [
  {
    id: 1,
    type: ACTIVITY_TYPES.DLC,
    banner: {
      imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/2378810/library_hero.jpg",
      title: "赛博朋克2077 - 黑色狂潮",
      subtitle: "夜之城最新资料片限时特惠"
    },
    info: {
      title: "赛博朋克2077 黑色狂潮限时特惠",
      startTime: "2024-08-15 00:00:00",
      endTime: "2024-08-30 23:59:59",
      description: "《赛博朋克2077：黑色狂潮》现已发布！在这款全新资料片中，玩家将扮演所罗门·里德警探，深入调查新幻舞坊谋杀案，揭开夜之城最黑暗的秘密。",
      conditions: [
        "拥有赛博朋克2077主游戏",
        "Steam帐户状态正常",
        "年满18周岁"
      ],
      gameIds: [1] // 关联的游戏ID
    },
    media: {
      promotion: [
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/2378810/ss_a34d1720be6583d28a33b4fe4ab450d4d2d05adb.jpg",
          title: "资料片预购特惠",
          date: "2024-08-15",
          participants: 150000,
          description: "预购《黑色狂潮》DLC可享受85折优惠",
          status: "ongoing",
          statusText: "进行中"
        },
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/2378810/ss_6efebdb45d34ab5b6a4c39f294d0566024739f6c.jpg",
          title: "主游戏折扣",
          date: "2024-08-15",
          participants: 250000,
          description: "活动期间主游戏享受75折优惠",
          status: "ongoing",
          statusText: "进行中"
        }
      ],
      products: [
        {
          id: "1-dlc",
          baseGameId: 1,
          title: "赛博朋克2077 - 黑色狂潮 DLC",
          price: 158,
          originalPrice: 188,
          discount: 15,
          image: "https://media.st.dl.eccdnx.com/steam/apps/2478810/header.jpg",
          description: "黑色狂潮资料片包含全新剧情任务、角色和装备",
          releaseDate: '2024-08-15',
          type: 'dlc',
          tags: ['DLC', 'RPG', '动作'],
          rating: 0, // 新发售暂无评分
          publisher: "CD PROJEKT RED",
          features: ['4K Ultra HD', 'HDR', '手柄支持'],
          activityInfo: {
            id: 1,
            type: ACTIVITY_TYPES.DLC,
            badge: {
              text: "新品预购",
              color: "green"
            }
          }
        },
        {
          id: 1,
          title: "赛博朋克2077",
          price: 298,
          originalPrice: 398,
          discount: 25,
          image: "https://media.st.dl.eccdnx.com/steam/apps/1091500/header.jpg",
          rating: 4.8,
          tags: ['RPG', '开放世界', '科幻'],
          releaseDate: '2020-12-10',
          publisher: "CD PROJEKT RED",
          playerCount: "单人",
          description: "在赛博朋克2077中，您将在最危险的未来都市夜之城寻找永生的关键。",
          features: ['4K Ultra HD', 'HDR', '手柄支持'],
          reviews: {
            positive: 95,
            total: 12580
          },
          activityInfo: {
            id: 1,
            type: ACTIVITY_TYPES.DLC,
            badge: {
              text: "DLC特惠",
              color: "blue"
            }
          }
        }
      ],
      coupons: [
        {
          value: "15%",
          type: "折扣券",
          title: "黑色狂潮预购优惠券",
          expireDate: "2024-08-30",
          minAmount: 0,
          conditions: "仅限购买《黑色狂潮》DLC使用"
        },
        {
          value: "25%",
          type: "折扣券",
          title: "主游戏优惠券",
          expireDate: "2024-08-30",
          minAmount: 0,
          conditions: "仅限购买《赛博朋克2077》主游戏使用"
        }
      ]
    }
  }
  // ... 艾尔登法环活动数据结构类似
];

// 获取活动状态
export const getActivityStatus = (startTime, endTime) => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'ongoing';
};

// 通过ID获取活动数据
export const getActivityById = (id) => {
  return ACTIVITIES_DATA.find(activity => activity.id === parseInt(id)) || null;
};

// 获取活动预览列表
export const getActivityPreviews = () => {
  return ACTIVITIES_DATA.map(activity => ({
    id: activity.id,
    imageUrl: activity.banner.imageUrl,
    title: activity.banner.title,
    subtitle: activity.banner.subtitle,
    date: activity.info.startTime.split(' ')[0],
    status: getActivityStatus(activity.info.startTime, activity.info.endTime)
  }));
};

// 获取游戏当前参与的活动信息
export const getGameActivityInfo = (gameId) => {
  return GAME_ACTIVITIES[gameId] || [];
};

// 获取活动关联的所有游戏
export const getActivityGames = (activityId) => {
  const activity = ACTIVITIES_DATA.find(a => a.id === activityId);
  if (!activity) return [];
  return activity.media.products;
};

// 判断游戏是否参与某个活动
export const isGameInActivity = (gameId, activityId) => {
  const activities = GAME_ACTIVITIES[gameId] || [];
  return activities.some(activity => activity.id === activityId);
};

// 获取游戏在特定活动中的折扣信息
export const getGameActivityDiscount = (gameId, activityId) => {
  const activities = GAME_ACTIVITIES[gameId] || [];
  const activity = activities.find(a => a.id === activityId);
  return activity?.discount || 0;
};

// 导出所有常量和函数
export {
  ACTIVITIES_DATA,
  ACTIVITY_TYPES,
  ACTIVITY_STATUS,
  GAME_TYPES,
  GAME_ACTIVITIES,
  getActivityStatus,
  getActivityById,
  getActivityPreviews,
  getGameActivityInfo,
  getActivityGames,
  isGameInActivity,
  getGameActivityDiscount
};