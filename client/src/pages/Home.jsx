import React from 'react';
import Hero from '../components/Hero';
import Menu from '../components/Menu';
import About from '../components/About';
import Contact from '../components/Contact';

const Home = () => {
  return (
    <div className="bg-black">
      <Hero />
      <Menu />
      <About />
      <Contact />
    </div>
  );
};

export default Home;
