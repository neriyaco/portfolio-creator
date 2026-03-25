import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n/i18n-react'
import type { Post } from '../types'

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { LL } = useI18n()

  useEffect(() => {
    supabase
      .from('posts')
      .select('id, slug, title, excerpt, cover_url, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data as Post[])
        setLoading(false)
      })
  }, [])

  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            {LL.blog.backToPortfolio()}
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-10">{LL.blog.title()}</h1>

        {loading ? (
          <div className="flex flex-col gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-100 rounded-xl mb-4" />
                <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-full mb-1" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-400">{LL.blog.noPosts()}</p>
        ) : (
          <div className="flex flex-col gap-12">
            {posts.map((post) => (
              <article key={post.id}>
                {post.cover_url && (
                  <Link to={`/blog/${post.slug}`}>
                    <img
                      src={post.cover_url}
                      alt={post.title}
                      className="w-full h-52 object-cover rounded-xl mb-4"
                    />
                  </Link>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  {post.published_at && (
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </time>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  <Link to={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 leading-relaxed mb-3">{post.excerpt}</p>
                )}
                <Link
                  to={`/blog/${post.slug}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {LL.blog.readMore()}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
