import app from "./app.ts";
import dotenv from "dotenv";
import { Admin } from "./models/Admin.ts";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(5000, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
