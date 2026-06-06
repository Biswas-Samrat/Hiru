import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEFAULT_SKILLS = [
  { id: 'willingness', label: 'WILLINGNESS TO LEARN', percentage: 90 },
  { id: 'passion', label: 'GENUINE PASSION', percentage: 80 },
  { id: 'organisation', label: 'ORGANISATION', percentage: 75 },
  { id: 'creativity', label: 'CREATIVITY', percentage: 85 },
  { id: 'time_management', label: 'TIME MANAGEMENT', percentage: 75 },
  { id: 'teamwork', label: 'TEAMWORK', percentage: 95 },
];

const SkillBar = ({ label, percentage, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="skill-bar-item"
    >
      <div className="skill-bar-header">
        <span className="skill-label">{label}</span>
        <span className="skill-pct">{percentage}%</span>
      </div>
      <div className="skill-track">
        <motion.div
          className="skill-fill"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
          transition={{ duration: 1, delay: index * 0.08 + 0.2, ease: 'easeOut' }}
        />
        <div className="skill-dots" />
      </div>
    </motion.div>
  );
};

const Skills = () => {
  const [skills, setSkills] = useState(DEFAULT_SKILLS);

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.skills && data.skills.length > 0) {
          setSkills(data.skills);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="skills-section">
      <div className="skills-inner">
        {/* Heading */}
        <motion.div
          className="skills-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="skills-eyebrow">MY PROFESSIONAL</span>
          <h2 className="skills-title">Skills</h2>
          <p className="skills-subtitle">
            A blend of culinary expertise, creativity, and dedication that defines Chef Hiru's kitchen philosophy.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="skills-grid">
          {skills.map((skill, i) => (
            <SkillBar
              key={skill.id}
              label={skill.label}
              percentage={skill.percentage}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
