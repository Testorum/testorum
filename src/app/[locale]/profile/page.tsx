import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { ProfileClient } from './ProfileClient'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isKo = locale === 'ko'

  return {
    title: isKo ? '내 프로필 | 테스토럼' : 'My Profile | Testorum',
    description: isKo
      ? '내 테스트 기록과 성격 DNA 프로필을 확인해봐'
      : 'View your test history and personality DNA profile',
  }
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}`)
  }

  // Fetch profile data
  const { data: profileData } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, referral_code')
    .eq('id', user.id)
    .single()

  return (
    <ProfileClient
      locale={locale}
      user={{
        id: user.id,
        email: user.email ?? '',
        displayName: profileData?.display_name ?? user.email?.split('@')[0] ?? 'User',
        avatarUrl: profileData?.avatar_url ?? null,
        referralCode: profileData?.referral_code ?? null,
      }}
    />
  )
}
