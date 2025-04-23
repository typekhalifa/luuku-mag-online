
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <Layout>
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
