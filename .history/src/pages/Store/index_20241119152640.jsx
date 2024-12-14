

.search-bar-outer-container {
  @apply relative flex flex-col sm:flex-row gap-4 w-full mb-6;
  z-index: 10; 
}

/* 搜索区域容器 */
.search-bar-container {
  @apply relative w-full sm:max-w-xl;
  z-index: 30; /* 搜索区域需要较高层级以确保下拉框正常显示 */
}

/* 搜索输入框包装器 */
.search-input-wrapper {
  @apply relative w-full flex items-center;
}

/* 搜索图标按钮 */
.search-icon-button {
  @apply absolute left-3 
    flex items-center justify-center 
    text-gray-400 
    hover:text-blue-500 
    transition-colors;
}

.search-icon {
  @apply w-4 h-4;
}

/* 搜索输入框 */
.search-input {
  @apply w-full h-10 
    pl-10 pr-10
    bg-[#1a1f2e] 
    border border-[#2a3441]
    rounded-lg
    text-sm text-white
    placeholder:text-gray-400
    focus:outline-none 
    focus:ring-1
    focus:border-blue-500 
    focus:ring-blue-500/50
    transition-colors;
}

/* 清除按钮 */
.clear-button {
  @apply absolute right-3
    p-1
    text-gray-400 
    hover:text-gray-300
    rounded-full 
    hover:bg-[#2a3441]
    transition-colors;
}

/* 搜索历史下拉框 - 调整z-index确保正确显示 */
.search-history {
  @apply absolute top-[calc(100%+0.5rem)] left-0
    w-full
    bg-[#1a1f2e] 
    border border-[#2a3441]
    rounded-lg
    shadow-lg;
  z-index: 40; /* 确保下拉框在其他元素之上 */
}

/* 历史记录头部 */
.history-header {
  @apply flex items-center justify-between
    px-4 py-2
    border-b border-[#2a3441];
}

.history-title {
  @apply flex items-center gap-2
    text-sm text-gray-400;
}

.history-title-icon {
  @apply w-4 h-4;
}

.clear-history {
  @apply px-2 py-1
    text-xs text-gray-400
    hover:text-gray-300
    rounded
    hover:bg-[#2a3441]
    transition-colors;
}

/* 历史记录项 */
.history-item {
  @apply flex items-center gap-3
    w-full px-4 py-2
    text-sm text-gray-300
    hover:bg-[#2a3441]
    transition-colors;
}

.history-icon {
  @apply w-4 h-4 text-gray-400;
}

.history-term {
  @apply truncate;
}

/* 操作区域 - 调整定位和层级 */
.search-actions {
  @apply relative flex items-center gap-3 sm:ml-auto;
  z-index: 20; /* 确保操作区域在适当的层级 */
}

/* 排序选择器 - 优化样式和层级 */
.sort-select-wrapper {
  @apply relative;
  z-index: 25; /* 确保选择器在适当的层级 */
}

.sort-select {
  @apply h-10
    w-[160px]
    px-4 pr-10
    bg-[#1a1f2e] 
    border border-[#2a3441]
    rounded-lg
    text-sm text-gray-300
    cursor-pointer
    appearance-none
    focus:outline-none 
    focus:ring-1
    focus:border-blue-500 
    focus:ring-blue-500/50;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1em 1em;
}

/* 清除筛选按钮 */
.clear-filters-button {
  @apply h-10 px-4
    flex items-center justify-center gap-2
    min-w-[120px]
    bg-[#1a1f2e] 
    border border-[#2a3441]
    rounded-lg
    text-sm text-gray-300
    hover:text-white hover:bg-[#2a3441]
    transition-colors;
}

/* 响应式优化 */
@media (max-width: 640px) {
  .search-bar-outer-container {
    @apply flex-col gap-4;
  }

  .search-actions {
    @apply flex-col w-full;
  }

  .sort-select-wrapper {
    @apply w-full;
  }

  .sort-select {
    @apply w-full;
  }

  .clear-filters-button {
    @apply w-full;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-history {
  animation: fadeIn 0.2s ease-out;
}