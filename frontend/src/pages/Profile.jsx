"use client";
import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar, SidebarBody, SidebarLink } from "../components/sidebar";
import {
  IconBrandTabler,
  IconSettings,
  IconLogout,
  IconMailbox,
  IconHistory,
  IconUserCheck,
  IconSend,
} from "@tabler/icons-react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import ProfileCard from "../components/ProfileCard";
import BoxesBackground from "../components/BoxesBackground";

// ───────────────────────── Animation Helpers ──────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring" } },
};

// ───────────────────────── Component ──────────────────────────
export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selected, setSelectedNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const username = currentUser?.username;
  const totalLikes = 12;
  const totalComments = 34;

  useEffect(() => {
    api
      .get("/api/user/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
        },
      })
      .then((res) => setCurrentUser(res.data))
      .catch((err) => {
        console.error("Failed to fetch user info:", err);
        setCurrentUser(null);
      });
  }, []);

  useEffect(() => {
    api
      .get("/api/notes/")
      .then((res) => setNotes(res.data))
      .catch(() => alert("Error"));
  }, []);

  const create = (e) => {
    e.preventDefault();
    api.post("/api/notes/", { title, content }).then((res) => {
      if (res.status === 201) {
        setNotes((p) => [res.data, ...p]);
        setTitle("");
        setContent("");
      }
    });
  };

  const navLinks = [
    {
      label: "Overview",
      href: "#overview",
      icon: <IconBrandTabler className="h-5 w-5" />,
    },
    {
      label: "Support",
      href: "#Customer-Support",
      icon: <IconSettings className="h-5 w-5" />,
    },
    {
      label: "Logout",
      href: "/logout",
      icon: <IconLogout className="h-5 w-5 text-rose-400" />,
    },
  ];

  return (
    <div className="relative flex min-h-screen bg-[#0b0e14] text-slate-100 overflow-hidden font-sans">
      
      {/* Subtle Background Animation */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <BoxesBackground />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex w-full">
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          className="bg-[#0b0e14]/90 backdrop-blur-xl border-r border-slate-800/80 shadow-2xl"
        >
          <SidebarBody className="flex flex-col justify-between h-full p-6">
            <div>
              <a
                href="/"
                className="flex items-center gap-3 text-xl font-bold text-white group"
              >
                <div className="h-8 w-8 flex items-center justify-center bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-500 transition-colors">
                  <span className="font-serif text-white">F</span>
                </div>
                <span className="tracking-tight">Portal</span>
              </a>
              <div className="mt-10 flex flex-col gap-4">
                {navLinks.map((ln, i) => (
                  <SidebarLink key={i} link={ln} />
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <SidebarLink
                link={{
                  label: currentUser?.username || "Guest User",
                  href: "#",
                  icon: (
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
                      {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  ),
                }}
              />
            </div>
          </SidebarBody>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#0b0e14]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
            <div className="font-bold text-lg text-white">Dashboard</div>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="text-slate-300 hover:text-white p-2 rounded-lg bg-slate-800/50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </header>

          {/* Main Scrollable Section */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-12 xl:px-20 scroll-smooth" id="overview">
            
            <div className="max-w-6xl mx-auto">
              
              {/* Header Greeting */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Welcome back, <span className="text-indigo-400">{currentUser?.username || "User"}</span>
                </h1>
                <p className="text-slate-400 mt-2">Manage your account, view enquiries, and contact support.</p>
              </motion.div>

              {/* Profile Card Area */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-12"
              >
                <ProfileCard
                  username={username}
                  likes={totalLikes}
                  comments={totalComments}
                />
              </motion.div>

              {/* Stats Section */}
              <motion.section
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
              >
                <MetricCard 
                  title="Total Enquiries" 
                  value={notes.length} 
                  icon={<IconMailbox className="w-6 h-6 text-indigo-400" />} 
                />
                <MetricCard
                  title="Activity Status"
                  value={selected ? "Reviewing" : "Active"}
                  icon={<IconHistory className="w-6 h-6 text-pink-400" />}
                />
                <MetricCard
                  title="Account Level"
                  value="Standard"
                  icon={<IconUserCheck className="w-6 h-6 text-emerald-400" />}
                />
              </motion.section>

              {/* Enquiries Table */}
              <motion.section
                id="activities"
                variants={itemVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="mb-16"
              >
                <SectionHeading text="Previous Enquiries" />

                {notes.length === 0 ? (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <IconMailbox className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">No enquiries yet</h3>
                    <p className="text-slate-400 text-sm">When you contact support, your history will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-900/30 backdrop-blur-xl shadow-xl">
                    <table className="min-w-full divide-y divide-slate-800 text-left">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Reference</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        <AnimatePresence>
                          {notes.map((n) => (
                            <motion.tr
                              key={n.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setSelectedNote(n)}
                              className={`cursor-pointer transition-all duration-200 ${
                                selected?.id === n.id
                                  ? "bg-indigo-600/10 border-l-4 border-indigo-500"
                                  : "bg-transparent hover:bg-slate-800/40 border-l-4 border-transparent"
                              }`}
                            >
                              <td className="px-6 py-4">
                                <p className="text-sm font-medium text-white line-clamp-1">{n.title}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-slate-400 line-clamp-1">{n.content}</p>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap text-right font-mono">
                                {new Date(n.created_at).toLocaleDateString()}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.section>

              {/* Contact Form */}
              <motion.section
                id="Customer-Support"
                variants={itemVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="bg-slate-900/40 border border-slate-700/50 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
              >
                {/* Decorative glow inside form */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                  <SectionHeading text="Customer Support" />
                  <p className="text-slate-400 mb-8 text-sm">Need help with your account or a service? Send us a secure message below.</p>
                  
                  <form onSubmit={create} className="grid gap-6 md:grid-cols-2">
                    <Input
                      label="Subject"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <Textarea
                      label="Message Details"
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!title || !content}
                      className="md:col-span-2 mt-4 flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    >
                      <IconSend className="w-5 h-5" />
                      Submit Enquiry
                    </motion.button>
                  </form>
                </div>
              </motion.section>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ────────── Reusable UI Components ──────────

const MetricCard = ({ title, value, icon }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ y: -5 }}
    className="bg-slate-900/40 border border-slate-700/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl flex flex-col relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110 transform">
      {icon}
    </div>
    <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">
      {title}
    </p>
    <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
  </motion.div>
);

const SectionHeading = ({ text }) => (
  <div className="mb-6 flex items-center gap-3">
    <div className="h-6 w-1.5 bg-indigo-500 rounded-full"></div>
    <h2 className="text-2xl font-bold text-white tracking-tight">{text}</h2>
  </div>
);

const Input = ({ label, id, value, onChange }) => (
  <div className="flex flex-col gap-2 md:col-span-2">
    <label htmlFor={id} className="text-sm font-semibold text-slate-300">
      {label}
    </label>
    <input
      id={id}
      value={value}
      onChange={onChange}
      required
      className="rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600 transition-all"
      placeholder="Brief title for your enquiry..."
    />
  </div>
);

const Textarea = ({ label, id, value, onChange }) => (
  <div className="flex flex-col gap-2 md:col-span-2">
    <label htmlFor={id} className="text-sm font-semibold text-slate-300">
      {label}
    </label>
    <textarea
      id={id}
      rows="5"
      value={value}
      onChange={onChange}
      required
      className="rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600 resize-none transition-all"
      placeholder="How can we help you today?"
    />
  </div>
);
