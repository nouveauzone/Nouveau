/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { 
    extend: {
      colors: {
        nvz: {
          forest: '#2F4F3E',
          moss: '#445C48',
          sage: '#7A8F73',
          rain: '#E9EFEA',
          ivory: '#FAF8F4',
          mutedGold: '#C6A86B',
          champagne: '#D8B97D',
          beige: '#F5F1EB',
          brown: '#6A5646'
        }
      },
      fontFamily: {
        heading: ['Cormorant Garamond', 'serif'],
        body: ['Poppins', 'system-ui']
      }
    }
  },
  plugins: [],
};
