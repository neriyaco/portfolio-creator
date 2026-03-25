import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n/i18n-react'
import type { Post } from '../types'

export default function RecentPostsSection() {
  const { LL } = useI18n()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('posts')
      .select('id, slug, title, excerpt, published_at, cover_url')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setPosts((data ?? []) as Post[])
        setLoading(false)
      })
  }, [])

  if (loading || posts.length === 0) return null

  return (
    <section className="w-full mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {LL.blog.recentPosts()}
        </h2>
        <Link to="/blog" className="text-xs text-blue-500 hover:text-blue-700 transition-colors">
          {LL.blog.viewAll()}
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`/blog/${post.slug}`} className="flex items-start gap-3 group">
              {post.cover_url && (
                <img
                  src={post.cover_url}
                  alt=""
                  className="w-14 h-14 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {post.title}
                </p>
                {post.excerpt && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{post.excerpt}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
