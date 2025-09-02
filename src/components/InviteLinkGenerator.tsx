'use client'

import { useState } from 'react'
import { FaCopy, FaCheck, FaLink, FaSpinner } from 'react-icons/fa'

interface InviteLinkGeneratorProps {
  onClose?: () => void
}

export default function InviteLinkGenerator({ onClose }: InviteLinkGeneratorProps) {
  const [email, setEmail] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [inviteData, setInviteData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const generateInviteLink = async () => {
    if (!email) {
      setError('Email is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/generate-invite-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, customMessage })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate invite link')
      }

      setInviteLink(data.inviteLink)
      setInviteData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const reset = () => {
    setEmail('')
    setCustomMessage('')
    setInviteLink('')
    setInviteData(null)
    setError('')
    setCopied(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-md w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FaLink className="text-blue-500" />
          Generate Invite Link
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </div>

      {!inviteLink ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Artist Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="artist@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Custom Message (Optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Welcome to our gallery..."
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <button
            onClick={generateInviteLink}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 transition"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FaLink />
                Generate Invite Link
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`border rounded-lg p-4 ${
            inviteData?.isExisting 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}>
            <div className={`flex items-center gap-2 mb-2 ${
              inviteData?.isExisting ? 'text-blue-800 dark:text-blue-400' : 'text-green-800 dark:text-green-400'
            }`}>
              <FaCheck />
              <span className="font-medium">
                {inviteData?.isExisting ? 'Existing Invitation Found!' : 'Invite Link Generated!'}
              </span>
            </div>
            <p className={`text-sm ${
              inviteData?.isExisting ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'
            }`}>
              {inviteData?.isExisting ? (
                <>
                  An invitation for <strong>{email}</strong> already exists. 
                  {inviteData.invitedBy && ` Originally sent by ${inviteData.invitedBy}`}
                  {inviteData.createdAt && ` on ${new Date(inviteData.createdAt).toLocaleDateString()}`}.
                </>
              ) : (
                <>Share this link with <strong>{email}</strong> to let them sign up directly.</>
              )}
            </p>
            {inviteData?.customMessage && inviteData.isExisting && (
              <p className="text-sm mt-2 italic">
                Original message: "{inviteData.customMessage}"
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Invitation Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className={`px-3 py-2 rounded-md flex items-center gap-1 transition ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                }`}
              >
                {copied ? <FaCheck /> : <FaCopy />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
            💡 <strong>Tip:</strong> This link expires in 7 days. You can also send a regular invitation 
            with email for a more professional experience.
          </div>

          <div className="flex gap-2">
            <button
              onClick={reset}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md transition"
            >
              Generate Another
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}