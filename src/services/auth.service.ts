import { getRepository, Repository } from "typeorm";
import { IPermission } from "../types/interfaces";
import jwt from "jsonwebtoken";
import { EventLog } from "../entity/EventLog";
import { User } from "../entity/User";

export class AuthService {
  protected _userRepository: Repository<any>;
  private readonly _relations: string[];
  private readonly _bitacoraRepo: Repository<EventLog>;
  constructor(userRepository: Repository<any>) {
    this._userRepository = getRepository(User);
    this._relations = ["profile", "role", "role.permissions"];
    this._bitacoraRepo = getRepository(EventLog);
  }

  async registered(identifier: string): Promise<boolean> {
    const user = await this._userRepository.findOne({
      where: [
        {
          email: identifier,
        },
      ],
    });

    return !!user;
  }

  async validCredentials(credentials: any): Promise<boolean> {
    const { password, email } = credentials;
    const user = await this._userRepository.findOne({
      where: [
        {
          email,
        },
      ],
      select: ["password"],
    });
    if (!user) {
      return false;
    }
    return user.comparePassword(password);
  }

  async register(data: any): Promise<any> {
    /* to trigger the hashing password method, an entity instance is needed, thats why .create() method is called */
    const userInfo = await this._userRepository.create({
      email: data.email,
      password: data.password,
    });
    const { password, ...user } = await this._userRepository.save(userInfo);
    const bitacoraRecord = this._bitacoraRepo.create({
      event_id: 5,
      module: "USER",
      user_id: user.id,
    });

    // Insertar record en tabla bitacora
    await this._bitacoraRepo.save(bitacoraRecord);

    return user;
  }

  async makeToken(identifier: string): Promise<object> {
    const user = await this._userRepository.findOne({
      where: [
        {
          email: identifier,
        },
      ],
      relations: this._relations,
    });
    const permissions = user.role.permissions as IPermission[];

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.role,
      permissions: permissions.map((p) => p.permission),
      profile: user.profile,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || "", {
      expiresIn: "8h",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET || "", {
      expiresIn: "32h",
    });

    const bitacoraRecord = this._bitacoraRepo.create({
      event_id: 6,
      module: "USER",
      user_id: user.id,
    });

    // Insertar record en tabla bitacora
    await this._bitacoraRepo.save(bitacoraRecord);

    return {
      tokens: { access: accessToken, refresh: refreshToken },
    };
  }

  async getUser(token: string): Promise<any> {
    let payload: any;
    jwt.verify(token, process.env.JWT_SECRET || "", (err, decodedToken) => {
      if (err) {
        return;
      }
      payload = decodedToken;
    });
    const user = await this._userRepository.findOne(payload.id, {
      relations: this._relations,
    });

    const permissions = user.role.permissions as IPermission[];
    const newPayload = {
      id: user.id,
      email: user.email,
      role: user.role.role,
      permissions: permissions.map((p) => p.permission),
      profile: user.profile,
    };
    const accessToken = jwt.sign(newPayload, process.env.JWT_SECRET || "", {
      expiresIn: "8h",
    });
    const refreshToken = jwt.sign(newPayload, process.env.JWT_SECRET || "", {
      expiresIn: "32h",
    });

    return { ...user, access: accessToken, refresh: refreshToken };
  }

  async changePassword(new_password: string, email: string) {
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      return false;
    }
    user.password = new_password;
    const userUpdated = await userRepo.save(user);
    return userUpdated;
  }

  async disableAccount(email: string) {
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (user) {
      await userRepo.softDelete(user.id);
      return user;
    }
  }
}
