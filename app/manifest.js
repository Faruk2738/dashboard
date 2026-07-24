export default function manifest() {
  return {
    name: 'AdventureWorks Analytics Hub',
    short_name: 'AdventureWorks',
    description: 'AdventureWorks final project analytics dashboard.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#061a36',
    theme_color: '#082d5c',
    categories: ['business', 'productivity', 'education'],
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
