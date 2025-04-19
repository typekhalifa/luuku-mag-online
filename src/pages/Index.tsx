
import Layout from "@/components/layout/Layout";
import NewsTicker from "@/components/sections/NewsTicker";
import NewsCarousel from "@/components/sections/NewsCarousel";
import NewsSection from "@/components/sections/NewsSection";

const Index = () => {
  // Mock breaking news data
  const breakingNews = [
    { text: "Global summit on climate change concludes with new emissions targets", link: "#" },
    { text: "Tech giant unveils revolutionary AI assistant with human-like capabilities", link: "#" },
    { text: "Major economic powers agree on new trade framework during G20 summit", link: "#" },
    { text: "Scientists discover potential breakthrough in cancer treatment", link: "#" },
  ];

  // Mock featured news carousel data
  const carouselItems = [
    {
      id: 1,
      title: "Global Leaders Converge to Address Climate Crisis in Historic Summit",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1500&h=800&fit=crop",
      category: "World",
      link: "#"
    },
    {
      id: 2,
      title: "Revolutionary Breakthrough in Quantum Computing Promises New Technological Era",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1500&h=800&fit=crop",
      category: "Technology",
      link: "#"
    },
    {
      id: 3,
      title: "Financial Markets React to Sudden Shift in Central Bank Policies",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1500&h=800&fit=crop",
      category: "Finance",
      link: "#"
    }
  ];

  // Mock latest news data
  const latestNews = [
    {
      id: 101,
      title: "Renewable Energy Investments Reach Record High in Third Quarter",
      excerpt: "Global investments in renewable energy projects surged to unprecedented levels according to new report.",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&h=400&fit=crop",
      category: "Business",
      date: "1 hour ago",
      link: "#"
    },
    {
      id: 102,
      title: "New Study Links Regular Exercise to Improved Brain Function",
      excerpt: "Researchers discover compelling connection between physical activity and cognitive performance.",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
      category: "Health",
      date: "3 hours ago",
      link: "#"
    },
    {
      id: 103,
      title: "Tech Giants Face New Regulations in European Union",
      excerpt: "Landmark digital markets legislation aims to curb monopolistic practices of major technology companies.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
      category: "Technology",
      date: "5 hours ago",
      link: "#"
    }
  ];

  // Mock picks data
  const ourPicks = [
    {
      id: 201,
      title: "The Rising Influence of Digital Creators in Modern Marketing",
      excerpt: "How social media influencers are reshaping brand strategies and consumer engagement.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
      category: "Business",
      date: "Yesterday",
      link: "#"
    },
    {
      id: 202,
      title: "Urban Farming Initiatives Transform City Landscapes",
      excerpt: "Community-driven agricultural projects bring fresh produce and green spaces to urban environments.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
      category: "Environment",
      date: "2 days ago",
      link: "#"
    },
    {
      id: 203,
      title: "The Psychology Behind Successful Leadership in Crisis",
      excerpt: "Examining the traits and strategies that enable effective leadership during challenging times.",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&h=400&fit=crop",
      category: "Politics",
      date: "3 days ago",
      link: "#"
    }
  ];

  // Mock world news data
  const worldNews = [
    {
      id: 301,
      title: "Historic Peace Agreement Signed After Decades of Regional Conflict",
      excerpt: "Leaders from conflicting nations finalize groundbreaking accord aimed at lasting stability.",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&h=400&fit=crop",
      category: "World",
      date: "1 day ago",
      link: "#"
    },
    {
      id: 302,
      title: "Island Nation Implements Innovative Climate Adaptation Strategy",
      excerpt: "Facing rising sea levels, country launches comprehensive plan combining traditional knowledge and modern technology.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
      category: "World",
      date: "2 days ago",
      link: "#"
    },
    {
      id: 303,
      title: "Cultural Heritage Site Receives International Protection Status",
      excerpt: "Ancient monuments gain crucial safeguards against development and environmental threats.",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
      category: "World",
      date: "3 days ago",
      link: "#"
    },
    {
      id: 304,
      title: "Diplomatic Breakthrough on Cross-Border Water Rights Dispute",
      excerpt: "Nations sharing critical river basin reach historic agreement on resource management.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
      category: "World",
      date: "4 days ago",
      link: "#"
    }
  ];

  // Mock sports news data
  const sportsNews = [
    {
      id: 401,
      title: "Underdog Team Stuns Champions in Tournament Upset",
      excerpt: "Previously unranked squad defeats reigning champions in remarkable display of skill and determination.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
      category: "Sport",
      date: "12 hours ago",
      link: "#"
    },
    {
      id: 402,
      title: "Record-Breaking Performance at International Athletics Championship",
      excerpt: "Star athlete shatters decade-old world record in spectacular fashion during global competition.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
      category: "Sport",
      date: "1 day ago",
      link: "#"
    },
    {
      id: 403,
      title: "Major League Announces Expansion Plans with Two New Teams",
      excerpt: "Professional sports franchise reveals strategic growth initiative targeting emerging markets.",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&h=400&fit=crop",
      category: "Sport",
      date: "2 days ago",
      link: "#"
    },
    {
      id: 404,
      title: "Young Prodigy Signs Historic Contract After Breakout Season",
      excerpt: "Rising star secures unprecedented deal following exceptional performances on field.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
      category: "Sport",
      date: "3 days ago",
      link: "#"
    }
  ];

  // Mock politics news data
  const politicsNews = [
    {
      id: 501,
      title: "Landmark Legislation Passes After Months of Negotiation",
      excerpt: "Bill addressing critical national issues clears final hurdles following intensive bipartisan talks.",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&h=400&fit=crop",
      category: "Politics",
      date: "Yesterday",
      link: "#"
    },
    {
      id: 502,
      title: "Opposition Coalition Forms Ahead of Upcoming National Elections",
      excerpt: "Previously competing political groups announce strategic alliance to challenge incumbent administration.",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
      category: "Politics",
      date: "2 days ago",
      link: "#"
    },
    {
      id: 503,
      title: "Supreme Court Ruling Redefines Legal Framework for Digital Privacy",
      excerpt: "Landmark decision establishes new precedents for data protection and surveillance limitations.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
      category: "Politics",
      date: "4 days ago",
      link: "#"
    }
  ];

  // Mock business news data
  const businessNews = [
    {
      id: 601,
      title: "Startup Secures Record Funding for Sustainable Materials Innovation",
      excerpt: "Green technology firm attracts major investment to scale production of eco-friendly alternative materials.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
      category: "Business",
      date: "2 days ago",
      link: "#"
    },
    {
      id: 602,
      title: "Major Retail Chain Announces Shift to Fully Renewable Energy Operations",
      excerpt: "Global company commits to comprehensive sustainability transition across all facilities within five years.",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&h=400&fit=crop",
      category: "Business",
      date: "3 days ago",
      link: "#"
    },
    {
      id: 603,
      title: "Industry Leaders Form Consortium to Address Supply Chain Vulnerabilities",
      excerpt: "Unprecedented collaboration aims to build resilience against future disruptions in global trade networks.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
      category: "Business",
      date: "5 days ago",
      link: "#"
    }
  ];

  return (
    <Layout>
      <NewsTicker items={breakingNews} />
      <NewsCarousel items={carouselItems} />
      
      <div className="bg-gray-50">
        <NewsSection
          title="Latest News"
          icon="🔥"
          articles={latestNews}
          layout="featured"
          className="pt-12"
        />
        
        <NewsSection
          title="Our Picks"
          icon="⭐"
          articles={ourPicks}
          layout="grid"
        />
        
        <NewsSection
          title="World"
          icon="🌍"
          articles={worldNews}
          layout="list"
        />
        
        <NewsSection
          title="Sport"
          icon="🏆"
          articles={sportsNews}
          layout="grid"
        />
        
        <NewsSection
          title="Politics"
          icon="🧠"
          articles={politicsNews}
          layout="featured"
        />
        
        <NewsSection
          title="Business"
          icon="💼"
          articles={businessNews}
          layout="list"
          className="pb-12"
        />
      </div>
    </Layout>
  );
};

export default Index;
