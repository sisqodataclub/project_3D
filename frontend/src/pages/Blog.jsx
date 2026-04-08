import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import PostsGrid from "../components/PostsGrid";
import TopFeaturedSection from "../components/TopFeaturedSection";
import AnimatedHeadline from "../components/AnimatedHeadline";
import MarketTicker from "../components/MarketTicker"; 

const POSTS_PER_PAGE = 6;

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/blogs/");
      const dataArray = res.data.results ? res.data.results : res.data;
      
      const sortedPosts = dataArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPosts(sortedPosts);
    } catch (err) {
      setError("Market data feed unavailable");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 font-sans">
      <MarketTicker />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <header className="border-b border-slate-800 pb-8 mb-12">
          <AnimatedHeadline title="The Economic Ledger" />
          <p className="text-slate-400 uppercase tracking-widest text-xs mt-2">
            Real-time Insights • {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-8">
             <TopFeaturedSection posts={posts.slice(0, 1)} loading={loading} error={error} />
          </div>

          <div className="lg:col-span-4 border-l border-slate-800 pl-8 hidden lg:block">
            <h3 className="text-indigo-400 font-bold uppercase text-sm mb-4 tracking-tighter">Latest Updates</h3>
            <div className="space-y-6">
              {posts.slice(1, 4).map(post => (
                <Link to={`/blog/${post.id}`} key={post.id} className="group block cursor-pointer">
                  <span className="text-xs text-slate-500">{post.tag}</span>
                  <h4 className="text-md font-semibold group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <section className="pt-8 border-t border-slate-800">
           <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Market Analysis</h2>
              <div className="text-xs text-slate-500 uppercase tracking-widest">Page {page} of {Math.ceil(posts.length/POSTS_PER_PAGE) || 1}</div>
           </div>

           <PostsGrid
             posts={posts}
             page={page}
             postsPerPage={POSTS_PER_PAGE}
             loading={loading}
             error={error}
             onPrev={() => setPage(p => Math.max(p - 1, 1))}
             onNext={() => setPage(p => p + 1)}
           />
        </section>
      </main>
    </div>
  );
}
