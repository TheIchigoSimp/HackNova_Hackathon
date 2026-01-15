import React from "react";
import PageLayout from "./PageLayout";
import AnimatedBackground from "../components/LandingPageComponents/AnimatedBackground";
import Hero from "../components/LandingPageComponents/Hero";
import Grid from "../components/LandingPageComponents/Grid";
import HowItWorks from "../components/LandingPageComponents/HowItWorks";
import Footer from "../components/LandingPageComponents/Footer";

/**
 * The LandingPage component renders the landing page of the website.
 * Includes: Hero, Features Grid, How It Works, and Footer.
 */
const LandingPage = () => {
  return (
    <PageLayout>
      {/* Animated background orbs */}
      <AnimatedBackground />

      <main className="relative flex justify-center items-center flex-col overflow-y-auto mx-auto sm:px-10 px-5">
        <div className="mx-w-7xl w-full">
          {/* Hero Section with CTAs */}
          <Hero />

          {/* Feature Grid */}
          <section id="info">
            <Grid />
          </section>

          {/* How It Works Section */}
          <HowItWorks />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </PageLayout>
  );
};

export default LandingPage;


