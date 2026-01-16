import React from 'react';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <style>{`
        :root {
          --background: 0 0% 4%;
          --foreground: 0 0% 98%;
          --card: 0 0% 7%;
          --card-foreground: 0 0% 98%;
          --popover: 0 0% 7%;
          --popover-foreground: 0 0% 98%;
          --primary: 263 70% 50%;
          --primary-foreground: 0 0% 98%;
          --secondary: 0 0% 15%;
          --secondary-foreground: 0 0% 98%;
          --muted: 0 0% 15%;
          --muted-foreground: 0 0% 64%;
          --accent: 0 0% 15%;
          --accent-foreground: 0 0% 98%;
          --destructive: 0 62% 30%;
          --destructive-foreground: 0 0% 98%;
          --border: 0 0% 15%;
          --input: 0 0% 15%;
          --ring: 263 70% 50%;
        }
        
        body {
          background-color: #0a0a0a;
          color: #fafafa;
        }
        
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        ::selection {
          background: rgba(139, 92, 246, 0.3);
        }
      `}</style>
            {children}
        </div>
    );
}