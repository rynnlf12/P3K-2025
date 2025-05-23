/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  future: {
    useOklch: false, // ⛔ pastikan warna tidak pakai oklch
  },
  
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'golden-hour': 'linear-gradient(135deg, #FDB813, #FF5E00, #D72638)',
      },
      future: {
        respectDefaultRingColorOpacity: false,
      },
      corePlugins: {
        preflight:false,
      }
    },
    colors: {
      pink: {
        600: '#e6007e', // warna khas twentysix
      }
    }
    
  },
  plugins: [],
}
