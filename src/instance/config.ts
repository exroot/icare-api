import dotenv from "dotenv";

dotenv.config();

class Config {
  ENV: string = "development";
  TESTING: boolean = false;
  DEBUG: boolean = false;
  PORT: number = 80;
}

class DevelopmentConfig extends Config {
  ENV = "development";
  DEBUG = true;
  TESTING = true;
  PORT = 3000;
}

class ProductionConfig extends Config {
  ENV = "production";
  DEBUG = false;
  TESTING = true;
  PORT = 80;
}

const config: any = {
  development: DevelopmentConfig,
  production: ProductionConfig,
};

export { config };
