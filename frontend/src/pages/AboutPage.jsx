import { Link } from "react-router-dom";
import { Target, Users, Shield, Award, ArrowRight } from "lucide-react";
import "./AboutPage.css";

const team = [
  { name: "Prof. Amanda Silva", role: "Project Director", initials: "AS" },
  { name: "Dr. Rajith Perera", role: "Lead Architect", initials: "RP" },
  { name: "Eng. Nimal Kumar", role: "Technical Lead", initials: "NK" },
  { name: "Ms. Sarah Chen", role: "UX Designer", initials: "SC" },
];

const values = [
  { icon: Target, title: "Innovation", desc: "Pushing boundaries with modern technology solutions" },
  { icon: Shield, title: "Security", desc: "Protecting data with enterprise-grade security" },
  { icon: Users, title: "Collaboration", desc: "Building bridges across departments and faculties" },
  { icon: Award, title: "Excellence", desc: "Delivering top-quality solutions for education" },
];

const AboutUs = () => {
  return (
    <div className="about-page page-wrapper">
      <section className="about-hero">
        <div className="about-container about-center">
          <h1 className="about-title">About SmartCampus</h1>
          <p className="about-subtitle">Modernizing university operations through innovative technology and smart solutions.</p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <div className="about-center about-block-lg">
            <h2 className="about-heading">Our Mission</h2>
            <p className="about-text about-text-wide">
              SmartCampus Operations Hub is designed to transform how universities manage their daily operations. 
              From facility bookings to maintenance tracking, we provide a unified platform that streamlines processes, 
              improves communication, and enhances the overall campus experience for students, staff, and administrators.
            </p>
          </div>

          <div className="about-grid about-grid-4">
            {values.map((v, i) => (
              <div key={v.title} className="about-card" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="about-card-icon-wrap">
                  <v.icon className="about-card-icon" />
                </div>
                <h3 className="about-card-title">{v.title}</h3>
                <p className="about-card-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-section-muted">
        <div className="about-container">
          <h2 className="about-heading about-center">Our Team</h2>
          <div className="about-grid about-grid-team">
            {team.map((m) => (
              <div key={m.name} className="about-team-card">
                <div className="about-team-avatar">
                  {m.initials}
                </div>
                <h3 className="about-team-name">{m.name}</h3>
                <p className="about-team-role">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="about-container about-center">
          <h2 className="about-heading">Ready to get started?</h2>
          <Link className="btn btn-gradient btn-lg" to="/signup">
            Join SmartCampus <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
