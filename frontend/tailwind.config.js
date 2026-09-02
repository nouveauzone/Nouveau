/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { 
    extend: {
      colors: {
        nvz: {
          // Primary brand colors - Luxury Indian Fashion
          burgundy: '#A1305A',
          burgundyDark: '#7a1f40',
          burgundyLight: '#C94873',
          
          // Rose & Pink palette - Elegant & Feminine
          blushPink: '#FDD7E0',
          rosePink: '#F5B5CB',
          lightPink: '#F9D7E1',
          deepPink: '#E8869F',
          mauve: '#F2C8D4',
          
          // Gold accents - Luxury elements
          gold: '#D4AF37',
          goldLight: '#E8C854',
          goldDark: '#B8860B',
          
          // Neutral tones - Premium feel
          ivory: '#FFF9F6',
          white: '#FFFFFF',
          warmBrown: '#5C3D3D',
          brownMuted: '#8B6A6A',
          brownLight: '#B89898',
          cream: '#FFFAF8',
          
          // Accent colors
          peach: '#FFD7C9',
          coral: '#FF9E8B',
          
          // Borders & Dividers
          border: '#F5B5CB',
          borderLight: '#FDD7E0',
          divider: '#F2C8D4'
        }
      },
      fontFamily: {
        heading: ['Cormorant Garamond', 'Playfair Display', 'serif'],
        body: ['Poppins', 'Inter', 'system-ui']
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #FFF9F6 0%, #FDD7E0 100%)',
        'pink-gradient': 'linear-gradient(135deg, #F9D7E1 0%, #F5B5CB 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #E8C854 100%)',
      }
    }
  },
  plugins: [],
};
