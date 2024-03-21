import { Express } from "express";

export const setupExpressServer = (app: Express) => {
  app.get("/", (req, res) => {
    res.json("Things working!");
  });
};
