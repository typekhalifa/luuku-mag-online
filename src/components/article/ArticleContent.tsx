
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ArticleContentProps {
  content: string;
}

const ArticleContent = ({ content }: ArticleContentProps) => {
  return (
    <div className="px-6 pb-6">
      <div className="space-y-6">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown 
            className="text-base leading-relaxed text-justify"
            components={{
              a: ({ href, children, ...props }) => {
                // Ensure external links have proper protocol
                let finalHref = href || '';
                const isInternalLink = finalHref.startsWith('#') || finalHref.startsWith('/');
                
                // Add https:// if it's an external link without protocol
                if (finalHref && !finalHref.startsWith('http://') && !finalHref.startsWith('https://') && !isInternalLink) {
                  finalHref = 'https://' + finalHref;
                }
                
                // For external links, force them to open in new tab and prevent routing
                const isExternal = finalHref.startsWith('http://') || finalHref.startsWith('https://');
                
                if (isExternal) {
                  return (
                    <a 
                      href={finalHref} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-highlight hover:underline font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(finalHref, '_blank', 'noopener,noreferrer');
                      }}
                      {...props}
                    >
                      {children}
                    </a>
                  );
                }
                
                // Internal links
                return (
                  <a 
                    href={finalHref} 
                    className="text-highlight hover:underline font-medium"
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
              p: ({ children }) => (
                <p className="mb-4 text-base leading-relaxed text-gray-700 text-justify">
                  {children}
                </p>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">
                  {children}
                </h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 leading-relaxed">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-highlight pl-4 italic text-gray-600 my-6">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                  {children}
                </pre>
              ),
              img: ({ src, alt, ...props }) => (
                <div className="my-6">
                  <img 
                    src={src} 
                    alt={alt} 
                    className="w-full rounded-lg shadow-md"
                    loading="lazy"
                    {...props}
                  />
                  {alt && (
                    <p className="text-sm text-gray-500 italic mt-2 text-center">
                      {alt}
                    </p>
                  )}
                </div>
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ArticleContent;
