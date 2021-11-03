import express from "express";
import { config } from "./instance/config";
import { createConnection } from "typeorm";
const app = express();

export const createApp = (configInstance: any) => {
  try {
    const appConfig = config[configInstance];
    const { APP_PORT, DB_DRIVER, DB_NAME, DB_HOST, DB_PORT, DB_USER, DB_PASS } =
      new appConfig();
    app.listen(APP_PORT, () => {
      createConnection({
        type: DB_DRIVER,
        host: DB_HOST,
        port: DB_PORT,
        username: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        entities: [__dirname + "/entity/*.ts"],
        synchronize: true,
        logging: false,
      })
        .then((connection) => {
          // here you can start to work with your entities
          console.log("test aaaa");
        })
        .catch((error) => console.log(error));
      console.log(`The application is listening on port ${APP_PORT}!`);
    });
  } catch (err) {
    console.log(err);
  }
};
