module.exports = {
  apps: [{
    name: 'Chithi',
    script: './build/app.js',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT
    },
    instances: 2, watch: true, ignore_watch: ['./storage/*', '.git/*'], attach: true
  }]
};