import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, House, CalendarCheck, TrendingUp, Star } from 'lucide-react';
import { hostApi } from '../../api/hostApi';
import { bookingApi } from '../../api/bookingApi';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HostDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Sample chart data for now since we haven't wired up earningsApi chart data explicitly in this component yet
  // In a real app, this would come from an API call
  const chartData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
  ];

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [dashboardRes, bookingsRes] = await Promise.all([
        hostApi.getDashboard(),
        bookingApi.getRecentBookings()
      ]);
      setStats(dashboardRes.stats);
      setRecentBookings(bookingsRes.data);
    } catch (err) {
      setError('Something went wrong. We couldn\'t load your dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
        <button 
          onClick={fetchDashboardData}
          className="px-6 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Active Listings', value: stats.activeListings, icon: House, color: 'text-brand-500', bg: 'bg-brand-50' },
    { title: 'Upcoming Bookings', value: stats.upcomingBookings, icon: CalendarCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Occupancy Rate', value: `${stats.occupancyRate}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Average Rating', value: stats.averageRating, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  ];

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.h1 variants={fadeUp} className="text-3xl font-bold text-gray-900">Overview</motion.h1>
      
      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
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

      {/* Chart & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Earnings Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Earnings Overview</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF385C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF385C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#FF385C', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF385C" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Bookings List */}
        <motion.div variants={fadeUp} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <CalendarCheck className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-900">No recent bookings</p>
              <p className="text-xs text-gray-500 mt-1">When guests book, they'll appear here.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex gap-4 items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                    {booking.guest?.profileImage ? (
                      <img src={booking.guest.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 font-bold text-sm">
                        {booking.guest?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{booking.guest?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{booking.listing?.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-gray-900">₹{booking.pricing?.totalAmount?.toLocaleString() || 0}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${
                      booking.status === 'confirmed' ? 'text-emerald-500' :
                      booking.status === 'pending' ? 'text-orange-500' :
                      'text-gray-500'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HostDashboard;
