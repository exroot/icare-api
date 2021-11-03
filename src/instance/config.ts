import dotenv from "dotenv";

dotenv.config();

class Config {
  ENV: string = "";
  TESTING: boolean = true;
  DEBUG: boolean = true;
  APP_PORT: number = Number(process.env.APP_PORT);
  DB_DRIVER: string = process.env.DB_DRIVER || "";
  DB_NAME: string = process.env.DB_NAME || "";
  DB_HOST: string = process.env.DB_HOST || "";
  DB_PORT: number = Number(process.env.DB_PORT);
  DB_USER: string = process.env.DB_USER || "";
  DB_PASS: string = process.env.DB_PASS || "";
}

class DevelopmentConfig extends Config {
  ENV = "development";
}

class TestingConfig extends Config {
  ENV = "testing";
}

class ProductionConfig extends Config {
  ENV = "production";
  TESTING: boolean = false;
  DEBUG: boolean = false;
}

const config: any = {
  development: DevelopmentConfig,
  production: ProductionConfig,
  testing: TestingConfig,
};

export { config };
