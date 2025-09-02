'use client'

import { useState, useEffect } from 'react'
import { FaClock, FaTrash, FaCopy, FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa'

interface Invitation {
  id: string
  email: string
  token: string
  createdAt: string
  expiresAt: string
  customMessage: string | null
  invitedBy: string
  isExpired: boolean
  daysRemaining: number
  inviteLink: string
}

interface OutstandingInvitesProps {
  accentColor: string
  colorMode: string
}

export default function OutstandingInvites({ accentColor, colorMode }: OutstandingInvitesProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadInvitations = async () => {
    try {
      const response = await fetch('/api/admin/invitations')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load invitations')
      }
      
      setInvitations(data.invitations)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvitations()
  }, [])

  const copyInviteLink = async (invitation: Invitation) => {
    try {
      await navigator.clipboard.writeText(invitation.inviteLink)
      setCopiedId(invitation.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const cancelInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel invitation')
      }

      // Reload invitations
      await loadInvitations()
    } catch (err: any) {
      alert(`Failed to cancel invitation: ${err.message}`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (invitation: Invitation) => {
    if (invitation.isExpired) return 'text-red-500'
    if (invitation.daysRemaining <= 1) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getStatusText = (invitation: Invitation) => {
    if (invitation.isExpired) return 'Expired'
    if (invitation.daysRemaining === 0) return 'Expires today'
    if (invitation.daysRemaining === 1) return '1 day left'
    return `${invitation.daysRemaining} days left`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin mr-2" />
        Loading invitations...
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

  if (invitations.length === 0) {
    return (
      <div className={`text-center py-8 ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        <FaClock className="mx-auto text-4xl mb-4 opacity-50" />
        <p>No outstanding invitations</p>
        <p className="text-sm mt-1">All sent invitations have been accepted or expired</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: `var(--${accentColor}-400)` }}>
          Outstanding Invitations ({invitations.length})
        </h3>
        <button
          onClick={loadInvitations}
          className={`text-sm px-3 py-1 rounded border transition-colors ${
            colorMode === 'dark' 
              ? 'border-gray-600 hover:bg-gray-700' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          Refresh
        </button>
      </div>

      <div className={`rounded-lg border ${colorMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Invited By</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} divide-y ${colorMode === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {invitations.map((invitation) => (
                <tr key={invitation.id} className={invitation.isExpired ? 'opacity-60' : ''}>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium">{invitation.email}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`text-sm font-medium ${getStatusColor(invitation)}`}>
                      <FaClock className="inline mr-1" />
                      {getStatusText(invitation)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Expires {formatDate(invitation.expiresAt)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {invitation.invitedBy}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {formatDate(invitation.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-sm max-w-xs">
                    {invitation.customMessage ? (
                      <div className="truncate" title={invitation.customMessage}>
                        {invitation.customMessage}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No message</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyInviteLink(invitation)}
                        className={`p-2 rounded transition-colors ${
                          copiedId === invitation.id
                            ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                            : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                        title={copiedId === invitation.id ? 'Copied!' : 'Copy invite link'}
                      >
                        {copiedId === invitation.id ? <FaCheck /> : <FaCopy />}
                      </button>
                      
                      <button
                        onClick={() => cancelInvitation(invitation.id)}
                        className="p-2 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Cancel invitation"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'} bg-gray-50 dark:bg-gray-800 p-3 rounded`}>
        💡 <strong>Tip:</strong> Expired invitations can be safely deleted. You can resend invitations from the User Management page or generate new invite links.
      </div>
    </div>
  )
}