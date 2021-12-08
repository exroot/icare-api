import { getRepository, Repository } from "typeorm";
import { CronjobData } from "../types/interfaces";
import { Category } from "../entity/Category";
import { Event } from "../entity/Event";
import { Permission } from "../entity/Permission";
import { Profile } from "../entity/Profile";
import { Role } from "../entity/Role";
import { User } from "../entity/User";
import { data } from "../utils/cronjobs.data";
import { Post } from "../entity/Post";

export class CronjobService {
  private _eventRepository: Repository<Event>;
  private _permissionsRepository: Repository<Permission>;
  private _rolesRepository: Repository<Role>;
  private _categoryRepository: Repository<Category>;
  private _userRepository: Repository<User>;
  private _profileRepository: Repository<Profile>;
  private _postRepository: Repository<Post>;
  private _cronjobData: CronjobData;

  constructor() {
    this._eventRepository = getRepository(Event);
    this._permissionsRepository = getRepository(Permission);
    this._rolesRepository = getRepository(Role);
    this._categoryRepository = getRepository(Category);
    this._userRepository = getRepository(User);
    this._profileRepository = getRepository(Profile);
    this._postRepository = getRepository(Post);
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
  async createUsersAndProfiles() {
    const usersInfo = this._userRepository.create(this._cronjobData.users);
    const users = await this._userRepository.save(usersInfo);
    const usersIds = users.map((user) => user.id);
    const profilesWithUserIds = this._cronjobData.profiles.map(
      (profileInfo, index) => {
        return {
          ...profileInfo,
          user_id: usersIds[index],
        };
      }
    );
    this._cronjobData.profiles = profilesWithUserIds;
    const profilesInfo = this._profileRepository.create(
      this._cronjobData.profiles
    );
    const profiles = await this._profileRepository.save(profilesInfo);
    const profilesIds = profiles.map((profile) => profile.id);
    const updatedUsers = users.map((user, index) => {
      return {
        ...user,
        profile_id: profilesIds[index],
      };
    });
    await this._userRepository.save(updatedUsers);
    return true;
  }

  async createPosts() {
    const createPosts = this._postRepository.create(this._cronjobData.posts);
    const posts = await this._postRepository.save(createPosts);
    if (!posts) {
      return false;
    }
    return true;
  }
}
