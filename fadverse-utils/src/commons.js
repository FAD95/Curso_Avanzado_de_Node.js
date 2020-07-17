'use strict'

module.exports = {
  database: process.env.DB_NAME || 'fadverse',
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASS || 'arianna',
  host: process.env.DB_HOST || 'localhost',
  endpoint: process.env.API_ENDPOINT || 'http://localhost:3000/api',
  apiToken:
    process.env.API_TOKEN ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkZhZCIsImFkbWluIjp0cnVlLCJwZXJtaXNzaW9ucyI6WyJtZXRyaWNzOnJlYWQiXSwiaWF0IjoxNTk0ODU0NjU2fQ.F4mq6UwJi64sub0qMhXMjjc5osuCB8RfRAAwJLQT0o8',
}