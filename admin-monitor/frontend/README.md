# 管理员监控系统 - 前端

## 项目概述
这是一个用于游戏平台的管理员监控系统前端项目，提供数据库性能、系统指标、评论系统等关键指标的可视化监控界面。

## 技术栈
- React 18.2.0
- TypeScript 4.9.5
- Recharts (图表库)
- Framer Motion (动画库)
- Axios (HTTP 客户端)

## 项目结构 

admin-monitor/frontend/
├── public/
│ └── index.html # HTML 模板
├── src/
│ ├── components/ # 组件目录
│ │ ├── Charts/ # 图表组件
│ │ │ └── MetricsChart.tsx
│ │ └── common/ # 通用组件
│ │ ├── Alert/ # 警告提示
│ │ ├── Badge/ # 徽章
│ │ ├── Card/ # 卡片
│ │ ├── Chart/ # 图表基础组件
│ │ ├── Icon/ # 图标
│ │ ├── Progress/ # 进度条
│ │ ├── Statistic/ # 统计数值
│ │ └── Table/ # 表格
│ ├── styles/ # 样式文件
│ ├── pages/ # 页面组件
│ └── App.tsx # 应用入口
├── package.json # 项目配置
└── tsconfig.json # TypeScript 配置


## 组件文档

### 通用组件

#### Alert
警告提示组件，用于展示警告信息。

typescript
<Alert
type="success" | "warning" | "error" | "info"
message="提示信息"
showIcon={true}
closable={false}
onClose={() => {}}
/>



#### Badge
状态徽章组件，用于展示状态。


typescript
<Badge
status="success" | "error" | "warning" | "info" | "default"
text="状态文本"
/>



#### Card
卡片容器组件，用于信息分组展示。

typescript
<Card
title="标题"
className="custom-class"
>
内容
</Card>
