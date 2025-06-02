
import { cn } from "@/lib/utils";
import LikeButton from "../LikeButton";

export interface NewsArticle {
  id: number | string; // Keep both for backward compatibility
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  link: string;
}

interface NewsSectionProps {
  title: string;
  icon?: string;
  articles: NewsArticle[];
  layout?: "grid" | "featured" | "list";
  className?: string;
}

const NewsSection = ({ 
  title, 
  icon, 
  articles, 
  layout = "grid", 
  className 
}: NewsSectionProps) => {
  
  if (articles.length === 0) return null;
  
  return (
    <section className={cn("py-10", className)}>
      <div className="container px-4">
        <div className="flex items-center mb-6">
          {icon && <span className="mr-2">{icon}</span>}
          <h2 className="text-2xl font-bold font-heading">{title}</h2>
        </div>
        
        {layout === "featured" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <FeaturedArticleCard article={articles[0]} />
            </div>
            <div className="space-y-6">
              {articles.slice(1, 3).map(article => (
                <SmallArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}
        
        {layout === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
        
        {layout === "list" && (
          <div className="space-y-6">
            {articles.map(article => (
              <ListArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const FeaturedArticleCard = ({ article }: { article: NewsArticle }) => {
  return (
    <div className="group">
      <a href={`/articles/${article.id}`} className="block relative aspect-[16/9] mb-4 overflow-hidden">
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-highlight text-white rounded">
            {article.category}
          </span>
        </div>
      </a>
      <div>
        <h3 className="text-xl font-bold font-heading mb-2">
          <a href={`/articles/${article.id}`} className="hover:text-highlight transition-colors">
            {article.title}
          </a>
        </h3>
        <p className="text-sm text-gray-600 mb-2">{article.excerpt}</p>
        <span className="text-xs text-gray-500">{article.date}</span>
        <div className="flex gap-3 mt-4 items-center">
          <LikeButton articleId={String(article.id)} />
        </div>
      </div>
    </div>
  );
};

const ArticleCard = ({ article }: { article: NewsArticle }) => {
  return (
    <div className="group">
      <a href={`/articles/${article.id}`} className="block relative aspect-[4/3] mb-3 overflow-hidden">
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-highlight text-white rounded">
            {article.category}
          </span>
        </div>
      </a>
      <div>
        <h3 className="text-lg font-bold font-heading mb-2">
          <a href={`/articles/${article.id}`} className="hover:text-highlight transition-colors">
            {article.title}
          </a>
        </h3>
        <span className="text-xs text-gray-500">{article.date}</span>
        <div className="flex gap-3 mt-3 items-center">
          <LikeButton articleId={String(article.id)} size="sm" />
        </div>
      </div>
    </div>
  );
};

const SmallArticleCard = ({ article }: { article: NewsArticle }) => {
  return (
    <div className="group flex">
      <a href={`/articles/${article.id}`} className="block relative w-1/3 aspect-square mr-3 overflow-hidden flex-shrink-0">
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </a>
      <div>
        <span className="inline-block text-xs font-medium text-highlight mb-1">
          {article.category}
        </span>
        <h3 className="text-base font-bold font-heading">
          <a href={`/articles/${article.id}`} className="hover:text-highlight transition-colors">
            {article.title}
          </a>
        </h3>
        <span className="text-xs text-gray-500">{article.date}</span>
        <div className="flex gap-3 mt-2 items-center">
          <LikeButton articleId={String(article.id)} size="sm" />
        </div>
      </div>
    </div>
  );
};

const ListArticleCard = ({ article }: { article: NewsArticle }) => {
  return (
    <div className="group flex items-center pb-4 border-b">
      <a href={`/articles/${article.id}`} className="block relative w-1/4 md:w-1/5 aspect-[4/3] mr-4 overflow-hidden flex-shrink-0">
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </a>
      <div>
        <span className="inline-block text-xs font-medium text-highlight mb-1">
          {article.category}
        </span>
        <h3 className="text-base md:text-lg font-bold font-heading mb-1">
          <a href={`/articles/${article.id}`} className="hover:text-highlight transition-colors">
            {article.title}
          </a>
        </h3>
        <p className="text-sm text-gray-600 mb-1 hidden md:block">{article.excerpt}</p>
        <span className="text-xs text-gray-500">{article.date}</span>
        <div className="flex gap-3 mt-2 items-center">
          <LikeButton articleId={String(article.id)} size="sm" />
        </div>
      </div>
    </div>
  );
};

export default NewsSection;
