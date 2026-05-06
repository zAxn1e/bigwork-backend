require("dotenv").config();
require("module-alias/register");

const app = require("@/app");
const {
  port
} = require("@/config/env");

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Docs is running on http://localhost:${port}/docs`);
  console.log(`OpenAPI is running on http://localhost:${port}/openapi.json`);
});
