import "./styles.css";
import { setId } from "./currentId.js";
import formHandler from "./formHandler.js";
import createProject from './project.js';
import projectManager from './projectManager.js';
import todoManager from "./todoManager.js";
import storage from './storage.js';

storage.loadProjects();
console.log("Proyectos cargados:", projectManager.getAllProjects());

if (projectManager.getAllProjects().length === 0) {
  const inbox = createProject("Inbox");
  projectManager.addProject(inbox);
  storage.saveProjects();
}

document.addEventListener("DOMContentLoaded", formHandler.init);

