import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function PostsGrid({
  posts = [],
  page = 1,
  postsPerPage = 6,
  loading = false,
  error = null,
  onPrev = () => {},
  onNext = () => {},
}) {
  const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage));
  const current = posts.slice((page - 1) * postsPerPage, page * postsPerPage);

  // 1. Grid Skeleton Loader
  if (loading) {
    return (
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-96 bg-slate-900/40 border border-slate-800 rounded-xl animate-pulse p-6 flex flex-col">
            <div className="h-4 bg-slate-800 rounded w-1/4 mb-6"></div>
            <div className="h-8 bg-slate-800 rounded w-full mb-3"></div>
            <div className="h-8 bg-slate-800 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-slate-800 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-full mb-2"></div>
            <div className="mt-auto h-4 bg-slate-800 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <p className="text-center text-rose-500 font-mono py-12 text-sm">{error}</p>;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {current.map(({ id, title, tag, snippet, image, created, created_at }) => (
            <motion.article
              key={id}
              className="group bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-slate-600 hover:bg-slate-900/80 transition-all duration-300 flex flex-col"
              whileHover={{ y: -4 }}
            >
              <Link to={`/blog/${id}`} className="flex flex-col h-full">
                {image && (
                  <div className="overflow-hidden h-48 border-b border-slate-800">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded border border-indigo-500/20">
                      {tag || "Insight"}
                    </span>
                    <span className="text-slate-500 font-mono text-xs">
                      {new Date(created_at || created).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  
                  {/* Added font-serif here */}
                  <h2 className="text-xl font-serif font-bold mb-3 leading-snug text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {title}
                  </h2>
                  
                  {snippet && (
                    <p className="text-slate-400 text-sm mb-6 line-clamp-3 font-light flex-grow">
                      {snippet}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                    {/* Added Analyst Byline */}
                    <span className="text-[11px] text-slate-500 font-medium">By Francisco • 4 Min Read</span>
                    <div className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                      <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {posts.length > postsPerPage && (
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-800">
          <button
            onClick={onPrev}
            disabled={page === 1}
            className={`px-6 py-2 text-xs uppercase tracking-widest font-bold rounded transition-colors ${
              page === 1
                ? "bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed"
                : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white shadow-sm"
            }`}
          >
            ← Prev
          </button>

          <span className="text-slate-500 font-mono text-xs uppercase tracking-widest">
            Page <span className="text-slate-200">{page}</span> / {totalPages}
          </span>

          <button
            onClick={onNext}
            disabled={page === totalPages}
            className={`px-6 py-2 text-xs uppercase tracking-widest font-bold rounded transition-colors ${
              page === totalPages
                ? "bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed"
                : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white shadow-sm"
            }`}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}
