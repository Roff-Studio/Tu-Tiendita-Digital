import React from 'react';
import { Zap } from 'lucide-react';

const BoltBadge: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a 
        href="https://bolt.new" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-label="Built with Bolt.new - Visit Bolt.new"
      >
        <Zap className="h-4 w-4" />
        <span className="text-sm font-medium">Built with Bolt.new</span>
      </a>
    </div>
  );
};

export default BoltBadge;