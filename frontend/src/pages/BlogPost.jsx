import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown"; // 🌟 ADDED IMPORT
import api from "../api";
import CommentBox from "../components/CommentBox";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" } })
};

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoad] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/api/blogs/${id}/`)
       .then(res => { setPost(res.data); setLoad(false); })
       .catch(() => { setError("Market Report not found or has been archived."); setLoad(false); });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0b0e14] px-4 sm:px-6 lg:px-32 py-24 max-w-5xl mx-auto">
      <div className="animate-pulse">
        <div className="h-4 w-24 bg-slate-800 rounded mb-8"></div>
        <div className="h-12 w-3/4 bg-slate-800 rounded mb-4"></div>
        <div className="h-12 w-1/2 bg-slate-800 rounded mb-8"></div>
        <div className="h-4 w-64 bg-slate-800 rounded mb-12"></div>
        <div className="h-[400px] w-full bg-slate-900 border border-slate-800 rounded-xl mb-12"></div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          <div className="h-4 bg-slate-800 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );

  if (error || !post) return (
    <div className="min-h-screen bg-[#0b0e14] py-32 text-center flex flex-col items-center justify-center">
      <p className="text-rose-500 font-mono mb-6 uppercase tracking-widest text-sm">{error || "Data Retrieval Error"}</p>
      <button onClick={() => navigate(-1)}
              className="px-6 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded uppercase tracking-widest text-xs font-bold transition-colors">
        ← Return to Terminal
      </button>
    </div>
  );

  const { title, tag, image, author, created, created_at, blocks = [] } = post;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 px-4 sm:px-6 lg:px-32 py-16 max-w-5xl mx-auto selection:bg-indigo-500/30">
      
      <Helmet>
        <title>{title} | Economic News</title>
        <meta name="description" content={blocks[0]?.text?.substring(0, 150) || "Read the latest market report."} />
        {image && <meta property="og:image" content={image} />}
      </Helmet>

      <div className="mb-12 border-b border-slate-800 pb-4">
        <Link to="/blog" className="text-xs font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-[0.2em] transition-colors">
          ← Return to Newsfeed
        </Link>
      </div>

      <header className="mb-12">
        <div className="mb-6">
          <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded border border-indigo-500/20">
            {tag || "Market Report"}
          </span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-slate-100 leading-[1.1] mb-6">
          {title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold font-sans">
              {(author || "F")[0].toUpperCase()}
            </span>
            <span className="font-medium text-slate-300">By {author || "Francisco"}</span>
          </div>
          <span>•</span>
          <span className="uppercase tracking-widest text-indigo-400">Lead Economist</span>
          <span>•</span>
          <span>{new Date(created_at || created).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </motion.div>
      </header>

      {image && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-900"
        >
          <img src={image} alt={title} className="w-full h-auto max-h-[500px] object-cover" />
          <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest text-right">
            File Photo / Francis Codes
          </div>
        </motion.div>
      )}

      <article className="max-w-3xl mx-auto">
        {blocks.map((blk, i) => (
          <motion.section key={blk.id || `fallback-${i}`}
            className="mb-10"
            variants={fadeUp} initial="hidden" whileInView="show"
            custom={i} viewport={{ once: true, amount: 0.1 }}>

            {blk.image && (
              <div className="my-8 rounded-lg overflow-hidden border border-slate-800">
                <img src={blk.image} alt={`figure-${i}`} className="w-full h-auto object-cover" />
              </div>
            )}

            {/* 🌟 REPLACED RAW TEXT WITH REACT-MARKDOWN */}
            <ReactMarkdown
              components={{
                // Standard Paragraphs
                p: ({node, ...props}) => <p className="font-serif text-lg md:text-xl text-slate-300 leading-relaxed font-light mb-6" {...props} />,
                
                // Blockquotes (Use > in Django)
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-6 sm:pl-8 my-8 py-2 font-serif italic text-xl md:text-2xl text-slate-300 leading-relaxed bg-slate-900/30 rounded-r-lg" {...props} />,
                
                // Bulleted Lists (Use - or * in Django)
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 text-slate-300 font-serif text-lg md:text-xl space-y-2 marker:text-indigo-500" {...props} />,
                
                // Numbered Lists (Use 1. 2. 3. in Django)
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 text-slate-300 font-serif text-lg md:text-xl space-y-2 marker:text-indigo-500" {...props} />,
                
                // Bold text (Use **text** in Django)
                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                
                // Headers (Use ## in Django)
                h2: ({node, ...props}) => <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-12 mb-6" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-8 mb-4" {...props} />,
              }}
            >
              {blk.text}
            </ReactMarkdown>

          </motion.section>
        ))}
      </article>

      <div className="max-w-3xl mx-auto mt-20 pt-10 border-t border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">Analyst Discussion</h3>
        <CommentBox blogId={id} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="mt-24 pt-8 border-t border-slate-800 text-xs font-mono text-slate-600 text-center uppercase tracking-widest">
        © {new Date().getFullYear()} Francis Codes. Data sourced via Automated Pipeline.
      </motion.div>
    </div>
  );
}
