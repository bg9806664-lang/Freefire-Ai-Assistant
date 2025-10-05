import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderContent = () => {
    // Split by newlines to process line-by-line for lists
    const lines = content.split('\n');
    // FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    const elements: React.ReactElement[] = [];
    let inList = false;

    lines.forEach((line, index) => {
      // Handle headings
      if (line.trim().startsWith('# ')) {
        inList = false;
        elements.push(<h1 key={`h1-${index}`}>{formatInlineText(line.trim().substring(2))}</h1>);
        return;
      }
       if (line.trim().startsWith('## ')) {
        inList = false;
        elements.push(<h2 key={`h2-${index}`}>{formatInlineText(line.trim().substring(3))}</h2>);
        return;
      }
       if (line.trim().startsWith('### ')) {
        inList = false;
        elements.push(<h3 key={`h3-${index}`}>{formatInlineText(line.trim().substring(4))}</h3>);
        return;
      }

      // Handle unordered lists
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        if (!inList) {
          inList = true;
          elements.push(<ul key={`ul-${index}`} className="list-disc list-inside space-y-1 my-2"></ul>);
        }
        const listContent = line.trim().substring(2);
        const lastElement = elements[elements.length - 1];
        if (lastElement && lastElement.type === 'ul') {
          const newChildren = React.Children.toArray(lastElement.props.children);
          newChildren.push(<li key={`li-${index}`}>{formatInlineText(listContent)}</li>);
          elements[elements.length - 1] = React.cloneElement(lastElement, {}, newChildren);
        }
        return;
      }
      
      inList = false;

      // Handle paragraphs and empty lines
      if (line.trim() === '') {
        // We avoid adding <br> tags because CSS margins on paragraphs handle spacing better.
        // This prevents excessive spacing.
      } else {
        elements.push(<p key={`p-${index}`}>{formatInlineText(line)}</p>);
      }
    });

    return elements;
  };
  
  const formatInlineText = (text: string) => {
    // This regex handles multiple bold sections in a single line.
    // It splits the string by the bold markers (**), and then alternates
    // between rendering plain text and bolded text.
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return <>{renderContent()}</>;
};

export default MarkdownRenderer;
