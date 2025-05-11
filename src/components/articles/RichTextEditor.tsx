
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Image
} from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  label, 
  className,
  placeholder = "Write your content here..."
}) => {
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  // Handle text selection
  const handleSelect = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      setSelection({ start, end });
    }
  };
  
  // Insert formatting at selection
  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const selStart = textarea.selectionStart;
      const selEnd = textarea.selectionEnd;
      const textBefore = value.substring(0, selStart);
      const selectedText = value.substring(selStart, selEnd);
      const textAfter = value.substring(selEnd);
      
      const newValue = `${textBefore}${prefix}${selectedText}${suffix}${textAfter}`;
      onChange(newValue);
      
      // Reset focus and selection after state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          selStart + prefix.length, 
          selEnd + prefix.length
        );
      }, 0);
    }
  };
  
  // Insert link
  const insertLink = (url: string, text: string) => {
    if (!url) return;
    
    const linkMarkdown = text ? `[${text}](${url})` : `[${url}](${url})`;
    
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const selStart = selection.start;
      const selEnd = selection.end;
      const textBefore = value.substring(0, selStart);
      const textAfter = value.substring(selEnd);
      
      const selectedText = value.substring(selStart, selEnd);
      const finalLinkText = text || selectedText || url;
      const finalLinkMarkdown = `[${finalLinkText}](${url})`;
      
      const newValue = `${textBefore}${finalLinkMarkdown}${textAfter}`;
      onChange(newValue);
      
      // Reset focus after state update
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  };
  
  // Insert image
  const insertImage = (url: string, alt: string) => {
    if (!url) return;
    
    const imgMarkdown = `![${alt || 'Image'}](${url})`;
    
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const selStart = textarea.selectionStart;
      const textBefore = value.substring(0, selStart);
      const textAfter = value.substring(selStart);
      
      const newValue = `${textBefore}${imgMarkdown}${textAfter}`;
      onChange(newValue);
      
      // Reset focus after state update
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  };

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      
      <div className="border rounded-md">
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            onClick={() => insertFormatting('**')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            onClick={() => insertFormatting('*')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            onClick={() => insertFormatting('__')}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>
          
          <span className="w-px h-6 bg-border mx-1" />
          
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            onClick={() => insertFormatting('## ')}
            title="Heading"
          >
            <Heading className="h-4 w-4" />
          </Button>
          
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            onClick={() => {
              const textarea = textareaRef.current;
              if (textarea) {
                const selStart = textarea.selectionStart;
                const lineStart = value.lastIndexOf('\n', selStart - 1) + 1;
                const textBefore = value.substring(0, lineStart);
                const textAfterLineStart = value.substring(lineStart);
                onChange(`${textBefore}- ${textAfterLineStart}`);
              }
            }}
            title="Bulleted List"
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            onClick={() => {
              const textarea = textareaRef.current;
              if (textarea) {
                const selStart = textarea.selectionStart;
                const lineStart = value.lastIndexOf('\n', selStart - 1) + 1;
                const textBefore = value.substring(0, lineStart);
                const textAfterLineStart = value.substring(lineStart);
                onChange(`${textBefore}1. ${textAfterLineStart}`);
              }
            }}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          <span className="w-px h-6 bg-border mx-1" />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                title="Insert Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <h4 className="font-medium leading-none">Insert Link</h4>
                <div className="grid gap-2">
                  <Label htmlFor="link-url">URL</Label>
                  <Input id="link-url" placeholder="https://example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link-text">Text</Label>
                  <Input id="link-text" placeholder="Link text (optional)" />
                </div>
                <Button 
                  onClick={() => {
                    const url = (document.getElementById('link-url') as HTMLInputElement)?.value;
                    const text = (document.getElementById('link-text') as HTMLInputElement)?.value;
                    insertLink(url, text);
                  }}
                >
                  Insert Link
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                title="Insert Image"
              >
                <Image className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <h4 className="font-medium leading-none">Insert Image</h4>
                <div className="grid gap-2">
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input id="image-url" placeholder="https://example.com/image.jpg" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image-alt">Alt Text</Label>
                  <Input id="image-alt" placeholder="Image description" />
                </div>
                <Button 
                  onClick={() => {
                    const url = (document.getElementById('image-url') as HTMLInputElement)?.value;
                    const alt = (document.getElementById('image-alt') as HTMLInputElement)?.value;
                    insertImage(url, alt);
                  }}
                >
                  Insert Image
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleSelect}
          className="min-h-[300px] border-0 rounded-t-none focus-visible:ring-0 resize-y"
          placeholder={placeholder}
        />
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        Use formatting buttons or Markdown for styling. Double line breaks create new paragraphs.
      </div>
    </div>
  );
};

export default RichTextEditor;
