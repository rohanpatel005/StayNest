import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, CreditCard, ArrowDownCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { earningsApi } from '../../api/earningsApi';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';

const HostEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEarningsData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [earningsRes, transactionsRes] = await Promise.all([
        earningsApi.getEarnings(),
        earningsApi.getTransactions({ limit: 20 })
      ]);
      setEarnings(earningsRes.data);
      setTransactions(transactionsRes.data.items);
    } catch (err) {
      setError('Failed to load earnings data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-900 font-bold text-lg mb-2">Something went wrong.</p>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={fetchEarningsData} className="px-6 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600 transition">Try Again</button>
      </div>
    );
  }

  const statCards = [
    { title: 'Net Earnings', value: `₹${earnings?.netEarnings?.toLocaleString() || 0}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Current Month', value: `₹${earnings?.currentMonthEarnings?.toLocaleString() || 0}`, icon: IndianRupee, color: 'text-brand-500', bg: 'bg-brand-50' },
    { title: 'Pending Payout', value: `₹${earnings?.pendingPayout?.toLocaleString() || 0}`, icon: ArrowDownCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Completed Payout', value: `₹${earnings?.completedPayout?.toLocaleString() || 0}`, icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.h1 variants={fadeUp} className="text-3xl font-bold text-gray-900">Earnings</motion.h1>
        <motion.button variants={fadeUp} className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-900 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors">
          <CreditCard className="w-5 h-5 text-gray-500" />
          Payout Settings
        </motion.button>
      </div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 font-medium text-sm">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
          <span className="text-sm font-medium text-gray-500">Last 20 transactions</span>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <IndianRupee className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No transactions yet</h3>
            <p className="text-gray-500">Your earnings will appear here once bookings are completed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Property</th>
                  <th className="p-4 font-bold text-right">Gross Amount</th>
                  <th className="p-4 font-bold text-right">Platform Fee</th>
                  <th className="p-4 font-bold text-right">Net Amount</th>
                  <th className="p-4 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {transactions.map((tx) => (
                    <motion.tr 
                      key={tx._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4 text-sm font-medium text-gray-900">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4 text-sm text-gray-900 truncate max-w-[200px]">
                        {tx.listing?.title || 'Unknown Property'}
                      </td>
                      <td className="p-4 text-sm text-gray-500 text-right">
                        ₹{tx.amount?.gross?.toLocaleString()}
                      </td>
                      <td className="p-4 text-sm text-brand-500 text-right">
                        -₹{tx.amount?.platformFee?.toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-gray-900 text-right">
                        ₹{tx.amount?.net?.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          tx.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default HostEarnings;
