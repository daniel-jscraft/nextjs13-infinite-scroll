'use client'

import { useInfiniteQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useRef, useEffect } from "react"

const fetchData = async (page) => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=27&_page=' + page)
  const posts = (await response.json())
  return posts;
}

const queryClient = new QueryClient();

const MyComponent = ()=> {
  const myRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(()=> {
    const observer = new IntersectionObserver( (entries) => {
        entries.forEach((entry)=> {
            console.log("is on screen = " + entry.isIntersecting)
        });
    });
    if (myRef.current) observer.observe(myRef.current)
  }, [myRef])

  const {data, fetchNextPage, isFetchingNextPage} = useInfiniteQuery(
    ['query'], 
    async ({pageParam = 1}) => {
      const response = await fetchData(pageParam)
      return response
    }, 
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1
      }
    }
  )

  const loadMoreBtnText = ()=> {
    if (isFetchingNextPage) {
      return '⏳ Fetching posts'
    }
    let lastPage = data?.pages[data?.pages.length-1]
    if(!lastPage?.length) {
      return 'Nothing left to load'
    }
    return 'Load more'
  }

  return <>
    <h1>📖 Post list</h1>
    <ol>
      {data?.pages.map((page, i)=> (
        <span key={i}>
          {page.map(p => <li key={p.id}>{p.title}</li>)}
        </span>
      ))}
    </ol>
    <button 
      ref={myRef}
      onClick={() => fetchNextPage()}
      disabled={isFetchingNextPage}>
        {loadMoreBtnText()}
    </button>
  </>
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
        <MyComponent />
    </QueryClientProvider>
  )
}
