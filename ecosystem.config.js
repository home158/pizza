module.exports = {
  apps : [{
    name   : "pizza",
    script : "node server.js",
    autorestart: true,
    instances:1
  }]
}
