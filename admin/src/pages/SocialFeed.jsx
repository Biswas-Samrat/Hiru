const SocialFeed = () => {
  const posts = [
    { id: 1, type: 'Instagram', title: 'Kottu Toss Night', date: '2 hours ago', likes: '1.2k', views: '4.5k' },
    { id: 2, type: 'TikTok', title: 'The Secret Spice Mix', date: '5 hours ago', likes: '3.4k', views: '12k' },
    { id: 3, type: 'Facebook', title: 'New Store Opening in Taupo!', date: '1 day ago', likes: '500', views: '1.1k' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="display-6 fw-bold mb-0">Social Intelligence</h2>
        <button className="btn btn-gold d-flex align-items-center gap-2">
          <i className="fa-solid fa-share-nodes"></i> Connect New Account
        </button>
      </div>

      <div className="row g-4">
        {posts.map(post => (
          <div key={post.id} className="col-12 col-md-6 col-lg-4">
          <div className="admin-card p-4 h-100">
            <div className="position-relative d-flex align-items-center justify-content-center mb-3 border border-gold" style={{ aspectRatio: '1 / 1' }}>
              <i className="fa-solid fa-circle-play text-gold opacity-75" style={{ fontSize: '3.5rem' }}></i>
              <div className="position-absolute top-0 start-0 p-3">
                {post.type === 'Instagram' && <i className="fa-brands fa-instagram text-danger"></i>}
                {post.type === 'TikTok' && <span className="text-info fw-bold">TikTok</span>}
                {post.type === 'Facebook' && <i className="fa-brands fa-facebook text-primary"></i>}
              </div>
            </div>
            
            <h3 className="h5 fw-bold mb-2">{post.title}</h3>
            <p className="small text-secondary mb-3 text-uppercase">{post.date} • Live Preview</p>
            
            <div className="d-flex justify-content-between border-top border-gold pt-3 small">
              <div className="d-flex gap-3">
                <span className="text-gold fw-bold">{post.likes} <span className="text-secondary fw-normal">Likes</span></span>
                <span className="text-gold fw-bold">{post.views} <span className="text-secondary fw-normal">Views</span></span>
              </div>
              <button className="btn btn-link text-gold p-0 text-decoration-none">Approve for Home</button>
            </div>
          </div>
          </div>
        ))}
      </div>

      <div className="admin-card mt-4 border border-gold border-dashed d-flex flex-column align-items-center justify-content-center py-5 text-center">
        <div className="rounded-circle border border-gold d-flex align-items-center justify-content-center text-gold mb-3" style={{ width: '64px', height: '64px' }}>
          <i className="fa-solid fa-share-nodes fs-3"></i>
        </div>
        <h3 className="h4 fw-bold mb-2">No active live streams</h3>
        <p className="text-secondary mb-0" style={{ maxWidth: '480px' }}>Connect your TikTok or Instagram Live to show real-time kitchen theatrics on the homepage.</p>
      </div>
    </div>
  );
};

export default SocialFeed;
