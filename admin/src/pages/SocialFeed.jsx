import React from 'react';
import { Instagram, Facebook, PlayCircle, Share2 } from 'lucide-react';

const SocialFeed = () => {
  const posts = [
    { id: 1, type: 'Instagram', title: 'Kottu Toss Night', date: '2 hours ago', likes: '1.2k', views: '4.5k' },
    { id: 2, type: 'TikTok', title: 'The Secret Spice Mix', date: '5 hours ago', likes: '3.4k', views: '12k' },
    { id: 3, type: 'Facebook', title: 'New Store Opening in Taupo!', date: '1 day ago', likes: '500', views: '1.1k' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold">Social Intelligence</h2>
        <button className="btn-gold flex items-center gap-2">
          <Share2 size={18} /> Connect New Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <div key={post.id} className="card group cursor-pointer">
            <div className="relative aspect-square bg-gold/5 border border-gold/10 flex items-center justify-center mb-6 overflow-hidden">
              <PlayCircle className="text-gold opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all" size={64} />
              <div className="absolute top-4 left-4">
                {post.type === 'Instagram' && <Instagram className="text-pink-500" />}
                {post.type === 'TikTok' && <div className="text-cyan-400 font-bold">TikTok</div>}
                {post.type === 'Facebook' && <Facebook className="text-blue-500" />}
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-2">{post.title}</h3>
            <p className="text-xs text-gray-500 mb-6 uppercase tracking-widest">{post.date} • LIVE PREVIEW</p>
            
            <div className="flex justify-between border-t border-gold/10 pt-4 text-xs">
              <div className="flex gap-4">
                <span className="text-gold font-bold">{post.likes} <span className="text-gray-500 font-normal">Likes</span></span>
                <span className="text-gold font-bold">{post.views} <span className="text-gray-500 font-normal">Views</span></span>
              </div>
              <button className="text-gold hover:underline">Approve for Home</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-dashed border-gold/30 flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold mb-6">
          <Share2 size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">No active live streams</h3>
        <p className="text-gray-500 max-w-sm mx-auto">Connect your TikTok or Instagram Live to show real-time kitchen theatrics on the homepage.</p>
      </div>
    </div>
  );
};

export default SocialFeed;
