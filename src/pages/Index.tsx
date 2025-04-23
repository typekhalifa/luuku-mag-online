
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import NewsTicker from "@/components/sections/NewsTicker";

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
      
      <div className="container py-20 text-center">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
          Welcome to the Luuku Magazine
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
          Your source for the latest news and stories
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild>
            <Link to="/articles">View Articles</Link>
          </Button>
          <Button asChild>
            <Link to="/admin/login">Admin Portal</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
