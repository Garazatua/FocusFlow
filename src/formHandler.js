import dom from './dom.js'
import createProject from './project.js';
import projectManager from './projectManager.js';
import todoManager from "./todoManager.js";
import storage from './storage.js';
import {format, parse} from 'date-fns';
import currentId from './currentId.js';


const formHandler = (function() {
    const createProjectForm = document.querySelector("#create-project");
    const createTodoForm = document.querySelector("#create-todo");
    
    function submitProjectForm(event){
        event.preventDefault();
        const name = document.querySelector("#name").value;
        const newProject = createProject(name);
        projectManager.addProject(newProject);
        storage.saveProjects();
        dom.populateProjectOptions();
        dom.renderProjects();
        dom.resetProjectForm();
    }
    function submitTodoForm(event){
        event.preventDefault();
        const dialog = document.querySelector("#create-todo-dialog");
        const title = document.querySelector("#todo-title").value;
        const description = document.querySelector("#todo-description").value;
        const rawData = document.querySelector("#todo-date").value;
        console.log(rawData);
        const dueDate = parse(rawData, "yyyy-MM-dd", new Date());
        console.log(dueDate);
        const priority = document.querySelector("#todo-priority").value;
        const projectId = document.querySelector("#todo-project").value;

        const todo = todoManager.createTodoInProject(projectId, title, description, dueDate, priority);
        if (todo){
            console.log("TODO created", todo);
            createTodoForm.reset();
            dialog.close();
            const currentProjectId = currentId.get();
            if (currentProjectId === projectId){
            dom.renderProjectPage(projectId);
            }
        }
        else {
            console.error("No se pudo crear el TODO");
        }

    }

    function init(){
        createProjectForm.addEventListener("submit", submitProjectForm);
        createTodoForm.addEventListener("submit", submitTodoForm );
    }


    
    return {init};    
})();

export default formHandler;