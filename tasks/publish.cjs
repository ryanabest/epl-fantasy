const ghpages = require('gh-pages');

ghpages.publish('dist', {
  repo: 'git@github.com:ryanabest/2024-ta-epl-fantasy.git'
}, (err) => {
  console.log(err);
});
