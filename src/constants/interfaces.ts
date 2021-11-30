export interface IPermission {
  id?: number;
  permission?: string;
  roles?: IRole[];
}

export interface IRole {
  id?: number;
  role?: string;
  users?: IUser[];
  permissions?: IPermission[];
}

export interface IProfile {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  image_avatar?: string;
  image_cover?: string;
  follower_count?: number;
  following_count?: number;
  user_id?: number;
  user?: IUser;
}

export interface IUser {
  id?: number;
  email?: string;
  password?: string;
  profile_id?: number;
  profile?: IProfile;
  rol_id?: number;
  role?: IRole;
  comparePassword(password: string): Promise<boolean>;
}

export interface ICategory {
  id?: number;
  category?: string;
  posts?: IPost[];
}

export interface IPost {
  id?: number;
  title?: string;
  body?: string;
  comments?: Comment[];
  categories?: ICategory[];
  user_id?: number;
  user?: IUser;
}

export interface IComment {
  id?: number;
  body?: string;
  post_id?: number;
  post?: IPost;
  user_id?: number;
  user?: IUser;
}

export interface IEvent {
  id?: number;
  body?: string;
}

export interface IEventLog {
  id?: number;
  module?: string;
  event_id?: number;
  event?: IEvent;
  user_id?: number;
  user?: IUser;
}

export interface CronjobData {
  events: Object[];
  permissions: Object[];
  roles: Object[];
  categories: Object[];
}
