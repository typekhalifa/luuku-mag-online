
import Header from "./Header";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import "./layout.css"; // Import CSS for custom animations

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;
