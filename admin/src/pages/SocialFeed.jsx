const SocialFeed = () => {
  const posts = [
    { id: 1, type: 'Instagram', title: 'Kottu Toss Night', date: '2 hours ago', likes: '1.2k', views: '4.5k' },
    { id: 2, type: 'TikTok', title: 'The Secret Spice Mix', date: '5 hours ago', likes: '3.4k', views: '12k' },
    { id: 3, type: 'Facebook', title: 'New Store Opening in Taupo!', date: '1 day ago', likes: '500', views: '1.1k' },
  ];

  const cardClass = 'rounded-lg border border-gold/15 bg-black-soft h-full';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="mb-0 text-4xl font-bold">Social Intelligence</h2>
        <button type="button" className="flex items-center gap-2 rounded-lg border border-gold bg-gold px-4 py-2 font-bold text-black hover:bg-gold-hover">
          <i className="fa-solid fa-share-nodes" /> Connect New Account
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <div key={post.id} className={`${cardClass} p-4`}>
            <div className="relative mb-3 flex aspect-square items-center justify-center border border-gold">
              <i className="fa-solid fa-circle-play text-5xl text-gold/75" />
              <div className="absolute top-0 left-0 p-3">
                {post.type === 'Instagram' && <i className="fa-brands fa-instagram text-red-500" />}
                {post.type === 'TikTok' && <span className="font-bold text-cyan-400">TikTok</span>}
                {post.type === 'Facebook' && <i className="fa-brands fa-facebook text-blue-500" />}
              </div>
            </div>

            <h3 className="mb-2 text-lg font-bold">{post.title}</h3>
            <p className="mb-3 text-sm uppercase text-gray-400">{post.date} • Live Preview</p>

            <div className="flex justify-between border-t border-gold/30 pt-3 text-sm">
              <div className="flex gap-3">
                <span className="font-bold text-gold">{post.likes} <span className="font-normal text-gray-400">Likes</span></span>
                <span className="font-bold text-gold">{post.views} <span className="font-normal text-gray-400">Views</span></span>
              </div>
              <button type="button" className="bg-transparent p-0 text-gold underline-offset-2 hover:underline">Approve for Home</button>
            </div>
          </div>
        ))}
      </div>

      <div className={`${cardClass} mt-4 flex flex-col items-center justify-center border-dashed border-gold py-12 text-center`}>
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-gold text-gold">
          <i className="fa-solid fa-share-nodes text-2xl" />
        </div>
        <h3 className="mb-2 text-xl font-bold">No active live streams</h3>
        <p className="mb-0 max-w-md text-gray-400">Connect your TikTok or Instagram Live to show real-time kitchen theatrics on the homepage.</p>
      </div>
    </div>
  );
};

export default SocialFeed;
