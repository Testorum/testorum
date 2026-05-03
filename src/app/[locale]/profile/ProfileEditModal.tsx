'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  currentName: string
  currentAvatar: string | null
  locale: string
  onSaved: (name: string, avatar: string | null) => void
}

const TORI_AVATARS = [
  { id: 'celebrating', src: '/tori/celebrating.png' },
  { id: 'curious', src: '/tori/curious.png' },
  { id: 'excited', src: '/tori/excited.png' },
  { id: 'happy', src: '/tori/happy.png' },
  { id: 'sad', src: '/tori/sad.png' },
  { id: 'smug', src: '/tori/smug.png' },
  { id: 'surprised', src: '/tori/surprised.png' },
  { id: 'thinking', src: '/tori/thinking.png' },
]

export function ProfileEditModal({
  isOpen,
  onClose,
  currentName,
  currentAvatar,
  locale,
  onSaved,
}: ProfileEditModalProps) {
  const isKo = locale === 'ko'
  const [name, setName] = useState(currentName)
  const [avatar, setAvatar] = useState<string | null>(currentAvatar)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 30) {
      setError(isKo ? '닉네임은 1~30자로 입력해줘' : 'Name must be 1-30 characters')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: trimmed,
          avatar_url: avatar,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update')
      }

      onSaved(trimmed, avatar)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }, [name, avatar, isKo, onSaved, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-5 space-y-5">
              <h2 className="text-lg font-extrabold text-gray-800 text-center">
                {isKo ? '프로필 수정' : 'Edit Profile'}
              </h2>

              {/* Display name */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  {isKo ? '닉네임' : 'Display Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#FF4F4F]/30 focus:border-[#FF4F4F]
                             transition-all"
                  placeholder={isKo ? '닉네임 입력' : 'Enter name'}
                />
                <p className="text-[10px] text-gray-300 mt-1 text-right">
                  {name.length}/30
                </p>
              </div>

              {/* Avatar selection */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  {isKo ? '아바타 선택' : 'Choose Avatar'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {/* Default initial avatar */}
                  <button
                    onClick={() => setAvatar(null)}
                    className={`
                      w-full aspect-square rounded-xl border-2 flex items-center justify-center
                      transition-all
                      ${avatar === null ? 'border-[#FF4F4F] bg-[#FF4F4F]/5' : 'border-gray-100 hover:border-gray-200'}
                    `}
                  >
                    <span className="text-xl font-bold text-gray-400">
                      {currentName.charAt(0).toUpperCase()}
                    </span>
                  </button>

                  {/* Tori avatars */}
                  {TORI_AVATARS.map((tori) => (
                    <button
                      key={tori.id}
                      onClick={() => setAvatar(tori.src)}
                      className={`
                        w-full aspect-square rounded-xl border-2 overflow-hidden
                        transition-all
                        ${avatar === tori.src ? 'border-[#FF4F4F] bg-[#FF4F4F]/5' : 'border-gray-100 hover:border-gray-200'}
                      `}
                    >
                      <Image
                        src={tori.src}
                        alt={tori.id}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500
                             bg-gray-100 hover:bg-gray-150 transition-colors"
                >
                  {isKo ? '취소' : 'Cancel'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                             transition-all active:scale-95 disabled:opacity-60"
                  style={{ backgroundColor: '#FF4F4F' }}
                >
                  {saving
                    ? (isKo ? '저장 중...' : 'Saving...')
                    : (isKo ? '저장' : 'Save')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
