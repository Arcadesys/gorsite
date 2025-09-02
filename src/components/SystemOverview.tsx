'use client'

import { useState, useEffect } from 'react'
import { FaUsers, FaEnvelope, FaClock, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa'

interface SystemStats {
  users: {
    total: number
    confirmed: number
    unconfirmed: number
  }
  invitations: {
    total: number
    pending: number
    expired: number
    active: number
  }
}

interface RecentActivity {
  id: string
  email: string
  invitedBy: string
  createdAt: string
  expiresAt: string
  isExpired: boolean
}

interface SystemOverviewProps {
  accentColor: string
  colorMode: string
}

export default function SystemOverview({ accentColor, colorMode }: SystemOverviewProps) {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load statistics')
        }
        
        setStats(data.stats)
        setRecentActivity(data.recentActivity)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin mr-2" />
        Loading system overview...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <FaExclamationTriangle className="inline mr-2" />
        {error}
      </div>
    )
  }

  if (!stats) return null

  const StatCard = ({ icon, title, value, subtitle, color = 'blue' }: {
    icon: React.ReactNode
    title: string
    value: number
    subtitle?: string
    color?: string
  }) => (
    <div className={`p-4 rounded-lg border ${colorMode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-lg text-${color}-600 bg-${color}-50 dark:bg-${color}-900/20 mr-3`}>
          {icon}
        </div>
        <div>
          <p className={`text-2xl font-bold ${colorMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </p>
          {subtitle && (
            <p className={`text-xs ${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={{ color: `var(--${accentColor}-400)` }}>
        System Overview
      </h3>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaUsers />}
          title="Total Users"
          value={stats.users.total}
          subtitle={`${stats.users.confirmed} confirmed, ${stats.users.unconfirmed} pending`}
          color="blue"
        />
        
        <StatCard
          icon={<FaCheckCircle />}
          title="Active Artists"
          value={stats.users.confirmed}
          subtitle="Email confirmed"
          color="green"
        />
        
        <StatCard
          icon={<FaEnvelope />}
          title="Pending Invites"
          value={stats.invitations.active}
          subtitle={`${stats.invitations.expired} expired`}
          color="yellow"
        />
        
        <StatCard
          icon={<FaClock />}
          title="Total Invitations"
          value={stats.invitations.total}
          subtitle="All time"
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className={`p-4 rounded-lg border ${colorMode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h4 className="font-semibold mb-3" style={{ color: `var(--${accentColor}-400)` }}>
            Recent Invitations
          </h4>
          <div className="space-y-2">
            {recentActivity.map((activity) => (
              <div key={activity.id} className={`flex items-center justify-between p-2 rounded ${
                activity.isExpired 
                  ? 'bg-red-50 dark:bg-red-900/10 text-red-600' 
                  : colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.email}</div>
                  <div className="text-xs opacity-75">
                    Invited by {activity.invitedBy} • {formatDate(activity.createdAt)}
                  </div>
                </div>
                <div className="text-xs">
                  {activity.isExpired ? (
                    <span className="text-red-600 font-medium">Expired</span>
                  ) : (
                    <span>Expires {formatDate(activity.expiresAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}