import React from "react";
import { Link } from "react-router-dom";

export default function TopFeaturedSection({ posts, loading, error }) {
  // 1. The Pulse Skeleton (Shows while fetching data)
  if (loading) {
    return (
      <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
        <div className="lg:col-span-8 bg-slate-900/50 border border-slate-800 rounded-xl h-[500px]"></div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="h-6 w-1/2 bg-slate-800 rounded mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-900/50 border border-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || posts.length === 0) return null;

  const heroPost = posts[0];
  const sidebarPosts = posts.slice(1, 4);

  return (
    <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      {/* LEFT: Hero Article (The "Breaking News") */}
      <div className="lg:col-span-8 group">
        <Link to={`/blog/${heroPost.id}`} className="block relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all">
          {heroPost.image && (
            <div className="overflow-hidden border-b border-slate-800">
              <img
                src={heroPost.image}
                alt={heroPost.title}
                className="w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          )}
          <div className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded border border-indigo-500/20">
                {heroPost.tag || "Market Report"}
              </span>
              <span className="text-slate-500 text-xs font-mono">
                {new Date(heroPost.created_at || heroPost.created).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            {/* Added font-serif for editorial authority */}
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-slate-100 group-hover:text-indigo-300 transition-colors tracking-tight leading-tight">
              {heroPost.title}
            </h2>
            
            <p className="text-slate-400 text-lg leading-relaxed line-clamp-3 mb-6 font-light">
              {heroPost.snippet}
            </p>
            
            <div className="flex items-center justify-between border-t border-slate-800/50 pt-4">
              {/* Added Analyst Byline */}
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-300">By Francisco</span> • Lead Economist • 5 Min Read
              </div>
              <div className="flex items-center text-indigo-400 font-bold text-xs uppercase tracking-widest">
                Full Analysis <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* RIGHT: Sidebar (Top Stories & Newsletter) */}
      <div className="lg:col-span-4 flex flex-col">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-2">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">
            Top Intelligence
          </h2>
          <div className="h-1 w-12 bg-indigo-600"></div>
        </div>

        <div className="space-y-6 flex-grow">
          {sidebarPosts.map((post) => (
            <article key={post.id} className="group cursor-pointer border-b border-slate-800/50 pb-6 last:border-0">
              <Link to={`/blog/${post.id}`} className="flex gap-4">
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-500 mb-2 block tracking-wider">
                    {post.tag || "Economy"}
                  </span>
                  {/* Added font-serif */}
                  <h3 className="font-serif font-bold text-lg text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="text-slate-500 text-[11px] mt-2 flex items-center gap-2">
                    <span className="font-medium text-slate-400">Francisco</span>
                    <span>•</span>
                    <span className="font-mono">{new Date(post.created_at || post.created).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
        
        {/* The Morning Briefing Newsletter Capture */}
        <div className="mt-8 p-6 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-400"></div>
          <h3 className="text-lg font-serif font-bold mb-2 text-slate-100">The Daily Ledger</h3>
          <p className="text-slate-400 text-sm mb-5 font-light leading-relaxed">
            Get macro-economic analysis and UK inflation updates delivered to your inbox before the London open.
          </p>
          <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Corporate email address" 
              className="bg-black/50 text-slate-100 placeholder-slate-600 text-sm px-4 py-3 rounded border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors" 
              required
            />
            <button className="bg-indigo-600 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest rounded hover:bg-indigo-500 transition-colors shadow-lg">
              Subscribe Free
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
