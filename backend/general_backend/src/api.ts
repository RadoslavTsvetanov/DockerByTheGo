import express from "express";
import { dbRepo } from "./db_repo";
import bodyParser from "body-parser";
import { helpers } from "./helpers";

const app = express();

app.use(bodyParser.json());

app.get("/projects", async (req, res) => {
  const result = await dbRepo.projects.getAll();
  return helpers.Requests.succesfulReq(res, result);
});

app.get("/projects/:projectId", async (req, res) => {
  const result = await dbRepo.projects.getById({
    id: Number(req.params.projectId),
  });
  return helpers.Requests.succesfulReq(res, result || {});
});

app.post("/projects", async (req, res) => {
  const { name, userId, usersWithPermissions } = req.body;
  const newProject = await dbRepo.projects.create({
    name,
    userId,
    usersWithPermissions,
  });
  return helpers.Requests.succesfulReq(res, newProject);
});

app.put("/projects/:projectId", async (req, res) => {
  const result = await dbRepo.projects.update({
    id: Number(req.params.projectId),
    data: req.body,
  });
  return helpers.Requests.succesfulReq(res, result);
});

app.delete("/projects/:projectId", async (req, res) => {
  await dbRepo.projects.delete({ id: Number(req.params.projectId) });
  return res.status(204).send();
});

// --- Users CRUD Endpoints ---
app.get("/users", async (req, res) => {
  const result = await dbRepo.user.getAll();
  return helpers.Requests.succesfulReq(res, result);
});

app.get("/users/:userId", async (req, res) => {
  const result = await dbRepo.user.getById({ id: Number(req.params.userId) });
  return helpers.Requests.succesfulReq(res, result || {});
});

app.post("/users", async (req, res) => {
  const { username, password, projects } = req.body;
  const newUser = await dbRepo.user.createUser({
    username,
    password,
    projects,
  });
  return helpers.Requests.succesfulReq(res, newUser);
});

app.put("/users/:userId", async (req, res) => {
  const result = await dbRepo.user.update({
    id: Number(req.params.userId),
    data: req.body,
  });
  return helpers.Requests.succesfulReq(res, result);
});

app.delete("/users/:userId", async (req, res) => {
  await dbRepo.user.delete({ id: Number(req.params.userId) });
  return res.status(204).send();
});

// --- Templates CRUD Endpoints ---
app.get("/templates", async (req, res) => {
  const result = await dbRepo.template.getAll();
  return helpers.Requests.succesfulReq(res, result);
});

app.get("/templates/:name", async (req, res) => {
  const result = await dbRepo.template.getByName({ name: req.params.name });
  return helpers.Requests.succesfulReq(res, result);
});

app.post("/templates", async (req, res) => {
  const { name, content } = req.body.template;
  const newTemplate = await dbRepo.template.create({ name, content });
  return helpers.Requests.succesfulReq(res, newTemplate);
});

app.put("/templates/:templateId", async (req, res) => {
  const result = await dbRepo.template.update({
    id: Number(req.params.templateId),
    data: req.body,
  });
  return helpers.Requests.succesfulReq(res, result);
});

app.delete("/templates/:templateId", async (req, res) => {
  await dbRepo.template.delete({ id: Number(req.params.templateId) });
  return res.status(204).send();
});

// --- Permissions CRUD Endpoints ---
app.get("/permissions", async (req, res) => {
  const result = await dbRepo.permissions.getAll();
  return helpers.Requests.succesfulReq(res, result);
});

app.get("/permissions/:permissionId", async (req, res) => {
  const result = await dbRepo.permissions.getById({
    id: Number(req.params.permissionId),
  });
  return helpers.Requests.succesfulReq(res, result ? result : {});
});

app.post("/permissions", async (req, res) => {
  const { type, roleId, description } = req.body;
  const newPermission = await dbRepo.permissions.create({
    type,
    roleId,
    description,
  });
  return helpers.Requests.succesfulReq(res, newPermission);
});

app.put("/permissions/:permissionId", async (req, res) => {
  const result = await dbRepo.permissions.update({
    id: Number(req.params.permissionId),
    data: req.body,
  });
  return helpers.Requests.succesfulReq(res, result);
});

app.delete("/permissions/:permissionId", async (req, res) => {
  await dbRepo.permissions.delete({ id: Number(req.params.permissionId) });
  return res.status(204).send();
});

// --- Roles CRUD Endpoints ---
app.get("/roles", async (req, res) => {
  const result = await dbRepo.role.getAll();
  return helpers.Requests.succesfulReq(res, result);
});

app.get("/roles/:roleId", async (req, res) => {
  const result = await dbRepo.role.getById({ id: Number(req.params.roleId) });
  return helpers.Requests.succesfulReq(res, result ? result : {});
});

app.post("/roles", async (req, res) => {
  const { name, permissions } = req.body;
  const newRole = await dbRepo.role.create({ name, permissions });
  return helpers.Requests.succesfulReq(res, newRole);
});

app.put("/roles/:roleId", async (req, res) => {
  const result = await dbRepo.role.update({
    id: Number(req.params.roleId),
    data: req.body,
  });
  return helpers.Requests.succesfulReq(res, result);
});

app.delete("/roles/:roleId", async (req, res) => {
  await dbRepo.role.delete({ id: Number(req.params.roleId) });
  return res.status(204).send();
});

// Start the server
app.listen(4000, () => {
  ("Server is running on port 4000");
});
