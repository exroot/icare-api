import { CronjobData } from "../constants/interfaces";

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

export const data: CronjobData = {
  events,
  permissions: permissions(),
  roles,
  categories,
};
