import dotenv from "dotenv";

dotenv.config();

class Config {
  ENV: string = "development";
  TESTING: boolean = false;
  DEBUG: boolean = false;
}

class DevelopmentConfig extends Config {
  ENV = "development";
  DEBUG = true;
  TESTING = true;
}

class ProductionConfig extends Config {
  ENV = "production";
  DEBUG = false;
  TESTING = true;
}

const config: any = {
  development: DevelopmentConfig,
  production: ProductionConfig,
};

export { config };
