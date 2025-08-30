'use client';

import { useEffect, useState } from 'react';
// ...existing code...
import { useRouter } from 'next/navigation';
import { FaPalette, FaClipboardList, FaCog } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { accentColor, colorMode } = useTheme();

  useEffect(() => {
  // ...existing code...
      router.push('/admin/login');
      return;
    }

    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: `var(--${accentColor}-500)` }}></div>
      </div>
    );
  }

  const dashboardItems = [
    {
      title: 'Commissions',
      icon: <FaClipboardList size={24} />,
      count: '12',
      description: 'Active commissions',
      link: '/admin/commissions',
      color: 'bg-blue-500',
    },
    {
      title: 'Gallery',
      icon: <FaPalette size={24} />,
      count: '24',
      description: 'Artwork pieces',
      link: '/admin/gallery',
      color: 'bg-green-500',
    },
    {
      title: 'Settings',
      icon: <FaCog size={24} />,
      count: '',
      description: 'Site configuration',
      link: '/admin/config',
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: `var(--${accentColor}-400)` }}>
        Dashboard
      </h1>

      {/* Dashboard Content */}
      <div className={`${colorMode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardItems.map((item, index) => (
            <div
              key={index}
              className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden cursor-pointer transition transform hover:scale-105`}
              onClick={() => router.push(item.link)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full ${item.color} text-white`}>
                    {item.icon}
                  </div>
                  {item.count && (
                    <span className="text-2xl font-bold" style={{ color: `var(--${accentColor}-400)` }}>
                      {item.count}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                <p className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.description}
                </p>
              </div>
              <div className="h-1" style={{ backgroundColor: `var(--${accentColor}-500)` }}></div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-8`}>
          <h2 className="text-xl font-bold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
            Recent Activity
          </h2>
          <div className={`overflow-hidden rounded-lg border ${colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <table className="min-w-full divide-y divide-gray-700">
              <thead className={`${colorMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-700`}>
                {[
                  {
                    event: 'New Commission',
                    user: 'John Doe',
                    date: '2 hours ago',
                    status: 'Pending',
                    statusColor: 'text-yellow-500',
                  },
                  {
                    event: 'Payment Received',
                    user: 'Jane Smith',
                    date: '5 hours ago',
                    status: 'Completed',
                    statusColor: 'text-green-500',
                  },
                  {
                    event: 'New Subscriber',
                    user: 'Mike Johnson',
                    date: '1 day ago',
                    status: 'Active',
                    statusColor: 'text-blue-500',
                  },
                  {
                    event: 'Commission Completed',
                    user: 'Sarah Williams',
                    date: '2 days ago',
                    status: 'Delivered',
                    statusColor: 'text-green-500',
                  },
                ].map((activity, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{activity.event}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{activity.user}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {activity.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${activity.statusColor} ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h3 className="text-lg font-bold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
              Commission Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Pending
                </span>
                <span className="font-bold">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  In Progress
                </span>
                <span className="font-bold">7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Completed
                </span>
                <span className="font-bold">24</span>
              </div>
            </div>
          </div>

          <div className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h3 className="text-lg font-bold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
              Revenue
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  This Month
                </span>
                <span className="font-bold">$2,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Last Month
                </span>
                <span className="font-bold">$1,980</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total
                </span>
                <span className="font-bold">$12,340</span>
              </div>
            </div>
          </div>

          <div className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h3 className="text-lg font-bold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
              Subscribers
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total
                </span>
                <span className="font-bold">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  New (30 days)
                </span>
                <span className="font-bold">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Open Rate
                </span>
                <span className="font-bold">68%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 