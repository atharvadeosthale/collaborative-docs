import { Express } from "express";

export const setupExpressServer = async (app: Express) => {
  app.get("/", (req, res) => {
    res.json("Things working!");
  });
};
