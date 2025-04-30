import React from 'react';

const SimpleMarkdown = ({ text }) => {
  if (!text) return null;
  
  // Process inline formatting (bold, italic, etc.)
  const processInlineFormatting = (content) => {
    if (!content) return null;
    
    // Array to hold the processed segments
    const segments = [];
    let currentText = '';
    let inBold = false;
    let inItalic = false;
    let index = 0;
    
    // Process the content character by character
    while (index < content.length) {
      // Handle bold formatting with **
      if (index < content.length - 1 && content.substr(index, 2) === '**') {
        // Add current text segment
        if (currentText.length > 0) {
          segments.push(inBold ? <strong key={segments.length}>{currentText}</strong> : currentText);
          currentText = '';
        }
        
        // Toggle bold state
        inBold = !inBold;
        index += 2;
        continue;
      }
      
      // Handle italic formatting with *
      if (content[index] === '*' && (index === 0 || content[index-1] !== '*') && (index === content.length - 1 || content[index+1] !== '*')) {
        // Add current text segment
        if (currentText.length > 0) {
          segments.push(inItalic ? <em key={segments.length}>{currentText}</em> : currentText);
          currentText = '';
        }
        
        // Toggle italic state
        inItalic = !inItalic;
        index += 1;
        continue;
      }
      
      // Add character to current text
      currentText += content[index];
      index += 1;
    }
    
    // Add any remaining text
    if (currentText.length > 0) {
      segments.push(inBold ? <strong key={segments.length}>{currentText}</strong> : 
                   inItalic ? <em key={segments.length}>{currentText}</em> : currentText);
    }
    
    return segments;
  };
  
  const renderLine = (line, index) => {
    // Headers
    if (line.startsWith('# ')) {
      return (
        <h1 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {processInlineFormatting(line.substring(2))}
        </h1>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-gray-800">
          {processInlineFormatting(line.substring(3))}
        </h2>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h3 key={index} className="text-lg font-bold mt-5 mb-2 text-gray-800">
          {processInlineFormatting(line.substring(4))}
        </h3>
      );
    }
    
    // List items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <li key={index} className="ml-6 mt-2 text-gray-600">
          {processInlineFormatting(line.substring(2))}
        </li>
      );
    }
    
    // Empty lines
    if (line.trim() === '') {
      return <div key={index} className="h-4" />;
    }
    
    // Regular paragraphs
    return (
      <p key={index} className="my-3 text-gray-600 leading-relaxed">
        {processInlineFormatting(line)}
      </p>
    );
  };
  
  // Process the text, grouping list items together and handling code blocks
  const processContent = () => {
    const lines = text.split('\n');
    const elements = [];
    let currentListItems = [];
    let inCodeBlock = false;
    let codeContent = [];
    
    lines.forEach((line, index) => {
      // Handle code blocks with triple backticks
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          // Start a new code block
          inCodeBlock = true;
          
          // If we have list items, add the list and clear it
          if (currentListItems.length > 0) {
            elements.push(
              <ul key={`list-${elements.length}`} className="list-disc my-4 space-y-2">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
          }
        } else {
          // End current code block
          inCodeBlock = false;
          elements.push(
            <div key={`code-${elements.length}`} className="my-6">
              <pre className="bg-gray-50 rounded-xl p-4 overflow-x-auto font-mono text-sm text-gray-800">
                {codeContent.join('\n')}
              </pre>
            </div>
          );
          codeContent = [];
        }
        return;
      }
      
      if (inCodeBlock) {
        // Add line to code content
        codeContent.push(line);
        return;
      }
      
      if (line.startsWith('- ') || line.startsWith('* ')) {
        // Add to current list
        currentListItems.push(renderLine(line, `list-item-${index}`));
      } else {
        // If we have list items, add the list and clear it
        if (currentListItems.length > 0) {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc my-4 space-y-2">
              {currentListItems}
            </ul>
          );
          currentListItems = [];
        }
        
        // Add the current non-list element
        elements.push(renderLine(line, `line-${index}`));
      }
    });
    
    // If we have any remaining list items, add them
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc my-4 space-y-2">
          {currentListItems}
        </ul>
      );
    }
    
    // If we're still in a code block at the end, close it
    if (inCodeBlock && codeContent.length > 0) {
      elements.push(
        <div key={`code-${elements.length}`} className="my-6">
          <pre className="bg-gray-50 rounded-xl p-4 overflow-x-auto font-mono text-sm text-gray-800">
            {codeContent.join('\n')}
          </pre>
        </div>
      );
    }
    
    return elements;
  };
  
  return (
    <div className="markdown-content">
      {processContent()}
    </div>
  );
};

export default SimpleMarkdown; 