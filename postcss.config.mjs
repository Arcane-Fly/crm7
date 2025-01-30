export default {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {
      flexbox: 'no-2009',
      grid: 'autoplace',
    },
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': false,
        'custom-properties': false,
        'color-function': true,
        'custom-media-queries': true,
      },
      autoprefixer: {
        grid: true,
      },
    },
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: [
              'default',
              {
                discardComments: {
                  removeAll: true,
                },
                minifyFontValues: {
                  removeQuotes: false,
                },
              },
            ],
          },
        }
      : {}),
  },
};
