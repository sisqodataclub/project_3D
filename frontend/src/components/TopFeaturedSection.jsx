import React from "react";
import { Link } from "react-router-dom";

export default function TopFeaturedSection({ posts, loading, error }) {
  if (loading || error || posts.length === 0) return null;

  // The very latest post is our "Hero"
  const heroPost = posts[0];
  // The next 3 are our "Quick Read" side-bar
  const sidebarPosts = posts.slice(1, 4);

  return (
    <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      {/* LEFT: Hero Article (The "Breaking News") */}
      <div className="lg:col-span-8 group">
        <Link to={`/blog/${heroPost.id}`} className="block relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all">
          {heroPost.image && (
            <div className="overflow-hidden">
              <img
                src={heroPost.image}
                alt={heroPost.title}
                className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          )}
          <div className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded border border-indigo-500/20">
                {heroPost.tag || "Market Report"}
              </span>
              <span className="text-slate-500 text-xs">
                {new Date(heroPost.created_at || heroPost.created).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white group-hover:text-indigo-300 transition-colors tracking-tight">
              {heroPost.title}
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed line-clamp-3 mb-6 font-light">
              {heroPost.snippet}
            </p>
            <div className="flex items-center text-indigo-400 font-semibold text-sm">
              Full Analysis <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>
        </Link>
      </div>

      {/* RIGHT: Sidebar (The "Top Stories") */}
      <div className="lg:col-span-4 flex flex-col">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-2">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">
            Top Intelligence
          </h2>
          <div className="h-1 w-12 bg-indigo-600"></div>
        </div>

        <div className="space-y-8">
          {sidebarPosts.map((post) => (
            <article key={post.id} className="group cursor-pointer border-b border-slate-800/50 pb-6 last:border-0">
              <Link to={`/blog/${post.id}`} className="flex gap-4">
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-500 mb-1 block tracking-wider">
                    {post.tag || "Economy"}
                  </span>
                  <h3 className="font-bold text-lg text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-2 font-mono">
                    {new Date(post.created_at || post.created).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                {post.image && (
                  <div className="w-20 h-20 shrink-0">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover rounded shadow-lg grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                )}
              </Link>
            </article>
          ))}
        </div>
        
        {/* Optional "Economic Data" Widget placeholder */}
        <div className="mt-auto p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-lg">
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Live Insight</p>
            <p className="text-xs text-slate-400 italic italic">UK Inflation data successfully synced via Automated Pipeline.</p>
        </div>
      </div>
    </div>
  );
}
