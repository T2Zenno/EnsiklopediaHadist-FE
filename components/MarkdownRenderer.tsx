import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const processInlines = (text: string) => {
    // Process bold text
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const blocks = content.split(/\n\s*\n/); // Split by one or more empty lines

  return (
    <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
      {blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        const lines = trimmedBlock.split('\n');
        const isList = lines.every(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));

        if (isList) {
          return (
            <ul key={index} className="list-disc list-inside space-y-2 pl-4">
              {lines.map((item, itemIndex) => {
                const cleanItem = item.trim().substring(2);
                return <li key={itemIndex} dangerouslySetInnerHTML={{ __html: processInlines(cleanItem) }} />;
              })}
            </ul>
          );
        }

        return <p key={index} dangerouslySetInnerHTML={{ __html: processInlines(block) }} />;
      })}
    </div>
  );
};
