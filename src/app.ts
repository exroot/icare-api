import express from "express";
import { config } from "./instance/config";

const app = express();

export const createApp = (configInstance: any) => {
  try {
    const appConfig = config[configInstance];
    const { PORT } = new appConfig();
    app.listen(PORT, () => {
      console.log(`The application is listening on port ${PORT}!`);
    });
  } catch (err) {
    console.log(err);
  }
};
