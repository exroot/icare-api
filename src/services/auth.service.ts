import { Repository } from "typeorm";
import { IPermission } from "../types/interfaces";
import jwt from "jsonwebtoken";

export class AuthService {
  protected _userRepository: Repository<any>;
  private readonly _relations: string[];
  constructor(userRepository: Repository<any>) {
    this._userRepository = userRepository;
    this._relations = ["profile", "role", "role.permissions"];
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
    return { accessToken, expiresIn: 3600 };
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
    return user;
  }
}
