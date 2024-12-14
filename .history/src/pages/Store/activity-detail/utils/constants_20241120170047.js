// src/pages/store/activity-detail/utils/constants.js

// 活动数据
export const ACTIVITIES_DATA = [
  {
    id: 1,
    banner: {
      imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
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
          imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_1.jpg",
          title: "资料片预购特惠",
          date: "2024-08-15",
          participants: 150000,
          description: "预购《黑色狂潮》DLC可享受85折优惠",
          status: "ongoing",
          statusText: "进行中"
        },
        {
          imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_2.jpg",
          title: "主游戏折扣",
          date: "2024-08-15",
          participants: 250000,
          description: "活动期间主游戏享受75折优惠",
          status: "ongoing",
          statusText: "进行中"
        }
      ],
      products: [], // 将通过service动态获取关联游戏
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
  },
  {
    id: 2,
    banner: {
      imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
      title: "艾尔登法环 - 影之国度",
      subtitle: "全新DLC发布庆典"
    },
    info: {
      title: "艾尔登法环：影之国度发售庆典",
      startTime: "2024-09-01 00:00:00",
      endTime: "2024-09-15 23:59:59",
      description: "《艾尔登法环：影之国度》DLC现已发布！探索全新地图、挑战新Boss、发现新武器与法术。活动期间参与在线多人对战还可获得限定奖励。",
      conditions: [
        "拥有艾尔登法环主游戏",
        "Steam帐户状态正常"
      ],
      gameIds: [2] // 关联的游戏ID
    },
    media: {
      promotion: [
        {
          imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_1.jpg",
          title: "DLC首发特惠",
          date: "2024-09-01",
          participants: 100000,
          description: "新DLC首周限时9折",
          status: "upcoming",
          statusText: "即将开始"
        }
      ],
      products: [], // 将通过service动态获取关联游戏
      coupons: [
        {
          value: "10%",
          type: "折扣券",
          title: "影之国度DLC优惠券",
          expireDate: "2024-09-15",
          minAmount: 0,
          conditions: "仅限购买《影之国度》DLC使用"
        }
      ]
    }
  }
];

// 活动状态常量
export const ACTIVITY_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  ENDED: 'ended'
};

// 获取活动状态
export const getActivityStatus = (startTime, endTime) => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (now < start) return ACTIVITY_STATUS.UPCOMING;
  if (now > end) return ACTIVITY_STATUS.ENDED;
  return ACTIVITY_STATUS.ONGOING;
};

// 根据ID获取活动数据
export const getActivityById = async (id) => {
  try {
    const activity = await ActivityService.getActivityById(parseInt(id));
    return activity;
  } catch (error) {
    console.error('Error getting activity:', error);
    return null;
  }
};