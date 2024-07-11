import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import Hero from './hero';
import Features from './features';
import Testimonials from './testimonials';
import NavBar from './navbar';
import Footer from './footer';

export default function LandingPage() {
  return (
    <>
      <Box sx={{ bgcolor: '#E1D8C8' }}>
        <NavBar />
        <Hero />
        <Features />
        <Divider />
        <Testimonials />
        <Divider />
        <Footer />
      </Box>
    </>
  );
}
