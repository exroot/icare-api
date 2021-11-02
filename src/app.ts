import express from "express";
import { config } from "./instance/config";

const app = express();

export const createApp = (configInstance: any) => {
  try {
    const appConfig = config[configInstance];
    const appEnv = new appConfig();
    console.log("APP ENV: ", appEnv);
  } catch (err) {
    console.log(err);
  }
};

app.listen(3000, () => {
  console.log("The application is listening on port 3000!");
});
