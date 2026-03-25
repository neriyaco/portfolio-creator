import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Post } from '../types'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setPost(data as Post)
        setLoading(false)
      })
  }, [slug])

  useEffect(() => {
    if (post?.title) document.title = post.title
  }, [post])

  if (loading) {
    return (
      <main className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-24 mb-10" />
          <div className="h-52 bg-gray-100 rounded-xl mb-8" />
          <div className="h-8 bg-gray-100 rounded w-3/4 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}
          </div>
        </div>
      </main>
    )
  }

  if (notFound || !post) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl font-bold text-gray-200 mb-4">404</p>
          <p className="text-gray-500 mb-6">Post not found.</p>
          <Link to="/blog" className="text-sm text-blue-600 hover:underline">← All posts</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/blog" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          ← All posts
        </Link>

        {post.cover_url && (
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-64 object-cover rounded-xl mt-8 mb-8"
          />
        )}

        <div className={post.cover_url ? '' : 'mt-8'}>
          {post.published_at && (
            <time
              dateTime={post.published_at}
              className="text-xs text-gray-400 block mb-3"
            >
              {new Date(post.published_at).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </time>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">{post.title}</h1>
        </div>

        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </main>
  )
}
