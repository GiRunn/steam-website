// E:\Steam\steam-website\src\pages\payment\index.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import GameProduct from './components/GameProduct';
import PaymentMethods from './components/PaymentMethods';
import OrderSummary from './components/OrderSummary';
import PaymentForm from './components/PaymentForm';
import { useSearchParams } from 'react-router-dom';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

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
      // 实际支付处理逻辑
      await new Promise(resolve => setTimeout(resolve, 2000));
      // 支付成功后跳转到成功页面
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
    <div className="min-h-screen bg-[#0a0f16] text-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">确认订单</h1>
          <p className="text-gray-400 mt-2">请确认您的游戏购买信息并完成支付</p>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <GameProduct product={product} />
            
            <div className="bg-[#111827] p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">选择支付方式</h2>
              <PaymentMethods
                selectedMethod={selectedMethod}
                onSelect={setSelectedMethod}
              />
            </div>

            <PaymentForm
              selectedMethod={selectedMethod}
              onSubmit={handlePayment}
              loading={loading}
            />
          </div>
          
          <div className="space-y-6">
            <OrderSummary product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;