import projectManager from './projectManager.js';
import storage from './storage.js';
import currentId from './currentId.js';
import {format, parse} from 'date-fns';
import todoManager from './todoManager.js';
import createTodo from './todo.js';

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

    function renderCompletedPage(){
        const title = document.querySelector("#current-view-title");
        const addTask = document.querySelector("#add-task-main-btn");
        addTask.classList.add("hidden");
        title.textContent = "";
        title.textContent = "Tasks completed";
        const content = document.querySelector("#todo-list");
        content.innerHTML = "";
        const projects = projectManager.getAllProjects();
        
        projects.forEach(project => {
            const todos = project.todos;
            todos.forEach(todo => {
                if (!todo.completed) {
                    return;
                }
                else if (todo.completed) {
                    const listItem = document.createElement("li");
                    listItem.classList.add("completed-todo");
                    const todoLeft = document.createElement("div");
                    todoLeft.classList.add("todo-left");
                    const userSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    userSvg.setAttribute("viewBox", "0 0 24 24");
                    userSvg.setAttribute("width", "3rem");
                    userSvg.innerHTML = `<path d="M21.1,12.5L22.5,13.91L15.97,20.5L12.5,17L13.9,15.59L15.97,17.67L21.1,12.5M11,4A4,4 0 0,1 15,8A4,4 0 0,1 11,12A4,4 0 0,1 7,8A4,4 0 0,1 11,4M11,6A2,2 0 0,0 9,8A2,2 0 0,0 11,10A2,2 0 0,0 13,8A2,2 0 0,0 11,6M11,13C11.68,13 12.5,13.09 13.41,13.26L11.74,14.93L11,14.9C8.03,14.9 4.9,16.36 4.9,17V18.1H11.1L13,20H3V17C3,14.34 8.33,13 11,13Z" />`;
                    const todoTexts = document.createElement("div");
                    todoTexts.classList.add("todo-texts");
                    const todoTitle = document.createElement("p");
                    todoTitle.classList.add("todo-title");
                    todoTitle.textContent = "You completed a task: ";
                    const completedTask = document.createElement("span");
                    completedTask.classList.add("completed-task");
                    completedTask.textContent = todo.title;
                    const todoProject = document.createElement("p");
                    todoProject.classList.add("todo-date");
                    todoProject.textContent = `Project: ${project.name}`;

                    content.appendChild(listItem);
                    listItem.appendChild(todoLeft);
                    todoLeft.appendChild(userSvg);
                    todoLeft.appendChild(todoTexts);
                    todoTexts.appendChild(todoTitle);
                    todoTitle.appendChild(completedTask);
                    todoTexts.appendChild(todoProject);

                }
                else return;
            });
        });
    };
    function renderProjects(){
        const list = document.querySelector("#project-list");
        list.innerHTML = "";
        const projects = projectManager.getAllProjects();
        const inbox = document.querySelector("#inbox-btn");
        const completed = document.querySelector("#completed-btn");
        inbox.addEventListener("click", () => {
            document.querySelectorAll(".projects").forEach(btn => {
                btn.classList.remove("active");
            });
            inbox.classList.add("active");
            renderProjectPage(projects[0].id);
        });

        completed.addEventListener("click", () => {
            document.querySelectorAll(".projects").forEach(btn => {
                btn.classList.remove("active");
            });
            completed.classList.add("active");
            renderCompletedPage();
        })

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
                completed.classList.remove("active");
                inbox.classList.add("active");
            })
        })
    }
    
    function renderProjectPage(projectId){
        currentId.set(projectId);   
        const addTask = document.querySelector("#add-task-main-btn");
        addTask.classList.remove("hidden");
        const project = projectManager.getProjectById(projectId);
        const todos = project.todos;
        const title = document.querySelector("#current-view-title");
        title.textContent = "";
        title.textContent = project.name;
        const content = document.querySelector("#todo-list");
        content.innerHTML = "";

        todos.forEach(todo => {
            if (!todo.completed){
            const listItem = document.createElement("li");
            listItem.classList.add("todo");
            const todoLeft = document.createElement("div");
            todoLeft.classList.add("todo-left");
            const priority = document.createElement("span");
            priority.classList.add("priority");
            if (todo.priority === "low"){
                priority.classList.add("low");
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
            deleteTodoBtn.setAttribute("data-id", todo.id);

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

            priority.addEventListener('click', (event) => {
                event.stopPropagation();
                todoManager.toggleCompleted(todo.id, projectId);
                renderProjectPage(projectId);
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

            deleteTodoBtn.addEventListener("click", (event) => { 
                event.stopPropagation();
                todoManager.deleteTodo(todo.id, projectId);
                renderProjectPage(projectId);
            })

            let isEditing = false;
            editBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                isEditing = true;
                listItem.innerHTML = "";
                listItem.classList.remove("todo");
                const todoForm = document.createElement("form");
                todoForm.classList.add("todo-form");
                const todoExtended = document.createElement("div");
                todoExtended.classList.add("todo-extended");
                const todoTitleExpanded = document.createElement("textarea");
                todoTitleExpanded.classList.add("todo-title-expanded");
                todoTitleExpanded.value = todo.title;
                const todoDescription = document.createElement("textarea");
                todoDescription.classList.add("todo-description");
                todoDescription.value = todo.description;
                const todoOptions = document.createElement("div");
                todoOptions.classList.add("todo-options");
                const firstLabel = document.createElement("label");
                const todoLabel = document.createElement("span");
                todoLabel.classList.add("todo-label");
                todoLabel.textContent = "Due:"
                const todoDate = document.createElement("input");
                todoDate.type = "date";
                const date = format(todo.dueDate, "yyyy-MM-dd");
                todoDate.value = date;
                todoDate.setAttribute("id", "todo-date");
                const secondLabel = document.createElement("label");
                const todoLabel2 = document.createElement("span");
                todoLabel2.classList.add("todo-label");
                todoLabel2.textContent = "Priority:";
                const selectTodoPriority = document.createElement("select");
                selectTodoPriority.setAttribute("id", "todo-priority");
                const low = document.createElement("option");
                low.value = "low";
                low.text = "🟢 Low";
                const medium = document.createElement("option");
                medium.value = "medium";
                medium.text = "🟡 Medium";
                const high = document.createElement("option");
                high.value = "high";
                high.text = "🔴 High";
                const todoExpandedActions = document.createElement("div");
                todoExpandedActions.classList.add("todo-expanded-actions");
                const todoProject = document.createElement("select");
                todoProject.classList.add("project-select");
                todoProject.id = "todo-project2";

                const editBtnContainer = document.createElement("div");
                editBtnContainer.classList.add("edit-btn-container");
                const backBtn = document.createElement("button");
                backBtn.classList.add("back-btn");
                backBtn.type = "button";
                backBtn.textContent = "Back";
                const saveButton = document.createElement("button");
                saveButton.type = "submit";
                saveButton.textContent = "Save";
                saveButton.classList.add("edit-btn");

                listItem.appendChild(todoForm);
                todoForm.appendChild(todoExtended);
                todoExtended.appendChild(todoTitleExpanded);
                todoExtended.appendChild(todoDescription);
                todoExtended.appendChild(todoOptions);
                todoExtended.appendChild(todoExpandedActions);
                todoOptions.appendChild(firstLabel);
                firstLabel.appendChild(todoLabel);
                firstLabel.appendChild(todoDate);
                todoOptions.appendChild(secondLabel);
                secondLabel.appendChild(todoLabel2);
                secondLabel.appendChild(selectTodoPriority);
                selectTodoPriority.appendChild(low);
                selectTodoPriority.appendChild(medium);
                selectTodoPriority.appendChild(high);
                selectTodoPriority.value = todo.priority;
                todoExpandedActions.appendChild(todoProject);
                todoExpandedActions.appendChild(editBtnContainer);
                editBtnContainer.appendChild(backBtn);
                editBtnContainer.appendChild(saveButton);
                populateProjectOptions();
                todoProject.value = projectId;

                backBtn.addEventListener("click", () => {
                    isEditing = false;
                    renderProjectPage(projectId);
                });


                todoForm.addEventListener("submit", (event) => {
                    event.preventDefault();
                    const title = todoTitleExpanded.value;
                    const description = todoDescription.value;
                    const rawData = todoDate.value;
                    const dueDate = parse(rawData, "yyyy-MM-dd", new Date());
                    const priority = selectTodoPriority.value;
                    const project = todoProject.value;
                    const newData = {
                        title: title,
                        description: description,
                        dueDate: dueDate,
                        priority: priority,
                        projectId: project,
                    };                    
                    todoManager.editTodo(todo.id, projectId, newData);
                    isEditing = false;
                    renderProjectPage(projectId);
                });
            
            });
      
            listItem.addEventListener("click", (event) => {
                event.stopPropagation();
                if (isEditing) return;
                listItem.innerHTML = "";
                listItem.classList.remove("todo");
                const todoForm = document.createElement("form");
                todoForm.classList.add("todo-form");
                const todoExtended = document.createElement("div");
                todoExtended.classList.add("todo-extended");
                const todoTitleExpanded = document.createElement("textarea");
                todoTitleExpanded.classList.add("todo-title-expanded");
                todoTitleExpanded.value = todo.title;
                todoTitleExpanded.disabled = true;
                const todoDescription = document.createElement("textarea");
                todoDescription.classList.add("todo-description");
                todoDescription.value = todo.description;
                todoDescription.disabled = true;
                const todoOptions = document.createElement("div");
                todoOptions.classList.add("todo-options");
                const firstLabel = document.createElement("label");
                const todoLabel = document.createElement("span");
                todoLabel.classList.add("todo-label");
                todoLabel.textContent = "Due:"
                const todoDate = document.createElement("input");
                todoDate.type = "date";
                const date = format(todo.dueDate, "yyyy-MM-dd");
                todoDate.value = date;
                todoDate.setAttribute("id", "todo-date");
                todoDate.disabled = true;
                const secondLabel = document.createElement("label");
                const todoLabel2 = document.createElement("span");
                todoLabel2.classList.add("todo-label");
                todoLabel2.textContent = "Priority:";
                const selectTodoPriority = document.createElement("select");
                selectTodoPriority.setAttribute("id", "todo-priority");
                selectTodoPriority.disabled = true;
                const low = document.createElement("option");
                low.value = "low";
                low.text = "🟢 Low";
                const medium = document.createElement("option");
                medium.value = "medium";
                medium.text = "🟡 Medium";
                const high = document.createElement("option");
                high.value = "high";
                high.text = "🔴 High";
                const todoExpandedActions = document.createElement("div");
                todoExpandedActions.classList.add("todo-expanded-actions");
                const todoProject = document.createElement("select");
                todoProject.classList.add("project-select");
                todoProject.id = "todo-project2";
                todoProject.disabled = true;

                const editBtnContainer = document.createElement("div");
                editBtnContainer.classList.add("edit-btn-container");
                const backBtn = document.createElement("button");
                backBtn.classList.add("back-btn");
                backBtn.type = "button";
                backBtn.textContent = "Back";
                const editButton = document.createElement("button");
                editButton.classList.add("edit-btn");
                editButton.type = "button";
                editButton.textContent = "Edit";
                const saveButton = document.createElement("button");
                saveButton.type = "submit";
                saveButton.textContent = "Save";
                saveButton.classList.add("edit-btn", "hidden");

                listItem.appendChild(todoForm);
                todoForm.appendChild(todoExtended);
                todoExtended.appendChild(todoTitleExpanded);
                todoExtended.appendChild(todoDescription);
                todoExtended.appendChild(todoOptions);
                todoExtended.appendChild(todoExpandedActions);
                todoOptions.appendChild(firstLabel);
                firstLabel.appendChild(todoLabel);
                firstLabel.appendChild(todoDate);
                todoOptions.appendChild(secondLabel);
                secondLabel.appendChild(todoLabel2);
                secondLabel.appendChild(selectTodoPriority);
                selectTodoPriority.appendChild(low);
                selectTodoPriority.appendChild(medium);
                selectTodoPriority.appendChild(high);
                selectTodoPriority.value = todo.priority;
                todoExpandedActions.appendChild(todoProject);
                todoExpandedActions.appendChild(editBtnContainer);
                editBtnContainer.appendChild(backBtn);
                editBtnContainer.appendChild(editButton);
                editBtnContainer.appendChild(saveButton);
                populateProjectOptions();
                todoProject.value = projectId;

                backBtn.addEventListener("click", () => {
                    isEditing = false;
                    renderProjectPage(projectId);
                });

                editButton.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    todoTitleExpanded.disabled = false;
                    todoDescription.disabled = false;
                    todoDate.disabled = false;
                    selectTodoPriority.disabled = false;
                    selectTodoPriority.value = todo.priority;
                    todoProject.disabled = false;
                    isEditing = true;
                    editButton.classList.add("hidden");
                    saveButton.classList.remove("hidden");
                });

                todoForm.addEventListener("submit", (event) => {
                    event.preventDefault();
                    const title = todoTitleExpanded.value;
                    const description = todoDescription.value;
                    const rawData = todoDate.value;
                    const dueDate = parse(rawData, "yyyy-MM-dd", new Date());
                    const priority = selectTodoPriority.value;
                    const project = todoProject.value;
                    const newData = {
                        title: title,
                        description: description,
                        dueDate: dueDate,
                        priority: priority,
                        projectId: project,
                    };                    
                    todoManager.editTodo(todo.id, projectId, newData);
                    isEditing = false;
                    editButton.classList.remove("hidden");
                    saveButton.classList.add("hidden");
                    renderProjectPage(projectId);
                });
            });
        }
        });
    }

    function populateProjectOptions() {
        const selects = document.querySelectorAll(".project-select");
        selects.forEach(select => select.innerHTML = "");
    
        const projects = projectManager.getAllProjects();
        selects.forEach(select => {
            projects.forEach(project => {
                const option = document.createElement("option");
                option.value = project.id;
                option.textContent = `📁 ${project.name}`;
                select.appendChild(option);
            });
        });
    }
    function handleTodoForm() {
        const addTaskBtn = document.querySelector("#add-task-btn");
        const todoProject = document.querySelector("#todo-project");
        const secondAddTaskBtn = document.querySelector("#add-task-main-btn");
        const addTaskForm = document.querySelector("#create-todo-dialog");
        const closeTaskForm = document.querySelector("#close-task-form");
        addTaskBtn.addEventListener("click", () => {
            const projects = projectManager.getAllProjects();
            const inboxId = projects[0].id;
            todoProject.value = inboxId;
            addTaskForm.showModal();
        })
        secondAddTaskBtn.addEventListener("click", () => {
            const projectId = currentId.get();
            todoProject.value = projectId;
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
