import express, { json, urlencoded } from "express";
import { config } from "./instance/config";
import { createConnection } from "typeorm";
import cors from "cors";
import router from "./routes/base.routes";
import { Category } from "./entity/Category";
import { Comment } from "./entity/Comment";
import { Event } from "./entity/Event";
import { EventLog } from "./entity/EventLog";
import { Following } from "./entity/Following";
import { Permission } from "./entity/Permission";
import { Post } from "./entity/Post";
import { Profile } from "./entity/Profile";
import { Role } from "./entity/Role";
import { User } from "./entity/User";

const app = express();

export const createApp = (configInstance: any) => {
  try {
    const appConfig = config[configInstance];
    const { API_PORT, DB_DRIVER, DB_NAME, DB_HOST, DB_PORT, DB_USER, DB_PASS } =
      new appConfig();
    app.use(urlencoded({ extended: true }));
    app.use(json());
    app.use(cors());
    app.use(router);
    app.use("/images", express.static(__dirname + "/../static/images"));
    app.listen(process.env.PORT || API_PORT, () => {
      createConnection({
        type: DB_DRIVER,
        host: DB_HOST,
        port: DB_PORT,
        username: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        entities: [
          Category,
          Comment,
          Event,
          EventLog,
          Following,
          Permission,
          Post,
          Profile,
          Role,
          User,
        ],
        synchronize: true,
        logging: false,
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      })
        .then(async (connection) => {
          await connection.synchronize();
          // here you can start to work with your entities
          console.log("Database instantiated");
        })
        .catch((error) => console.log(error));
      console.log(
        `The application is listening on port ${process.env.PORT || API_PORT}!`
      );
    });
  } catch (err) {
    console.log(err);
  }
};
