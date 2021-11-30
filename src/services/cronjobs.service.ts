import { getRepository, Repository } from "typeorm";
import { CronjobData } from "../constants/interfaces";
import { Category } from "../entity/Category";
import { Event } from "../entity/Event";
import { Permission } from "../entity/Permission";
import { Profile } from "../entity/Profile";
import { Role } from "../entity/Role";
import { User } from "../entity/User";
import { data } from "../utils/cronjobs.data";

export class CronjobService {
  private _eventRepository: Repository<Event>;
  private _permissionsRepository: Repository<Permission>;
  private _rolesRepository: Repository<Role>;
  private _categoryRepository: Repository<Category>;
  private _userRepository: Repository<User>;
  private _profileRepository: Repository<Profile>;
  private _cronjobData: CronjobData;

  constructor() {
    this._eventRepository = getRepository(Event);
    this._permissionsRepository = getRepository(Permission);
    this._rolesRepository = getRepository(Role);
    this._categoryRepository = getRepository(Category);
    this._userRepository = getRepository(User);
    this._profileRepository = getRepository(Profile);
    this._cronjobData = data;
  }
  async createEvents() {
    await this._eventRepository
      .createQueryBuilder()
      .insert()
      .into(Event)
      .values(this._cronjobData.events)
      .execute();
    return true;
  }
  async createRoles() {
    await this._rolesRepository
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values(this._cronjobData.roles)
      .execute();
    return true;
  }
  async createPermissions() {
    await this._permissionsRepository
      .createQueryBuilder()
      .insert()
      .into(Permission)
      .values(this._cronjobData.permissions)
      .execute();
    return true;
  }

  async createCategories() {
    await this._categoryRepository
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values(this._cronjobData.categories)
      .execute();
    return true;
  }
  async createRelations() {
    await this._settupRolesPermissions();
    return true;
  }

  private async _settupRolesPermissions() {
    const permissions = await this._permissionsRepository.find();
    const adminRole = await this._rolesRepository.findOne(1);
    if (adminRole) {
      const permissionsIds = permissions.map((p) => p.id);
      await this._rolesRepository
        .createQueryBuilder()
        .relation(Role, "permissions")
        .of(adminRole)
        .add(permissionsIds);
      return true;
    }
  }

  async createAdmin() {
    const userInfo = this._userRepository.create({
      email: "admin@gmail.com",
      password: "password",
      rol_id: 1,
    });
    const user = await this._userRepository.save(userInfo);
    const profile = await this._profileRepository.save({
      first_name: "Administrador",
      last_name: "ACC",
      username: "administrador",
      image_avatar: "",
      image_cover: "",
      user_id: user.id,
    });
    await this._userRepository.update(user.id, {
      ...user,
      profile_id: profile.id,
    });
    return true;
  }
}
