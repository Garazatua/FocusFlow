import projectManager from './projectManager.js';
import storage from './storage.js';
import currentId from './currentId.js';
import {format} from 'date-fns';

const dom = (function() {
    function showProjectForm() {
        document.querySelector("#create-project").classList.remove("hidden");
        document.querySelector("#add-project-btn").classList.add("hidden");
      }
    
    function resetProjectForm() {
        const form = document.querySelector("#create-project");
        form.classList.add("hidden");
        document.querySelector("#add-project-btn").classList.remove("hidden");
        form.reset();
    }
    function renderProjects(){
        const list = document.querySelector("#project-list");
        list.innerHTML = "";
        const projects = projectManager.getAllProjects();
        const inbox = document.querySelector("#inbox-btn");
        inbox.addEventListener("click", () => {
            document.querySelectorAll(".projects").forEach(btn => {
                btn.classList.remove("active");
            });
            inbox.classList.add("active");
            renderProjectPage(projects[0].id);
        });
        projects.forEach(project => {
            if (project.name === "Inbox")return
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.classList.add("btn", "project-btn", "projects");
            btn.setAttribute("data-id", project.id);
            const projectInfo = document.createElement("span");
            projectInfo.classList.add("project-info");
            const folderIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            folderIcon.setAttribute("viewBox", "0 0 24 24");
            folderIcon.innerHTML = `<path d="M20,18H4V8H20M20,6H12L10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6Z" />`;
            const projectName = document.createElement("span");
            projectName.classList.add("project-name");
            projectName.textContent = project.name;
            const trashIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            trashIcon.classList.add("eliminate-project", "hidden");
            trashIcon.setAttribute("viewBox", "0 0 24 24");
            trashIcon.innerHTML = `<path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />`;
            projectInfo.appendChild(folderIcon);
            projectInfo.appendChild(projectName);
            btn.appendChild(projectInfo);
            btn.appendChild(trashIcon);
            li.appendChild(btn);
            list.appendChild(li);

            btn.addEventListener("mouseenter", () => {
                trashIcon.classList.remove("hidden");
            })

            btn.addEventListener("mouseleave",() => {
                trashIcon.classList.add("hidden");
            })

            btn.addEventListener("click", () => {
                document.querySelectorAll(".projects").forEach(btn => {
                    btn.classList.remove("active");
                });
                btn.classList.add("active");
                renderProjectPage(project.id);
            })

            trashIcon.addEventListener("click", (event) => {
                event.stopPropagation();
                projectManager.deleteProject(project.id);
                storage.saveProjects();
                populateProjectOptions();
                renderProjects();
                renderProjectPage(projectManager.getAllProjects()[0].id)
                inbox.classList.add("active");
            })
        })
    }
    
    function renderProjectPage(projectId){
        currentId.set(projectId);   
        const project = projectManager.getProjectById(projectId);
        const todos = project.todos;
        const title = document.querySelector("#current-view-title");
        title.textContent = "";
        title.textContent = project.name;
        const content = document.querySelector("#todo-list");
        content.innerHTML = "";

        todos.forEach(todo => {

            const listItem = document.createElement("li");
            listItem.classList.add("todo")
            const todoLeft = document.createElement("div");
            todoLeft.classList.add("todo-left");
            const priority = document.createElement("span");
            priority.classList.add("priority");
            if (todo.priority === "low"){
                priority.classList.add("low")
            }
            else if (todo.priority === "medium"){
                priority.classList.add("medium");
            }
            else if(todo.priority === "high") {
                priority.classList.add("high");
            }
            const checkSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            checkSvg.setAttribute("viewBox", "0 0 24 24");
            checkSvg.innerHTML = `<path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />`;
            checkSvg.classList.add("hidden");
            const todoTexts = document.createElement("div");
            todoTexts.classList.add("todo-texts");
            const todoTitle = document.createElement("p");
            todoTitle.classList.add("todo-title");
            todoTitle.textContent = todo.title;
            const todoDate = document.createElement("p");
            todoDate.classList.add("todo-date");
            const date = format(todo.dueDate, "dd/MM/yyyy");
            todoDate.textContent = `Due: ${date}`;
            const todoActions = document.createElement("div");
            todoActions.classList.add("todo-actions");
            const editBtn = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            editBtn.setAttribute("viewBox", "0 0 24 24");
            editBtn.innerHTML = `<path d="M5,3C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19H5V5H12V3H5M17.78,4C17.61,4 17.43,4.07 17.3,4.2L16.08,5.41L18.58,7.91L19.8,6.7C20.06,6.44 20.06,6 19.8,5.75L18.25,4.2C18.12,4.07 17.95,4 17.78,4M15.37,6.12L8,13.5V16H10.5L17.87,8.62L15.37,6.12Z" />`;
            editBtn.classList.add("todo-action");
            editBtn.classList.add("hidden");
            const addBtn = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            addBtn.setAttribute("viewBox", "0 0 24 24");
            addBtn.innerHTML = `<path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />`;
            addBtn.classList.add("todo-action");
            addBtn.classList.add("hidden");
            const deleteTodoBtn = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            deleteTodoBtn.setAttribute("viewBox", "0 0 24 24");
            deleteTodoBtn.innerHTML = `<path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />`;
            deleteTodoBtn.classList.add("todo-action");
            deleteTodoBtn.classList.add("hidden");

            content.appendChild(listItem);
            listItem.appendChild(todoLeft);
            listItem.appendChild(todoActions);
            todoLeft.appendChild(priority);
            todoLeft.appendChild(todoTexts);
            todoActions.appendChild(editBtn);
            todoActions.appendChild(addBtn);
            todoActions.appendChild(deleteTodoBtn);
            priority.appendChild(checkSvg);
            todoTexts.appendChild(todoTitle);
            todoTexts.appendChild(todoDate);

            priority.addEventListener("mouseenter", () =>{
                checkSvg.classList.remove("hidden");
            });

            priority.addEventListener("mouseleave", () => {
                checkSvg.classList.add("hidden");   
            });

            listItem.addEventListener("mouseenter", () => {
                editBtn.classList.remove("hidden");
                addBtn.classList.remove("hidden");
                deleteTodoBtn.classList.remove("hidden");
            });

            listItem.addEventListener("mouseleave", () => {
                editBtn.classList.add("hidden");
                addBtn.classList.add("hidden");
                deleteTodoBtn.classList.add("hidden");
            })
            
        })
    }

    function populateProjectOptions() {
        const select = document.querySelector("#todo-project");
        select.innerHTML = ""; 
      
        const projects = projectManager.getAllProjects();
        projects.forEach(project => {
          const option = document.createElement("option");
          option.value = project.id;
          option.textContent = `📁 ${project.name}`;
          select.appendChild(option);
        });
      }
    function handleTodoForm() {
        const addTaskBtn = document.querySelector("#add-task-btn");
        const secondAddTaskBtn = document.querySelector("#add-task-main-btn");
        const addTaskForm = document.querySelector("#create-todo-dialog");
        const closeTaskForm = document.querySelector("#close-task-form");
        addTaskBtn.addEventListener("click", () => {
            addTaskForm.showModal();
        })
        secondAddTaskBtn.addEventListener("click", () => {
            addTaskForm.showModal();
        })
        closeTaskForm.addEventListener("click", () => {
            addTaskForm.close();
        });
    }


    return {
        showProjectForm,
        resetProjectForm,
        populateProjectOptions,
        renderProjects,
        handleTodoForm,
        renderProjectPage,
    }
})();

export default dom;
