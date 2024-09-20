import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dbRepo = {
  user: {
    // User methods
    async createUser(params: {
      username: string;
      password: string;
      projects: string[];
    }) {
      const { username, password, projects } = params;
      return await prisma.user.create({
        data: { username, password, projects },
      });
    },

    async getById(params: { id: number }) {
      return await prisma.user.findUnique({ where: { id: params.id } });
    },

    async getAll() {
      return await prisma.user.findMany();
    },

    async update(params: {
      id: number;
      data: Partial<{ username: string; password: string; projects: string[] }>;
    }) {
      const { id, data } = params;
      return await prisma.user.update({
        where: { id },
        data,
      });
    },

    async delete(params: { id: number }) {
      return await prisma.user.delete({ where: { id: params.id } });
    },
  },

  permissions: {
    async create(params: {
      type: string;
      roleId: number;
      description: string;
    }) {
      const { type, roleId, description } = params;
      return await prisma.permission.create({
        data: { type, roleId, description },
      });
    },

    async getById(params: { id: number }) {
      return await prisma.permission.findUnique({ where: { id: params.id } });
    },

    async getAll() {
      return await prisma.permission.findMany();
    },

    async update(params: {
      id: number;
      data: Partial<{ type: string; roleId: number; description: string }>;
    }) {
      const { id, data } = params;
      return await prisma.permission.update({
        where: { id },
        data,
      });
    },

    async delete(params: { id: number }) {
      return await prisma.permission.delete({ where: { id: params.id } });
    },
  },

  role: {
    async create(params: { name: string; permissions: number[] }) {
      const { name, permissions } = params;
      return await prisma.role.create({
        data: {
          name,
          permissions: { connect: permissions.map((id) => ({ id })) },
        },
      });
    },

    async getById(params: { id: number }) {
      return await prisma.role.findUnique({
        where: { id: params.id },
        include: { permissions: true },
      });
    },

    async getAll() {
      return await prisma.role.findMany({ include: { permissions: true } });
    },

    async update(params: {
      id: number;
      data: Partial<{ name: string; permissions: number[] }>;
    }) {
      const { id, data } = params;
      return await prisma.role.update({
        where: { id },
        data: {
          ...data,
          permissions: data.permissions
            ? { set: data.permissions.map((id) => ({ id })) }
            : undefined,
        },
      });
    },

    async delete(params: { id: number }) {
      return await prisma.role.delete({ where: { id: params.id } });
    },
  },

  projects: {
    async create(params: {
      name: string;
      userId: number;
      usersWithPermissions: any;
    }) {
      const { name, userId, usersWithPermissions } = params;
      return await prisma.project.create({
        data: { name, userId, usersWithPermissions },
      });
    },

    async getById(params: { id: number }) {
      return await prisma.project.findUnique({ where: { id: params.id } });
    },

    async getAll() {
      return await prisma.project.findMany();
    },

    async update(params: {
      id: number;
      data: Partial<{
        name: string;
        userId: number;
        usersWithPermissions: any;
      }>;
    }) {
      const { id, data } = params;
      return await prisma.project.update({
        where: { id },
        data,
      });
    },

    async delete(params: { id: number }) {
      return await prisma.project.delete({ where: { id: params.id } });
    },
  },

  template: {
    async create(params: { name: string; content: object; projectId: number }) {
      const { name, content, projectId } = params;
      return await prisma.template.create({
        data: { name, content, projectId },
      });
    },

    async getById(params: { id: number }) {
      return await prisma.template.findUnique({ where: { id: params.id } });
    },

    async getAll() {
      return await prisma.template.findMany();
    },

    async update(params: {
      id: number;
      data: Partial<{ name: string; content: string; projectId: number }>;
    }) {
      const { id, data } = params;
      return await prisma.template.update({
        where: { id },
        data,
      });
    },

    async delete(params: { id: number }) {
      return await prisma.template.delete({ where: { id: params.id } });
    },
  },
};
