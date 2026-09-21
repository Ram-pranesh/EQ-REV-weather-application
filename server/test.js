const path = require("path");
const result = require("dotenv").config({ path: path.join(__dirname, ".env") });

console.log("Error:", result.error);
console.log("Variable names dotenv found:", Object.keys(result.parsed || {}));
console.log("WEATHER_API_KEY:", process.env.WEATHER_API_KEY ? "YES" : "NO");