// E:\Steam\steam-website\src\pages\payment\index.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import GameProduct from './components/GameProduct';
import PaymentMethods from './components/PaymentMethods';
import OrderSummary from './components/OrderSummary';
import PaymentForm from './components/PaymentForm';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取从购买页面传递过来的游戏信息
  const product = location.state?.product;

  // 如果没有产品信息,返回上一页
  if (!product) {
    navigate(-1);
    return null;
  }

  const handlePayment = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // 直接导航到成功页面，跳过支付处理
      navigate('/payment/success', { 
        state: { 
          product,
          paymentMethod: selectedMethod
        }
      });
    } catch (err) {
      setError(err.message || '支付处理过程中出现错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f16] text-gray-100">
      {/* 增加顶部间距，移除之前的 padding */}
      <div className="pt-12 pb-16">
        {/* 移除最大宽度限制，增加水平内边距 */}
        <div className="px-6 lg:px-12">
          <header className="max-w-[1920px] mx-auto mb-12">
            <h1 className="text-4xl font-bold">确认订单</h1>
            <p className="text-gray-400 mt-3 text-lg">请确认您的游戏购买信息并完成支付</p>
          </header>

          {error && (
            <Alert variant="destructive" className="mb-8 max-w-[1920px] mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 主要内容区域 - 调整最大宽度和布局 */}
          <div className="max-w-[1920px] mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* 游戏产品和支付部分 - 扩大宽度占比 */}
              <div className="xl:col-span-9 space-y-8">
                {/* GameProduct 不设置额外约束，让它自然撑开 */}
                <div className="w-full">
                  <GameProduct product={product} />
                </div>
                
                <div className="bg-[#111827] p-8 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-semibold mb-6">选择支付方式</h2>
                  <PaymentMethods
                    selectedMethod={selectedMethod}
                    onSelect={setSelectedMethod}
                  />
                </div>

                <div className="bg-[#111827] rounded-xl overflow-hidden">
                  <PaymentForm
                    selectedMethod={selectedMethod}
                    onSubmit={handlePayment}
                    loading={loading}
                  />
                </div>
              </div>
              
              {/* 订单摘要部分 - 调整宽度占比 */}
              <div className="xl:col-span-3">
                <div className="sticky top-8">
                  <OrderSummary product={product} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;