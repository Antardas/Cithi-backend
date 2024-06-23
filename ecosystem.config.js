module.exports = {
  apps: [{
    name: 'Chithi',
    script: './build/app.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 5, watch: true, ignore_watch: ['./storage/*', '.git/*'], attach: true
  }]
};