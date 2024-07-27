// 
import { PrismaClient, User, Project } from "@prisma/client";

export class Database {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  
  async createUser(username: string, password: string): Promise<User> {
    return this.prisma.user.create({
      data: { username, password },
    });
  }

  
  async getUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { projects: true }, 
    });
  }

  
  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: { projects: true }, 
    });
  }

  
  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  
  async deleteUser(userId: number): Promise<User> {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  
  async createProject(name: string, userId: number): Promise<Project> {
    return this.prisma.project.create({
      data: { name, userId },
    });
  }

  async getProjectById(projectId: number): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id: projectId },
    });
  }

  
  async getAllProjects(): Promise<Project[]> {
    return this.prisma.project.findMany();
  }

  async updateProject(
    projectId: number,
    data: Partial<Project>
  ): Promise<Project> {
    return this.prisma.project.update({
      where: { id: projectId },
      data,
    });
  }

  async deleteProject(projectId: number): Promise<Project> {
    return this.prisma.project.delete({
      where: { id: projectId },
    });
  }
}
