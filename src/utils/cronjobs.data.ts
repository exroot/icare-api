import { CronjobData } from "../types/interfaces";
import faker from "faker";
import { userInfo } from "os";
import { profile } from "winston";

const events = [
  {
    event: "CREATE",
  },
  {
    event: "READ",
  },
  {
    event: "UPDATE",
  },
  {
    event: "DELETE",
  },
  {
    event: "REGISTER",
  },
  {
    event: "LOGIN",
  },
];

const entities = [
  "POST",
  "COMMENT",
  "PROFILE",
  "CATEGORY",
  "EVENT",
  "EVENTLOG",
  "USER",
  "PERMISSION",
  "ROLE",
];

const permissions = (): string[] => {
  const permutations: any = [];
  entities.forEach((entity: any) => {
    events.forEach((ev) => {
      permutations.push({ permission: `${ev.event} ${entity}` });
    });
  });

  return permutations;
};

const roles = ["Administrador", "Sub-administrador", "Conserje", "Usuario"].map(
  (role) => {
    return {
      role,
    };
  }
);

const categories = [
  "Alzheimer",
  "Tecnologia",
  "Medicina",
  "Noticias",
  "Venezuela",
].map((category) => {
  return {
    category,
  };
});

const users = () => {
  const usrArray = [];
  for (let i = 0; i < 100; i++) {
    let userInfo = {
      email: `usuario${i}@gmail.com`,
      password: `usuario${1}`,
      rol_id: faker.datatype.number({
        max: 4,
        min: 1,
      }),
    };
    usrArray.push(userInfo);
  }
  return usrArray;
};
// const users = [
//   {
//     email: "usuario1@gmail.com",
//     password: "usuario1",
//     rol_id: 4,
//   },
//   {
//     email: "usuario2@gmail.com",
//     password: "usuario2",
//     rol_id: 4,
//   },
//   {
//     email: "usuario3@gmail.com",
//     password: "usuario3",
//     rol_id: 4,
//   },
//   {
//     email: "usuario4@gmail.com",
//     password: "usuario4",
//     rol_id: 4,
//   },
// ];

const profiles = () => {
  const profArrays = [];
  for (let i = 0; i <= 100; i++) {
    const profileInfo = {
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      username: faker.internet.userName(),
      image_avatar: faker.image.imageUrl(),
      image_cover: faker.image.imageUrl(),
    };
    profArrays.push(profileInfo);
  }
  return profArrays;
};
// const profiles = [
//   {
//     first_name: faker.name.firstName(),
//     last_name: faker.name.lastName(),
//     username: faker.internet.userName(),
//     image_avatar: faker.image.imageUrl(),
//     image_cover: faker.image.imageUrl(),
//   },
//   {
//     first_name: faker.name.firstName(),
//     last_name: faker.name.lastName(),
//     username: faker.internet.userName(),
//     image_avatar: faker.image.imageUrl(),
//     image_cover: faker.image.imageUrl(),
//   },
//   {
//     first_name: faker.name.firstName(),
//     last_name: faker.name.lastName(),
//     username: faker.internet.userName(),
//     image_avatar: faker.image.imageUrl(),
//     image_cover: faker.image.imageUrl(),
//   },
//   {
//     first_name: faker.name.firstName(),
//     last_name: faker.name.lastName(),
//     username: faker.internet.userName(),
//     image_avatar: faker.image.imageUrl(),
//     image_cover: faker.image.imageUrl(),
//   },
// ];

const posts = () => {
  const postArr = [];
  for (let i = 1; i <= 300; i++) {
    let postInfo = {
      title: faker.name.title(),
      body: faker.lorem.paragraph(),
      user_id: faker.datatype.number({
        max: 100,
        min: 1,
      }),
      created_at: faker.date.between("2021-01-01", "2022-01-12"),
    };
    postArr.push(postInfo);
  }
  return postArr;
};

export const data: CronjobData = {
  events,
  permissions: permissions(),
  roles,
  categories,
  users: users(),
  profiles: profiles(),
  posts: posts(),
};
