
import Layout from "@/components/layout/Layout";
import NewsTicker from "@/components/sections/NewsTicker";
import NewsCarousel from "@/components/sections/NewsCarousel";
import NewsSection from "@/components/sections/NewsSection";
import InstagramGrid from "@/components/sections/InstagramGrid";

export default function Index() {
  // Mock data for news ticker
  const breakingNews = [
    { text: "Global summit on climate change concludes with new agreements", link: "#", date: "1h ago" },
    { text: "Tech giant announces breakthrough in quantum computing", link: "#", date: "3h ago" },
    { text: "Major economic policy shift announced by central bank", link: "#", date: "5h ago" },
    { text: "International space mission discovers signs of water on distant planet", link: "#", date: "Today" },
    { text: "Sports league announces expansion to new cities", link: "#", date: "Today" },
  ];

  return (
    <Layout>
      {/* Breaking News Ticker */}
      <NewsTicker items={breakingNews} />
      
      {/* News Content */}
      <div className="container py-8">
        <NewsCarousel />
        <NewsSection />
        <InstagramGrid />
      </div>
    </Layout>
  );
}
