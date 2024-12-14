// src/pages/store/activity-detail/utils/constants.js

// 活动数据
export const ACTIVITIES_DATA = [
  {
    id: 1,
    banner: {
      imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/570/header.jpg",
      title: "DOTA2 国际邀请赛 2024",
      subtitle: "全球顶级电竞赛事"
    },
    info: {
      title: "TI2024 中国大师赛",
      startTime: "2024-08-15 10:00:00",
      endTime: "2024-08-20 22:00:00",
      description: "2024年度DOTA2最重要的赛事，云集全球顶尖战队，见证电竞传奇的诞生。现场设有粉丝互动区、选手见面会、周边限定购等精彩内容。",
      conditions: [
        "年满16周岁",
        "持有效身份证件",
        "遵守场馆规定",
        "同意活动免责声明"
      ]
    },
    media: {
      promotion: [
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/570/ss_86d675fdc73ba10462abb8f5ece7791c5047072c.jpg",
          title: "TI2024 预选赛",
          date: "2024-07-01",
          participants: 5000,
          description: "TI2024预选赛阶段，决出晋级正赛的战队名单",
          status: "upcoming",
          statusText: "即将开始"
        },
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/570/ss_f9ebafcf82cd566cbab88d54656a10581892e771.jpg",
          title: "TI2024 小组赛",
          date: "2024-08-15",
          participants: 12000,
          description: "18支顶级战队的小组赛阶段对决",
          status: "ongoing",
          statusText: "进行中"
        }
      ],
      products: [
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/570/capsule_616x353.jpg",
          title: "TI2024纪念T恤",
          price: 299,
          discountPrice: 199,
          discount: "6.7",
          rating: "4.8",
          sales: 1200,
          tags: ["限量版", "纪念服饰"]
        },
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/570/header.jpg",
          title: "TI2024典藏徽章套装",
          price: 399,
          discountPrice: 299,
          discount: "7.5",
          rating: "4.9",
          sales: 800,
          tags: ["典藏版", "限量徽章"]
        }
      ],
      coupons: [
        {
          value: "￥50",
          type: "满减券",
          title: "TI2024周边满减券",
          expireDate: "2024-08-20",
          minAmount: 300,
          conditions: "仅限TI2024官方周边使用"
        },
        {
          value: "85折",
          type: "折扣券",
          title: "TI2024饮品折扣券",
          expireDate: "2024-08-20",
          minAmount: 50,
          conditions: "仅限场馆内饮品使用"
        }
      ]
    },
    relatedActivities: [
      {
        id: 2,
        imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/730/header.jpg",
        title: "CS2 Major 上海站",
        date: "2024-09-20"
      },
      {
        id: 3,
        imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/1172470/header.jpg",
        title: "英雄联盟 S14 全球总决赛",
        date: "2024-10-15"
      }
    ]
  },
  {
    id: 2,
    banner: {
      imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/730/header.jpg",
      title: "CS2 Major 上海站",
      subtitle: "首届中国大型CS2职业赛事"
    },
    info: {
      title: "CS2 Major 上海站",
      startTime: "2024-09-20 09:30:00",
      endTime: "2024-09-25 22:00:00",
      description: "首次在中国举办的CS2 Major赛事，16支世界顶级战队齐聚上海，角逐200万美元奖金池。",
      conditions: [
        "年满16周岁",
        "持有效身份证件",
        "遵守场馆规定"
      ]
    },
    media: {
      promotion: [
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/730/ss_118cb022b9b43f70d2e5a2df7427f29088b6b191.jpg",
          title: "Major资格赛",
          date: "2024-08-20",
          participants: 3000,
          description: "中国区预选赛，决出晋级名额",
          status: "upcoming",
          statusText: "即将开始"
        }
      ],
      products: [
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/730/capsule_616x353.jpg",
          title: "Major限定版鼠标垫",
          price: 199,
          discountPrice: 159,
          discount: "8.0",
          rating: "4.7",
          sales: 500,
          tags: ["限量版", "周边"]
        }
      ],
      coupons: [
        {
          value: "￥30",
          type: "满减券",
          title: "Major周边满减券",
          expireDate: "2024-09-25",
          minAmount: 200,
          conditions: "仅限Major官方周边使用"
        }
      ]
    },
    relatedActivities: [
      {
        id: 1,
        imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/570/header.jpg",
        title: "DOTA2 国际邀请赛 2024",
        date: "2024-08-15"
      },
      {
        id: 3,
        imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/1172470/header.jpg",
        title: "英雄联盟 S14 全球总决赛",
        date: "2024-10-15"
      }
    ]
  },
  {
    id: 3,
    banner: {
      imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/1172470/header.jpg",
      title: "英雄联盟 S14 全球总决赛",
      subtitle: "2024英雄联盟全球总决赛"
    },
    info: {
      title: "英雄联盟 S14 全球总决赛",
      startTime: "2024-10-15 16:00:00",
      endTime: "2024-10-15 23:59:59",
      description: "2024年英雄联盟最重要的国际赛事，全球顶尖战队齐聚一堂，见证新的王者诞生。",
      conditions: [
        "年满16周岁",
        "持有效身份证件",
        "遵守场馆规定",
        "禁止携带自制应援物"
      ]
    },
    media: {
      promotion: [
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/1172470/ss_9db45283e42e8fff32c366f40b0642cfb984897d.jpg",
          title: "S14 开幕式",
          date: "2024-10-15",
          participants: 80000,
          description: "震撼开幕式及明星表演",
          status: "upcoming",
          statusText: "即将开始"
        }
      ],
      products: [
        {
          imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/1172470/capsule_616x353.jpg",
          title: "S14冠军皮肤预售",
          price: 99,
          discountPrice: 89,
          discount: "9.0",
          rating: "5.0",
          sales: 10000,
          tags: ["限时预售", "游戏皮肤"]
        }
      ],
      coupons: [
        {
          value: "￥20",
          type: "满减券",
          title: "S14周边满减券",
          expireDate: "2024-10-15",
          minAmount: 100,
          conditions: "仅限S14官方周边使用"
        }
      ]
    },
    relatedActivities: [
      {
        id: 1,
        imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/570/header.jpg",
        title: "DOTA2 国际邀请赛 2024",
        date: "2024-08-15"
      },
      {
        id: 2,
        imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/730/header.jpg",
        title: "CS2 Major 上海站",
        date: "2024-09-20"
      }
    ]
  }
];

// 根据ID获取活动数据
export const getActivityById = (id) => {
  return ACTIVITIES_DATA.find(activity => activity.id === parseInt(id));
};

// 获取活动预览列表
export const getActivityPreviews = () => {
  return ACTIVITIES_DATA.map(activity => ({
    id: activity.id,
    imageUrl: activity.banner.imageUrl,
    title: activity.banner.title,
    date: activity.info.startTime.split(' ')[0],
    location: "中国",  // 可以从info中添加location字段
    price: 0  // 可以从info中添加price字段
  }));
};