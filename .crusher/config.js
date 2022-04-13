module.exports = {
  "backend": "https://backend.crusher.dev/",
  "project": 1482,
  "proxy": [
    {
      name: "frontend",
      url: "http://localhost:3000/",
      intercept: "https://app.crusher.dev/**",
    },
    {
      name: "backend",
      url: "http://localhost:8000/",
      intercept: "https://localhost:8000/**",
    }
  ]
}