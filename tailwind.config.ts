import type { Config } from "tailwindcss";

const scrollbarHidePlugin = function ({ addUtilities }: { addUtilities: any }) {
  addUtilities({
    '.scrollbar-hide': {
      /* Hide scrollbar for Chrome, Safari and Opera */
      '&::-webkit-scrollbar': {
        display: 'none'
      },
      /* Hide scrollbar for IE, Edge and Firefox */
      '-ms-overflow-style': 'none',  /* IE and Edge */
      'scrollbar-width': 'none'  /* Firefox */
    }
  }, ['responsive']);
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'sm': {
        'min': '320px',
        'max': '767px'
      },
      'md': {
        'min': '768px',
        'max': '1023px'
      },
      'lg': {
        'min': '1024px',
        'max': '1279px'
      },
      'xl': {
        'min': '1280px',
        'max': '1535px'
      },
      '2xl': {
        'min': '1536px',
        'max': '3200px'
      }
    },
    extend: {
      gridTemplateColumns: {
        '20': 'repeat(20, minmax(0, 1fr))',
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-13': 'span 13 / span 13',
        'span-14': 'span 14 / span 14',
        'span-15': 'span 15 / span 15',
        'span-16': 'span 16 / span 16',
        'span-17': 'span 17 / span 17',
        'span-18': 'span 18 / span 18',
        'span-19': 'span 19 / span 19',
        'span-20': 'span 20 / span 20',
        'span-21': 'span 21 / span 21',
        'span-22': 'span 22 / span 22',
        'span-23': 'span 23 / span 23',
        'span-24': 'span 24 / span 24',
      },
      gridColumnStart: {
        '13': '13',
        '14': '14',
        '15': '15',
        '16': '16',
        '17': '17',
        '18': '18',
        '19': '19',
        '20': '20',
        '21': '21',
        '22': '22',
        '23': '23'
      },
      gridColumnEnd: {
        '13': '13',
        '14': '14',
        '15': '15',
        '16': '16',
        '17': '17',
        '18': '18',
        '19': '19',
        '20': '20',
        '21': '21',
        '22': '22',
        '23': '23'
      },
      fontSize: {
        '6': '0.375rem',  // 6px in rem
        '7': '0.438rem',  // 7px in rem
        '8': '0.5rem',  // 8px in rem
        '9': '0.5625rem', // 9px in rem
        '10': '0.625rem', // 10px in rem
        '11': '0.6875rem', // 11px in rem
        // use 'text-xs' for 12px
      },
      colors: {
        'condoTheme': {
          100: '#0075A1',
          200: '#3796B9',
          300: '#043D59',
          400: '#226083',
          // 500: 'placeholder',
          // 600: 'placeholder',
          // 700: 'placeholder',
          // 800: 'placeholder',
          900: '#0D263B',
        },
        'theme': {
          primary: {
            100: '#fc8663',
            200: '#A3B087',
            300: '#c4d9ed',
            400: '#8c94bd',
            500: '#ebd9c2',
            600: '#f7f2e8',
            700: '#d9d973'
          },
          secondary: {
            100: '#FEC7B6',
            200: '#C2CCB0',
            300: '#9EBFE0',
            400: '#B8BAD6',
            500: '#E8E8A8',
            600: '#fcfaf5'
          },
          tertiary: {
            100: '#FFEDE8',
            200: '#E3E5D9',
            300: '#EDF2FA',
            400: '#E2E4EE',
            500: '#FAFAEB',
            600: '#C4D8ED',
            700: "#D8D872"
          }
        },
      },
      fontFamily: {
        lato: ['Lato'],
        inter: ['Inter']
      },
      boxShadow: {
        'custom': '2px 5px 15px 0 rgba(40, 40, 40, 0.08)',
      },
      height: {
        '94.5': '23.625rem',
    }
    },
  },
  plugins: [scrollbarHidePlugin],
};
export default config;
