import python from "../assets/python.png";
import sql from "../assets/sql.png";



import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  typescript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  docker,
  meta,
  starbucks,
  tesla,
  shopify,
  carrent,
  jobit,
  tripguide,
  threejs,

} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "wor",
    title: "Work",
  },

  {
    id: "feedbacks",
    title: "Feedbacks",
  },


  {
    id: "contact",
    title: "Contact",
  },

  

  {
    id: "https://github.com/sisqodataclub",
    title: "Github",
    external: true, 
  },

  {
    id: "/blog",
    title: "Blog",
    external: false, // or simply remove this line
    internal: true   // optional, for clarity
  },

  {
    id: "/logout",
    title: "Logout",
    external: false, // or simply remove this line
    internal: true   // optional, for clarity
  },

  {
    id: "/login",
    title: "Login/Register",
    external: false, // or simply remove this line
    internal: true   // optional, for clarity
  },

  
{
  id: "/profile",
  title: "Profile",
  external: false, // or simply remove this line
  internal: true   // optional, for clarity
}
  


];



const services = [
  {
    title: "High-Converting Websites",
    description: "Lightning-fast, SEO-friendly digital storefronts built to capture traffic and drive real sales while you sleep.",
    icon: web, // Keep your existing icon
  },
  {
    title: "BI & Analytics Dashboards",
    description: "Custom, easy-to-read data hubs that track your traffic, leads, and profit margins. Giving you a true CEO-level overview.",
    icon: mobile, 
  },
  {
    title: "Automated Payment Systems",
    description: "Seamless, secure Stripe checkout and booking systems that reduce friction and make getting paid effortless.",
    icon: backend, 
  },
  {
    title: "Autopilot Operations & CRM", // 🌟 NEW: The "Pilot Mode" closer
    description: "Automated lead capture, email follow-ups, and customer management. We handle the admin so you can focus entirely on your craft.",
    icon: backend, // Update with a suitable icon like a gear or robot
  },
  {
    title: "Market & Competitor Research",
    description: "Deep data insights to position your brand perfectly, find hidden opportunities, and capture market share faster.",
    icon: creator, 
  },
  {
    title: "Technical Growth Partnership", // 🌟 TWEAKED: Sounds more like a permanent business system than just "consulting"
    description: "We don't just build and leave. We guide your digital strategy, acting as your technical team so you can run your business in pilot mode.",
    icon: creator, 
  },
];








const technologies = [
  {
    name: "Python",
    icon: python,
  },
  {
    name: "SQL",
    icon: sql,
  },
  {
    name: "Three JS",
    icon: threejs,
  },
  {
    name: "git",
    icon: git,
  },
  {
    name: "Html/Css",
    icon: html,
  },
  {
    name: "docker",
    icon: docker,
  },
];

const experiences = [
  {
    title: "React.js Developer",
    company_name: "Starbucks",
    icon: starbucks,
    iconBg: "#383E56",
    date: "March 2020 - April 2021",
    points: [
      "Developing and maintaining web applications using React.js and other related technologies.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Participating in code reviews and providing constructive feedback to other developers.",
    ],
  },
  {
    title: "React Native Developer",
    company_name: "Tesla",
    icon: tesla,
    iconBg: "#E6DEDD",
    date: "Jan 2021 - Feb 2022",
    points: [
      "Developing and maintaining web applications using React.js and other related technologies.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Participating in code reviews and providing constructive feedback to other developers.",
    ],
  },
  {
    title: "Web Developer",
    company_name: "Shopify",
    icon: shopify,
    iconBg: "#383E56",
    date: "Jan 2022 - Jan 2023",
    points: [
      "Developing and maintaining web applications using React.js and other related technologies.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Participating in code reviews and providing constructive feedback to other developers.",
    ],
  },
  {
    title: "Full stack Developer",
    company_name: "Meta",
    icon: meta,
    iconBg: "#E6DEDD",
    date: "Jan 2023 - Present",
    points: [
      "Developing and maintaining web applications using React.js and other related technologies.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Participating in code reviews and providing constructive feedback to other developers.",
    ],
  },
];





