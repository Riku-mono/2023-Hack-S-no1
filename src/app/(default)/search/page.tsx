import SearchArticles from '@/components/Article/searchArticles'
import Inner from '@/components/Inner'
import Pagination from '@/components/Pagination'
import { ArticleCardSkeletons, WorkCardSkeletons } from '@/components/Skeleton/skeletons'
import SortBtn from '@/components/SortBtn'
import SearchTags from '@/components/Tag/searchTags'
import SearchUsers from '@/components/User/searchUsers'
import SearchWorks from '@/components/Work/searchWorks'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: {
    q?: string
    target?: 'articles' | 'works' | 'users' | 'tags' | undefined
    page?: string
    sort?: 'new' | 'old' | undefined
  }
}) {
  const searchWord = decodeURIComponent(searchParams?.q || '')
  let searchArticlesParams = {
    q: searchWord,
    page: searchParams?.page,
    sort: searchParams?.sort,
  }
  let searchWorkParams = {
    q: searchWord,
    page: searchParams?.page,
    sort: searchParams?.sort,
  }

  const searchRedirect = async (formData: FormData) => {
    'use server'
    const searchWord = formData.get('search')
    if (!searchWord) return
    const encodedSearchWord = encodeURIComponent(searchWord as string)
    let url = `/search?q=${encodedSearchWord}`
    const target = formData.get('target') || 'articles'
    const sort = searchParams?.sort || 'new'
    if (target !== 'articles') url += `&target=${target}`
    if (sort !== 'new') url += `&sort=${sort}`
    redirect(url)
  }

  let articlesAmount = await prisma.article.count({
    where: {
      OR: [
        {
          title: {
            contains: searchParams?.q,
          },
        },
        {
          tags: {
            some: {
              name: {
                contains: searchParams?.q,
              },
            },
          },
        },
        {
          author: {
            name: {
              contains: searchParams?.q,
            },
          },
        },
      ],
      visibility: true,
    },
  })
  let worksAmount = await prisma.work.count({
    where: {
      title: {
        contains: searchWord,
      },
      visibility: true,
    },
  })
  let usersAmount = await prisma.user.count({
    where: {
      OR: [
        {
          name: {
            contains: searchWord,
          },
        },
        {
          displayName: {
            contains: searchWord,
          },
        },
      ],
    },
  })
  let tagsAmount = await prisma.tag.count({
    where: {
      name: {
        contains: searchWord,
        mode: 'insensitive',
      },
    },
  })

  let targets = [
    {
      name: 'articles',
      amount: articlesAmount,
      isActive: searchParams?.target === 'articles' || !searchParams?.target ? true : false,
    },
    {
      name: 'works',
      amount: worksAmount,
      isActive: searchParams?.target === 'works' ? true : false,
    },
    {
      name: 'users',
      amount: usersAmount,
      isActive: searchParams?.target === 'users' ? true : false,
    },
    {
      name: 'tags',
      amount: tagsAmount,
      isActive: searchParams?.target === 'tags' ? true : false,
    },
  ]
  const calculateItemsOnPage = ({ amount, page = 1 }: { amount: number; page?: number }) => {
    page = page || 1
    const lowerBound = 10 * (page - 1)
    const upperBound = 10 * page
    if (page <= 0 || amount <= lowerBound) return 0
    return amount < upperBound ? amount - lowerBound : 10
  }

  return (
    <>
      <Inner>
        <nav className="mb-3 flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 rtl:space-x-reverse md:space-x-2">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  className="me-2.5 h-3 w-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                </svg>
                Home
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg
                  className="mx-1 h-3 w-3 text-gray-400 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                  Search
                </span>
              </div>
            </li>
          </ol>
        </nav>
        <header>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-50">Search</h2>
          <div className="col-span-full">
            <form action={searchRedirect} className="mt-2">
              <div className="relative w-full">
                <input type="hidden" name="target" value={searchParams?.target} />
                <input
                  type="text"
                  className="w-full rounded-md border bg-white py-2 pl-10 pr-4 placeholder-gray-400 focus:outline-none dark:border-gray-700 dark:bg-slate-800 dark:text-gray-200"
                  placeholder="検索"
                  name="search"
                  defaultValue={searchParams?.q}
                />
                <div className="absolute left-0 top-0 ml-4 mt-[0.7rem]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-4 w-4 text-gray-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </div>
              </div>
            </form>
            {searchParams?.q && (
              <>
                <h3 className="my-4 text-xl font-bold text-gray-800 dark:text-gray-50">
                  &#34;{searchParams?.q}&#34; の検索結果
                </h3>
                <nav className="mb-3 flex flex-wrap justify-between gap-y-2">
                  <ul className="flex flex-wrap items-center gap-2">
                    {targets.map((target) => (
                      <li key={target.name} className="m-0 list-none">
                        <Link
                          href={
                            target.isActive
                              ? ''
                              : `/search?q=${searchWord}&target=${target.name}${
                                  (searchParams?.sort && `&sort=${searchParams?.sort}`) || ''
                                }`
                          }
                          className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium dark:border-gray-700 ${
                            target.isActive
                              ? 'bg-sky-700 text-white'
                              : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-200'
                          }`}
                        >
                          {target.name === 'articles' && '記事'}
                          {target.name === 'works' && '成果物'}
                          {target.name === 'users' && 'ユーザー'}
                          {target.name === 'tags' && 'タグ'}
                          <span className="ml-1 inline-block rounded-md bg-gray-300 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-500 dark:text-gray-100">
                            {target.amount}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {!targets[2].isActive && <SortBtn sort={searchParams?.sort || 'new'} />}
                </nav>
              </>
            )}
          </div>
        </header>
        {searchParams?.q && (
          <>
            {targets[0].isActive && (
              <>
                <main className="my-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Suspense
                    fallback={
                      <ArticleCardSkeletons
                        amount={calculateItemsOnPage({
                          amount: articlesAmount,
                          page: Number(searchParams?.page),
                        })}
                      />
                    }
                  >
                    <SearchArticles searchParams={searchArticlesParams} />
                    {articlesAmount > 10 && (
                      <div className="flex w-full justify-center md:col-start-1 md:col-end-3">
                        <Pagination totalPages={Math.ceil(articlesAmount / 10)} />
                      </div>
                    )}
                  </Suspense>
                </main>
              </>
            )}
            {targets[1].isActive && (
              <>
                <main className="my-3 grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  <Suspense
                    fallback={
                      <WorkCardSkeletons
                        amount={calculateItemsOnPage({
                          amount: worksAmount,
                          page: Number(searchParams?.page),
                        })}
                      />
                    }
                  >
                    <SearchWorks searchParams={searchWorkParams} />
                    {worksAmount > 10 && (
                      <div className="flex w-full justify-center md:col-start-1 md:col-end-5">
                        <Pagination totalPages={Math.ceil(worksAmount / 10)} />
                      </div>
                    )}
                  </Suspense>
                </main>
              </>
            )}
            {targets[2].isActive && (
              <>
                <main className="relative my-3">
                  <SearchUsers searchParams={searchParams} />
                </main>
              </>
            )}
            {targets[3].isActive && (
              <>
                <main className="relative my-3 flex flex-col gap-y-2">
                  <SearchTags searchParams={searchParams} />
                </main>
              </>
            )}
          </>
        )}
      </Inner>
    </>
  )
}
