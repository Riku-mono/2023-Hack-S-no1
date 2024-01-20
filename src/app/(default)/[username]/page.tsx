import Inner from '@/components/Inner'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

import getUserProfile from '@/app/api/user/getUserProfile'
import getUsersState from '@/app/api/user/getUserState'
import { Metadata } from 'next'
import UserArticles from '@/components/User/Articles'
import { Suspense } from 'react'
import UserWorks from '@/components/User/Works'
import { ArticleCardSkeletons, WorkCardSkeletons } from '@/components/Skeleton/skeletons'
import UserTags from '@/components/User/Tags'

interface UserProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({
  params: { username },
}: UserProfilePageProps): Promise<Metadata> {
  const userProfile = await getUserProfile(username)
  return {
    title: `${userProfile?.displayName}さんのプロフィール | Link Mono`,
    description: `${userProfile?.displayName}さんのプロフィール`,
  }
}

export default async function UserProfilePage({ params: { username } }: UserProfilePageProps) {
  const userProfile = await getUserProfile(username)

  const session = await getServerSession()
  const isCurrentUser = session?.user.name === username

  const usersState = await getUsersState(username, isCurrentUser)

  const UserStatus = [
    { label: '記事', value: `${usersState.ArticleAmount}` },
    { label: '制作物', value: `${usersState.WorkAmount}` },
    { label: 'コメント', value: `${usersState.CommentAmount}` },
  ]

  return (
    <>
      <Inner>
        <header className="overflow-hidden rounded-md border bg-gray-50 p-4 dark:bg-gray-900 lg:p-6">
          <div className="flex flex-col flex-wrap gap-4 sm:flex-row">
            <div className="relative mx-auto h-24 w-24 rounded-full sm:mx-0">
              <span className="absolute -inset-0.5" />
              <Image
                src={userProfile?.image || ''}
                width={128}
                height={128}
                className="h-24 w-24 rounded-full object-cover"
                alt="User's profile image"
              />
            </div>
            <div className="mx-auto flex flex-col sm:mx-0">
              <div className="flex h-auto flex-col items-center gap-2 sm:h-24 sm:flex-row">
                <div className="mt-4 text-center normal-case sm:mt-0 sm:text-left">
                  {userProfile?.displayName && (
                    <>
                      <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
                        {userProfile?.displayName}
                      </h2>
                      <div className="flex flex-col justify-center sm:flex-row">
                        <span className="text-md font-semibold text-gray-700 dark:text-gray-50/70">
                          @{userProfile?.name}
                        </span>
                        <Link
                          href={`https://github.com/${userProfile?.name}/`}
                          className="m-0 mx-auto block rounded-full bg-gray-100 p-0.5 text-xs font-semibold text-gray-700 no-underline underline-offset-1 hover:underline dark:bg-gray-600/30 dark:text-white sm:ml-1"
                        >
                          <svg className="h-auto w-5 fill-current" viewBox="0 0 24 24" fill="none">
                            <path d="M12.026 2C7.13295 1.99937 2.96183 5.54799 2.17842 10.3779C1.395 15.2079 4.23061 19.893 8.87302 21.439C9.37302 21.529 9.55202 21.222 9.55202 20.958C9.55202 20.721 9.54402 20.093 9.54102 19.258C6.76602 19.858 6.18002 17.92 6.18002 17.92C5.99733 17.317 5.60459 16.7993 5.07302 16.461C4.17302 15.842 5.14202 15.856 5.14202 15.856C5.78269 15.9438 6.34657 16.3235 6.66902 16.884C6.94195 17.3803 7.40177 17.747 7.94632 17.9026C8.49087 18.0583 9.07503 17.99 9.56902 17.713C9.61544 17.207 9.84055 16.7341 10.204 16.379C7.99002 16.128 5.66202 15.272 5.66202 11.449C5.64973 10.4602 6.01691 9.5043 6.68802 8.778C6.38437 7.91731 6.42013 6.97325 6.78802 6.138C6.78802 6.138 7.62502 5.869 9.53002 7.159C11.1639 6.71101 12.8882 6.71101 14.522 7.159C16.428 5.868 17.264 6.138 17.264 6.138C17.6336 6.97286 17.6694 7.91757 17.364 8.778C18.0376 9.50423 18.4045 10.4626 18.388 11.453C18.388 15.286 16.058 16.128 13.836 16.375C14.3153 16.8651 14.5612 17.5373 14.511 18.221C14.511 19.555 14.499 20.631 14.499 20.958C14.499 21.225 14.677 21.535 15.186 21.437C19.8265 19.8884 22.6591 15.203 21.874 10.3743C21.089 5.54565 16.9181 1.99888 12.026 2Z" />
                          </svg>
                        </Link>
                      </div>
                    </>
                  )}
                  {!userProfile?.displayName && (
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
                      @{userProfile?.name}
                    </h2>
                  )}
                </div>
                <div className="mt-4 flex gap-2 text-center font-semibold sm:mt-0 sm:text-start">
                  {UserStatus.map((status) => (
                    <div
                      key={status.label}
                      className="flex flex-col align-baseline text-xs text-gray-700 dark:text-white"
                    >
                      <span className="">{status.label}</span>
                      <span>{status.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 学習中タグを表示する */}
              <UserTags username={username} />
            </div>
          </div>
        </header>
        <div className="flex items-end justify-between">
          <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-gray-50">記事</h3>
          {session?.user.name === username && (
            <div>
              <div className="inline-flex items-center justify-center">
                <span className="me-1 inline-block h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  公開
                </span>
              </div>
              <span className="mx-3 text-xs font-semibold text-gray-600 dark:text-gray-400">/</span>
              <div className="inline-flex items-center justify-center">
                <span className="me-1 inline-block h-2 w-2 rounded-full bg-gray-500"></span>
                <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  下書き
                </span>
              </div>
            </div>
          )}
        </div>
        <section className="relative my-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Suspense fallback={<ArticleCardSkeletons />}>
            <UserArticles username={username} />
            {usersState.ArticleAmount > 10 && (
              <div className="flex w-full justify-center md:col-start-1 md:col-end-3">
                <Link
                  href={`/${username}/articles`}
                  className="inline-flex w-full max-w-lg items-center justify-center gap-x-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-slate-900 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                >
                  もっと見る
                </Link>
              </div>
            )}
          </Suspense>
        </section>
        <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-gray-50">制作物</h3>
        <section className="my-3 grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <Suspense fallback={<WorkCardSkeletons />}>
            <UserWorks username={username} />
            {usersState.WorkAmount > 10 && (
              <div className="flex w-full justify-center xs:col-start-1 xs:col-end-3 md:col-end-4 lg:col-end-5">
                <Link
                  href={`/${username}/works`}
                  className="inline-flex w-full max-w-lg items-center justify-center gap-x-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-slate-900 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                >
                  もっと見る
                </Link>
              </div>
            )}
          </Suspense>
        </section>
      </Inner>
    </>
  )
}