const testimonials = [
  {
    testimonial:
      "Francis didn't just build us a highly converting website; he integrated a powerful custom dashboard. Having our business analytics and financial data visualized in real-time has completely changed how I manage our daily operations and commercial contracts.",
    name: "Dennis",
    designation: "OWNER",
    company: "DDeep Cleaning Services",
    image: "https://randomuser.me/api/portraits/men/32.jpg", 
  },
  {
    testimonial:
      "Working with Francis was incredible. He delivered a stunning e-commerce platform for our luxury fragrance brand, but the real game-changer was the bespoke backend dashboard. Being able to track our financial data and business analytics seamlessly has been vital for our growth.",
    name: "Hiba",
    designation: "FOUNDER",
    company: "Equiva Iconic",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    testimonial:
      "Francis helped me launch my business from the ground up. Beyond a beautiful website, the integrated analytics dashboard he provided gives me instant clarity on my revenue streams, financial data, and overall market performance.",
    name: "Lisa",
    designation: "CTO",
    company: "COMPLEX PROPERTIES",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
  },
];



const projects = [
  {
    name: "Uk Live Data",
    category: "Dashboards",
    description:
      "A live economic dashboard powered by publicly available datasets from the ONS and other UK government agencies. Tracks key indicators—GDP, inflation, employment—to deliver real‑time insights into the country’s economic health.",
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "Postgress", color: "green-text-gradient" },
      { name: "tailwind", color: "pink-text-gradient" },
      { name: "Airflow", color: "orange-text-gradient" },
      { name: "dbt", color: "purple-text-gradient" },
      { name: "Django", color: "red-text-gradient" },
      { name: "apache-superset", color: "teal-text-gradient" },
    ],
    image: "https://api.microlink.io/?url=https://www.franciscodes.com/uklive&screenshot=true&meta=false&embed=screenshot.url",
    source_code_link: "https://www.franciscodes.com/uklive",
  },

  {
    name: "Customer Conversion Funnel",
    category: "Dashboards",
    description:
      "An advanced analytics dashboard for GA4 eCommerce data. Uses BigQuery to model and visualise customer conversion funnels, helping teams optimise marketing spend and on‑site performance.",
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "BigQuery", color: "green-text-gradient" },
      { name: "tailwind", color: "pink-text-gradient" },
      { name: "Airflow", color: "orange-text-gradient" },
      { name: "dbt", color: "purple-text-gradient" },
      { name: "Django", color: "red-text-gradient" },
      { name: "apache-superset", color: "teal-text-gradient" },
    ],
    image: "https://api.microlink.io/?url=https://www.franciscodes.com/conversion&screenshot=true&meta=false&embed=screenshot.url",
    source_code_link: "https://www.franciscodes.com/conversion",
  },

  {
    name: "Market Research Blogs",
    category: "Blogs",
    description:
      "A collection of in‑depth economic and financial analytical posts. Features data‑driven narratives, market commentary, and research‑backed insights into current UK and global economic trends.",
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "postgress", color: "green-text-gradient" },
      { name: "tailwind", color: "orange-text-gradient" },
    ],
    image: "https://api.microlink.io/?url=https://www.franciscodes.com/dashboard&screenshot=true&meta=false&embed=screenshot.url",
    source_code_link: "https://www.franciscodes.com/dashboard",
  },

  {
    name: "Equiva Iconic",
    category: "Websites",
    description:
      "A full-stack e-commerce platform for a luxury fragrance brand. Features a high-performance UI designed to highlight their Extrait de Parfum. Architected end-to-end, containerized with Docker, and deployed independently on a custom-hosted VPS.",
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "postgres", color: "green-text-gradient" },
      { name: "docker", color: "orange-text-gradient" },
      { name: "stripe", color: "red-text-gradient" },
    ],
    image: "https://api.microlink.io/?url=https://www.equivaiconic.co.uk&screenshot=true&meta=false&embed=screenshot.url",
    source_code_link: "https://www.equivaiconic.co.uk/",
  },

  {
    name: "DDeep Cleaning Services",
    category: "Websites",
    description:
      "A full-stack lead-generation application for an expert cleaning service across Manchester & Liverpool. Engineered to convert high-value commercial clients, fully containerized, and deployed to a self-managed VPS for maximum uptime.",
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "tailwind", color: "pink-text-gradient" },
      { name: "docker", color: "orange-text-gradient" },
      { name: "framer-motion", color: "green-text-gradient" },
    ],
    image: "https://api.microlink.io/?url=https://www.ddeepcleaningservices.com/&screenshot=true&meta=false&embed=screenshot.url",
    source_code_link: "https://www.ddeepcleaningservices.com/",
  },

  {
    name: "Enterprise Analytics Dashboard",
    category: "Dashboards",
    description:
      "A highly scalable, multi-tenant B2B analytics portal featuring live business metrics, secure role-based access, and deep data visualizations.",
    tags: [
      { name: "react-vite", color: "blue-text-gradient" },
      { name: "django-api", color: "green-text-gradient" },
      { name: "apache-superset", color: "pink-text-gradient" },
    ],
    image: "https://api.microlink.io/?url=https://dcs.franciscodes.com&screenshot=true&meta=false&embed=screenshot.url",
    source_code_link: "https://dcs.franciscodes.com/",
  },

  {
    name: "Data Overview",
    category: "Data Science",
    description:
      "Data Overview: Summarize and Preview Your Dataset Like a Pro...",
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "django", color: "green-text-gradient" },
      { name: "dataoverview", color: "pink-text-gradient" },
    ],
    image: jobit,   // Keep your existing import
    source_code_link: "https://github.com/sisqodataclub/ml-ds/blob/e1881098af0298f8b932c7b066e5cb75214c0233/Data_Overview.ipynb/",
  }
];





