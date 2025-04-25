import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import NewsTicker from "@/components/sections/NewsTicker";
import NewsCarousel from "@/components/sections/NewsCarousel";
import NewsSection from "@/components/sections/NewsSection";
import InstagramGrid from "@/components/sections/InstagramGrid";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreakingNews = async () => {
      const { data } = await supabase
        .from('breaking_news')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: true });
      
      setBreakingNews(data || []);
      setLoading(false);
    };

    fetchBreakingNews();
  }, []);

  // Mock data for news carousel
  const carouselItems = [
    {
      id: 1,
      title: "Global Economic Forum Addresses Climate Change Initiatives",
      image: "https://images.unsplash.com/photo-1470723710355-95304d8aece4?q=80&w=1470",
      category: "World",
      link: "#"
    },
    {
      id: 2,
      title: "New Technology Breakthrough in Renewable Energy Storage",
      image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1074",
      category: "Technology",
      link: "#"
    },
    {
      id: 3,
      title: "Financial Markets React to Central Bank Policy Changes",
      image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=1470",
      category: "Finance",
      link: "#"
    }
  ];

  // Mock data for news sections
  const technologyArticles = [
    {
      id: 1,
      title: "AI Revolution in Healthcare: New Diagnostic Tools",
      excerpt: "Artificial intelligence is transforming how doctors diagnose and treat diseases with unprecedented accuracy.",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1470",
      category: "Technology",
      date: "2 hours ago",
      link: "#"
    },
    {
      id: 2,
      title: "Quantum Computing Milestone Achieved by Research Team",
      excerpt: "Scientists have reached a significant breakthrough in quantum computing that could revolutionize data processing.",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1470",
      category: "Technology",
      date: "Yesterday",
      link: "#"
    },
    {
      id: 3,
      title: "New Smartphone Features Focus on Digital Wellbeing",
      excerpt: "The latest generation of smartphones includes tools designed to help users manage screen time and online habits.",
      image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?q=80&w=1026",
      category: "Technology",
      date: "2 days ago",
      link: "#"
    }
  ];
  
  const worldArticles = [
    {
      id: 4,
      title: "International Climate Agreement Receives Wide Support",
      excerpt: "Countries around the world are signing onto a new framework for addressing climate change and reducing emissions.",
      image: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=1470",
      category: "World",
      date: "4 hours ago",
      link: "#"
    },
    {
      id: 5,
      title: "Diplomatic Relations Improve Between Rival Nations",
      excerpt: "A historic meeting between leaders signals a potential thaw in long-standing international tensions.",
      image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1469",
      category: "World",
      date: "Today",
      link: "#"
    },
    {
      id: 6,
      title: "Cultural Exchange Program Launches Across Continents",
      excerpt: "A new initiative aims to build bridges between diverse communities through art, music, and education.",
      image: "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=1470",
      category: "World",
      date: "3 days ago",
      link: "#"
    }
  ];
  
  const opportunitiesArticles = [
    {
      id: 7,
      title: "Scholarship Program Opens Applications for International Students",
      excerpt: "A major foundation announces funding opportunities for students from developing countries to study abroad.",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1470",
      category: "Opportunities",
      date: "1 day ago",
      link: "#"
    },
    {
      id: 8,
      title: "Green Technology Startups Receive Major Investment",
      excerpt: "Venture capital firms are pouring resources into innovative companies addressing environmental challenges.",
      image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1470",
      category: "Opportunities",
      date: "1 week ago",
      link: "#"
    },
    {
      id: 9,
      title: "Remote Work Revolution Creates New Career Paths",
      excerpt: "Companies embracing flexible work arrangements are opening doors for talent regardless of location.",
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1469",
      category: "Opportunities",
      date: "5 days ago",
      link: "#"
    }
  ];

  // Get top 6 articles from each category for "Our Picks"
  const ourPicks = [
    ...technologyArticles,
    ...worldArticles,
    ...opportunitiesArticles
  ]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 6);

  return (
    <>
      {/* Breaking News Ticker - Always at the very top, outside of Layout */}
      <NewsTicker 
        items={loading ? [] : breakingNews.map(item => ({
          text: item.text,
          link: item.link,
          date: item.date
        }))} 
      />
      
      <Layout>
        <div className="container py-8">
          {/* Featured News Carousel - Directly below the ticker */}
          <NewsCarousel items={carouselItems} className="mb-8" />
          
          {/* Other News Sections */}
          <NewsSection 
            title="Our Picks" 
            articles={ourPicks} 
            layout="grid" 
          />
          
          <NewsSection 
            title="Technology Updates" 
            articles={technologyArticles} 
            layout="grid" 
          />
          
          <NewsSection 
            title="World News" 
            articles={worldArticles} 
            layout="featured" 
          />
          
          <NewsSection 
            title="Latest Opportunities" 
            articles={opportunitiesArticles} 
            layout="list" 
          />
          
          <InstagramGrid />
        </div>
      </Layout>
    </>
  );
}
