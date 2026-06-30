/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#080912',
        secondary: '#0e0f1a',
        tertiary: '#B6BBC4',
        textColor: '#F0ECE5',
        // UniCollab Social Media Colors
        unicollab: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          background: {
            light: '#F8FAFC',
            dark: '#0F172A',
          },
          border: {
            light: '#E2E8F0',
            dark: '#334155',
          },
        },
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        'source-code-pro': ['"Source Code Pro"', 'monospace'],
        'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
      },
      // UniCollab specific utilities
      maxHeight: {
        'post-preview-primary': '15rem', // 60 * 0.25rem = 15rem
        'post-preview-secondary': '8rem', // 32 * 0.25rem = 8rem
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('@fullhuman/postcss-purgecss')],
}

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ['./src/**/*.{html,jsx}'],
//   theme: {
//     extend: {
//       colors: {
//         primary: '#080912',
//         // secondary: '#161A30',
//         secondary: '#0e0f1a',
//         tertiary: '#B6BBC4',
//         textColor: '#F0ECE5',
//       },
//       fontFamily: {
//         sora: ['Sora', 'sans-serif'],
//         'source-code-pro': ['"Source Code Pro"', 'monospace'],
//         'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
//       },
//     },
//   },
//   plugins: [require('@fullhuman/postcss-purgecss')],
// }
