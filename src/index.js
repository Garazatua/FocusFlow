import "./styles.css";
import { setId } from "./currentId.js";
import formHandler from "./formHandler.js";
import dom from "./dom.js";
import createProject from './project.js';
import projectManager from './projectManager.js';
import todoManager from "./todoManager.js";
import storage from './storage.js';

storage.loadProjects();
if (projectManager.getAllProjects().length === 0) {
  const inbox = createProject("Inbox");
  projectManager.addProject(inbox);
  storage.saveProjects();
}
document.addEventListener("DOMContentLoaded", () => {
  const projects = projectManager.getAllProjects();
  const inboxId = projects[0].id;
  dom.renderProjectPage(inboxId);
});

dom.populateProjectOptions();

console.log("Proyectos cargados:", projectManager.getAllProjects());



document.addEventListener("DOMContentLoaded", formHandler.init);
document.addEventListener("DOMContentLoaded", dom.renderProjects());
document.addEventListener("DOMContentLoaded", () => {
  const addProjectBtn = document.querySelector("#add-project-btn");
  const cancelBtn = document.querySelector("#cancel-project-btn");
  addProjectBtn.addEventListener("click", dom.showProjectForm);
  cancelBtn.addEventListener("click", dom.resetProjectForm);
});
document.addEventListener("DOMContentLoaded", dom.handleTodoForm)


