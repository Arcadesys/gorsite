'use client'

import { useState } from 'react'
import { FaLink, FaCopy, FaCheck, FaSpinner } from 'react-icons/fa'

interface CopyInviteLinkProps {
  email: string
  className?: string
}

export default function CopyInviteLink({ email, className = '' }: CopyInviteLinkProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateAndCopyLink = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/generate-invite-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate invite link')
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(data.inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)

    } catch (err: any) {
      console.error('Failed to generate/copy invite link:', err)
      alert(`Failed to generate invite link: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={generateAndCopyLink}
      disabled={isLoading || copied}
      className={`inline-flex items-center gap-1 transition-colors ${
        copied 
          ? 'text-green-600' 
          : 'text-blue-600 hover:text-blue-900'
      } ${className}`}
      title={copied ? 'Invite link copied!' : 'Generate and copy invite link'}
    >
      {isLoading ? (
        <FaSpinner className="animate-spin w-3 h-3" />
      ) : copied ? (
        <FaCheck className="w-3 h-3" />
      ) : (
        <FaLink className="w-3 h-3" />
      )}
      {copied ? 'Copied!' : 'Link'}
    </button>
  )
}