export { services, technologies, experiences, testimonials, projects };

export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh"


export const PRICES = {
  // ⭐ Standard Areas
  "Living Room": 25,
  "Bedroom": 20, // base (non-sized)
  "En-Suite": 25,
  "Extra Room": 20,
  "Dining Room": 20,
  "Bathroom": 25,
  "Separate Toilet": 10,
  "Kitchen": 20, // base (non-sized)
  "Staircases": 15,
  "Conservatory": 25,
  "Hallway": 10,
  "Porch": 10,
  "Balcony": 15,
  "Built-in Wardrobe": 15,

  // ⭐ Size-Based Areas (requested)
  "Kitchen_Small": 40,
  "Kitchen_Medium": 55,
  "Kitchen_Large": 70,

  "Bedroom_Small": 20,
  "Bedroom_Medium": 25,
  "Bedroom_Large": 30,

  // ⭐ Appliances
  fridge_freezer: 15,
  fridge: 10,
  freezer: 10,
  american_fridge: 20,
  built_in_single_oven: 40,
  built_in_double_oven: 45,
  freestanding_single_cooker: 45,
  freestanding_double_cooker: 50,
  range_cooker: 70,
  microwave: 10,
  washing_machine: 10,
  dishwasher: 10,
  hob: 15,
  extractor_hood: 15,

  // ⭐ Carpets
  carpet_bedroom: 20,
  carpet_living: 25,
  carpet_dining: 20,
  carpet_hallway: 15,
  carpet_landing: 15,
  carpet_stairs: 20,

  // ⭐ Rugs
  rug_small: 20,
  rug_medium: 35,
  rug_large: 40,

  // ⭐ Sofas
  sofa_single: 25,
  sofa_double: 35,
  sofa_triple: 55,
  sofa_lshape: 80,

  // ⭐ Mattresses
  mattress_single: 20,
  mattress_double: 25,
  mattress_king: 30,
  mattress_superking: 5,

  // ⭐ Chairs
  dining_chairs: 5,
  office_chairs: 5,
};




// ⭐ Coupons Database (Auto-Apply System)
export const couponsDB = [
  {
    code: "SAVE10",
    type: "flat",       // subtract £10
    amount: 10,
    expires: "2025-12-31",
  },
  {
    code: "FIRST20",
    type: "percent",    // 20% off
    amount: 20,
    expires: "2025-12-31",
  },
  {
    code: "WELCOME5",
    type: "flat",       // subtract £5
    amount: 5,
    expires: "2025-06-01",
  },
];
