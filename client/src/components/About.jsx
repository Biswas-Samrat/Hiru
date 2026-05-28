import { motion } from 'framer-motion';

const videos = [
  'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-meal-4339-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-person-pouring-spices-4341-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-chef-decorating-a-plate-4342-large.mp4',
];

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="row align-items-center g-5">
          <motion.div
            className="col-lg-6"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="eyebrow">About Chef Hiru</p>
            <h2>From Hilton kitchens to Taupo street-food theatre.</h2>
            <div className="story-copy">
              <p>Chef Hiru is the force behind Hiran’s Sri Lankan Fusion, The Local Diner, and Spicy Touch by Chef Hiru in Taupo.</p>
              <p>His latest concept, Hiran’s Sri Lankan Fusion, is located in the heart of Taupo at 113 Tongariro Street, bringing bold Sri Lankan street food and signature Kottu Rotti to the town.</p>
              <p>The Local Diner and Spicy Touch by Chef Hiru are based at Stag Park, 140 Napier Road, offering a mix of American-style comfort food and authentic Sri Lankan cuisine.</p>
              <p>He began his journey working in the professional kitchen of Hilton Auckland, building a strong foundation in quality, consistency, and customer service.</p>
              <p>After that, he started small, selling homemade food and running a local market stall in Taupo. Through hard work and passion, he grew step by step into multiple food brands.</p>
              <p>Today, his focus is simple: to serve bold, flavourful food and make Sri Lankan cuisine more popular in New Zealand.</p>
            </div>

            <div className="brand-pills">
              <span>Hiran’s Sri Lankan Fusion</span>
              <span>The Local Diner</span>
              <span>Spicy Touch by Chef Hiru</span>
            </div>
          </motion.div>

          <motion.div
            className="col-lg-6"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="video-mosaic">
              <video autoPlay muted loop playsInline>
                <source src={videos[0]} type="video/mp4" />
              </video>
              <video autoPlay muted loop playsInline>
                <source src={videos[1]} type="video/mp4" />
              </video>
              <video autoPlay muted loop playsInline>
                <source src={videos[2]} type="video/mp4" />
              </video>
              <div className="quote-panel">
                <span>Chef in Action</span>
                <strong>Kottu is food, rhythm, heat, and theatre all at once.</strong>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
