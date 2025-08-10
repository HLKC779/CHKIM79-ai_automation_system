export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Add CSS optimization plugins for production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          colormin: true,
          minifyFontValues: true,
          minifySelectors: true,
        }]
      }
    })
  },
}