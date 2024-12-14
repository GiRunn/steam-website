// src/pages/store/activity-detail/components/ActivityInfo/index.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Tag, Users, AlertCircle, ChevronDown, ChevronUp, Gift } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * 优惠活动详情组件
 * @param {Object} data - 活动数据
 * @param {string} data.title - 活动标题
 * @param {string} data.startTime - 活动开始时间
 * @param {string} data.endTime - 活动结束时间
 * @param {Array} data.discounts - 优惠信息列表
 * @param {Array} data.conditions - 参与条件列表
 * @param {Array} data.tags - 活动标签
 * @param {string} data.notice - 活动公告
 * @param {boolean} data.isActive - 活动是否进行中
 */
const ActivityInfo = ({ data }) => {
  const [showFullConditions, setShowFullConditions] = useState(false);

  if (!data) return null;

  // 计算活动状态
  const getActivityStatus = () => {
    const now = new Date().getTime();
    const startTime = new Date(data.startTime).getTime();
    const endTime = new Date(data.endTime).getTime();

    if (now < startTime) return { text: '即将开始', color: 'bg-blue-500' };
    if (now > endTime) return { text: '已结束', color: 'bg-gray-500' };
    return { text: '进行中', color: 'bg-green-500' };
  };

  const status = getActivityStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 活动标题和状态 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <Badge className={`${status.color} px-3 py-1`}>
          {status.text}
        </Badge>
      </div>

      {/* 活动时间 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-5 h-5" />
            <span>活动时间：{data.startTime} 至 {data.endTime}</span>
          </div>
        </CardContent>
      </Card>

      {/* 优惠信息 */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Gift className="w-5 h-5" />
            优惠详情
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.discounts.map((discount, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#252a31] p-4 rounded-lg"
              >
                <div className="text-xl font-bold text-yellow-500 mb-2">
                  {discount.value}
                </div>
                <div className="text-sm text-gray-400">
                  {discount.description}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 参与条件 */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            参与条件
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence>
            <motion.div className="space-y-3">
              {data.conditions.slice(0, showFullConditions ? undefined : 3).map((condition, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                  <span>{condition}</span>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          
          {data.conditions.length > 3 && (
            <Button
              variant="ghost"
              className="mt-4 w-full"
              onClick={() => setShowFullConditions(!showFullConditions)}
            >
              {showFullConditions ? (
                <ChevronUp className="w-4 h-4 mr-2" />
              ) : (
                <ChevronDown className="w-4 h-4 mr-2" />
              )}
              {showFullConditions ? '收起' : '查看更多'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 活动公告 */}
      {data.notice && (
        <Alert>
          <AlertDescription>
            {data.notice}
          </AlertDescription>
        </Alert>
      )}

      {/* 活动标签 */}
      <div className="flex items-center gap-2 flex-wrap">
        <Tag className="w-4 h-4 text-gray-400" />
        {data.tags.map((tag, index) => (
          <Tooltip key={index} content={`查看更多${tag}相关活动`}>
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-[#2a3038] transition-colors"
            >
              {tag}
            </Badge>
          </Tooltip>
        ))}
      </div>
    </motion.div>
  );
};

export default ActivityInfo;