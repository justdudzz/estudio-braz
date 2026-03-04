import React from 'react';

const BookingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-[#121212] p-6 rounded-2xl border border-white/5 animate-pulse">
          <div className="flex justify-between mb-6">
            <div className="w-10 h-10 bg-white/5 rounded-xl" />
            <div className="w-20 h-4 bg-white/5 rounded-full" />
          </div>
          <div className="w-3/4 h-6 bg-white/10 rounded-md mb-2" />
          <div className="w-1/2 h-4 bg-white/5 rounded-md mb-6" />
          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="w-full h-4 bg-white/5 rounded-md" />
            <div className="w-2/3 h-4 bg-white/5 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingSkeleton;
