const AboutSection = () => {
  return (
    <section id="about" className="section-container section-padding">
      <div className="max-w-3xl mx-auto text-center">
        <span className="badge-minimal mb-6 inline-block">About Us</span>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-balance">
          About Web3 Jobs Institute
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Web3 Jobs Institute is built for beginners, creators, builders, and freelancers who want to 
          thrive in the decentralized economy. We focus on practical, income-driven Web3 skills that 
          translate directly into real opportunities.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Our ecosystem combines structured learning with an active community and direct access to 
          jobs and collaborations. Whether you're looking to land your first Web3 role or build 
          your own digital business, we provide the skills, network, and opportunities to make it happen.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
