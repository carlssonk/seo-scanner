import express, { Request, Response } from "express";
import { isDevelopment } from "./utils/utils.js";
import { init } from "./utils/init.js";

if (isDevelopment) {
  const app = express();
  const PORT = 8080;

  interface Query {
    url: string;
  }

  app.get("/api/audit", async (req: Request<{}, {}, {}, Query>, res: Response) => {
    const { url } = req.query;
    const data = await init(url);

    res.json({ data });
  });

  app.listen(PORT, () => console.log(`${PORT} LISTENING...`));
}
