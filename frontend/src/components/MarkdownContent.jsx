import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownContent({ children, className = '' }) {
  if (!children) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={`prose prose-invert prose-sm max-w-none ${className}`}
      components={{
        // Optional: customise list styling
        ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
        li: ({ children }) => <li className="ml-4">{children}</li>,
        p: ({ children }) => <p className="mb-1">{children}</p>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
