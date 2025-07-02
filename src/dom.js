import projectManager from './projectManager.js';
import storage from './storage.js';
import currentId from './currentId.js';
import {format, parse, addDays} from 'date-fns';
import todoManager from './todoManager.js';
import createSubtask from './subtask.js';
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

    function createPrioritySelect(value, isDisabled = false) {
        const select = document.createElement("select");
        select.setAttribute("id", "todo-priority");
        if (isDisabled) select.disabled = true;
    
        const options = [
            { value: "low", text: "🟢 Low" },
            { value: "medium", text: "🟡 Medium" },
            { value: "high", text: "🔴 High" },
        ];
    
        options.forEach(opt => {
            const option = document.createElement("option");
            option.value = opt.value;
            option.textContent = opt.text;
            select.appendChild(option);
        });
    
        select.value = value;
        return select;
    }

    function createDueDateInput(date, isDisabled = false) {
        const input = document.createElement("input");
        input.type = "date";
        input.value = format(date, "yyyy-MM-dd");
        input.min = validateTodoForm(); 
        input.setAttribute("id", "todo-date");
        if (isDisabled) input.disabled = true;
        return input;
    }

    function renderExpandedTodoView(listItem, todo, projectId, isEditable = false, isSubtask = false, isSubtaskForm = false) {
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
        todoLabel.textContent = "Due:";
        const todoDate = createDueDateInput(todo.dueDate);
    
        const secondLabel = document.createElement("label");
        const todoLabel2 = document.createElement("span");
        todoLabel2.classList.add("todo-label");
        todoLabel2.textContent = "Priority:";
        const selectTodoPriority = createPrioritySelect(todo.priority);
    
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
    
        const editButton = document.createElement("button");
        editButton.classList.add("edit-btn");
        editButton.type = "button";
        editButton.textContent = "Edit";
    
        const saveButton = document.createElement("button");
        saveButton.classList.add("edit-btn", "hidden");
        saveButton.type = "submit";
        saveButton.textContent = "Save";
    

        todoTitleExpanded.disabled = !isEditable;
        todoDescription.disabled = !isEditable;
        todoDate.disabled = !isEditable;
        selectTodoPriority.disabled = !isEditable;
        todoProject.disabled = !isEditable;


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
        todoExpandedActions.appendChild(todoProject);
        todoExpandedActions.appendChild(editBtnContainer);
        editBtnContainer.appendChild(backBtn);
        editBtnContainer.appendChild(editButton);
        editBtnContainer.appendChild(saveButton);
    
        populateProjectOptions();
        todoProject.value = projectId;
        if (isEditable) {
            todoDate.min = validateTodoForm();
            editButton.classList.add("hidden");
            saveButton.classList.remove("hidden");
        }
        if (isSubtask){
            todoProject.classList.add("hidden");
            todoExpandedActions.classList.remove("todo-expanded-actions");
            todoExpandedActions.classList.add("subtask-expanded-actions");
        }

        if(isSubtaskForm){
            todoForm.reset();
            todoTitleExpanded.placeholder = "Subtask Title";
            todoDescription.placeholder = "Subtask Description"
        }
    
    
        return {
            todoForm,
            todoTitleExpanded,
            todoDescription,
            todoDate,
            selectTodoPriority,
            todoProject,
            editButton,
            saveButton,
            backBtn
        };
    }
    
    function createTodoListItem(todo, projectId, isSubtask = false) {
        const listItem = document.createElement("li");
        listItem.classList.add("todo");
    
        const todoLeft = document.createElement("div");
        todoLeft.classList.add("todo-left");
    
        const priority = document.createElement("span");
        priority.classList.add("priority", todo.priority);
        
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
        const formatted = format(todo.dueDate, "dd/MM/yyyy");
        todoDate.textContent = `Due: ${formatted}`;
    
        const todoActions = document.createElement("div");
        todoActions.classList.add("todo-actions");
    
        const editBtn = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        editBtn.setAttribute("viewBox", "0 0 24 24");
        editBtn.innerHTML = `<path d="M5,3C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19H5V5H12V3H5M17.78,4C17.61,4 17.43,4.07 17.3,4.2L16.08,5.41L18.58,7.91L19.8,6.7C20.06,6.44 20.06,6 19.8,5.75L18.25,4.2C18.12,4.07 17.95,4 17.78,4M15.37,6.12L8,13.5V16H10.5L17.87,8.62L15.37,6.12Z" />`;
        editBtn.classList.add("todo-action", "hidden");
    
        const addBtn = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        addBtn.setAttribute("viewBox", "0 0 24 24");
        addBtn.innerHTML = `<path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />`;
        addBtn.classList.add("todo-action", "hidden");

        const deleteBtn = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        deleteBtn.setAttribute("viewBox", "0 0 24 24");
        deleteBtn.innerHTML = `<path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />`;
        deleteBtn.classList.add("todo-action", "hidden");
    
        listItem.dataset.todoId = todo.id;
        listItem.dataset.projectId = projectId;
    
        listItem.appendChild(todoLeft);
        listItem.appendChild(todoActions);
        todoLeft.appendChild(priority);
        priority.appendChild(checkSvg);
        todoLeft.appendChild(todoTexts);
        todoTexts.appendChild(todoTitle);
        todoTexts.appendChild(todoDate);
        todoActions.appendChild(editBtn);
        todoActions.appendChild(addBtn);
        todoActions.appendChild(deleteBtn);
        
        priority.addEventListener("mouseenter", () =>{
            checkSvg.classList.remove("hidden");
        });

        priority.addEventListener("mouseleave", () => {
            checkSvg.classList.add("hidden");   
        });

        listItem.addEventListener("mouseenter", () => {
            editBtn.classList.remove("hidden");
            if(!isSubtask) addBtn.classList.remove("hidden");
            deleteBtn.classList.remove("hidden");
        });

        listItem.addEventListener("mouseleave", () => {
            editBtn.classList.add("hidden");
            addBtn.classList.add("hidden");
            deleteBtn.classList.add("hidden");
        });

        if (!isSubtask){
            priority.addEventListener('click', (event) => {
                event.stopPropagation();
                todoManager.toggleCompleted(todo.id, projectId);
                renderProjectPage(projectId);
            });

            deleteBtn.addEventListener("click", (event) => { 
                event.stopPropagation();
                todoManager.deleteTodo(todo.id, projectId);
                renderProjectPage(projectId);
            });

            addBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                renderSubtaskForm(todo, listItem, projectId);
            });

            let isEditing = false;
            editBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                isEditing = true;
                const {todoForm, todoTitleExpanded, todoDescription, todoDate, selectTodoPriority, todoProject, editButton, saveButton, backBtn} = renderExpandedTodoView(listItem, todo, projectId, true);
    
                backBtn.addEventListener("click", () => {
                    isEditing = false;
                    todoForm.reset();
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
    
                const { todoForm, todoTitleExpanded, todoDescription, todoDate, selectTodoPriority, todoProject, editButton, saveButton, backBtn } = renderExpandedTodoView(listItem, todo, projectId);               
    
                backBtn.addEventListener("click", () => {
                    isEditing = false;
                    todoForm.reset();
                    renderProjectPage(projectId);
                });
    
                editButton.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    todoTitleExpanded.disabled = false;
                    todoDescription.disabled = false;
                    todoDate.disabled = false;
                    todoDate.min = validateTodoForm();
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

        else {
            listItem.classList.add("sub");
            const parentTodoId = todoManager.getParentTodoId(todo.id, projectId);
            deleteBtn.addEventListener("click", (event) => { 
                event.stopPropagation();
                todoManager.deleteTodo(todo.id, projectId, parentTodoId );
                renderProjectPage(projectId);
            });
            priority.addEventListener('click', (event) => {
                event.stopPropagation();
                todoManager.toggleCompleted(todo.id, projectId, parentTodoId);
                renderProjectPage(projectId);
            });

            let isEditing = false;
            editBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                isEditing = true;
                const {todoForm, todoTitleExpanded, todoDescription, todoDate, selectTodoPriority, todoProject, editButton, saveButton, backBtn} = renderExpandedTodoView(listItem, todo, projectId, true, true);
    
                backBtn.addEventListener("click", () => {
                    isEditing = false;
                    todoForm.reset();
                    renderProjectPage(projectId);
                });
    
    
                todoForm.addEventListener("submit", (event) => {
                    event.preventDefault();
                    const title = todoTitleExpanded.value;
                    const description = todoDescription.value;
                    const rawData = todoDate.value;
                    const dueDate = parse(rawData, "yyyy-MM-dd", new Date());
                    const priority = selectTodoPriority.value;
                    const newData = {
                        title: title,
                        description: description,
                        dueDate: dueDate,
                        priority: priority,
                    };                    
                    todoManager.editTodo(todo.id, projectId, newData, parentTodoId);
                    isEditing = false;
                    renderProjectPage(projectId);
                });
            
            });

            listItem.addEventListener("click", (event) => {
                event.stopPropagation();
                if (isEditing) return;
    
                const { todoForm, todoTitleExpanded, todoDescription, todoDate, selectTodoPriority, todoProject, editButton, saveButton, backBtn } = renderExpandedTodoView(listItem, todo, projectId, false, true);               
    
                backBtn.addEventListener("click", () => {
                    isEditing = false;
                    todoForm.reset();
                    renderProjectPage(projectId);
                });
    
                editButton.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    todoTitleExpanded.disabled = false;
                    todoDescription.disabled = false;
                    todoDate.disabled = false;
                    todoDate.min = validateTodoForm();
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
                    const newData = {
                        title: title,
                        description: description,
                        dueDate: dueDate,
                        priority: priority,
                    };                    
                    todoManager.editTodo(todo.id, projectId, newData, parentTodoId);
                    isEditing = false;
                    editButton.classList.remove("hidden");
                    saveButton.classList.add("hidden");
                    renderProjectPage(projectId);
                });
            });
        }
        return listItem;
    }

    function renderSubtaskForm(todo, listItem, projectId) {
        const subtaskContainer = document.createElement("div");
        subtaskContainer.classList.add("subtask-form-container", "sub");
    
        const {
            todoForm,
            todoTitleExpanded,
            todoDescription,
            todoDate,
            selectTodoPriority,
            todoProject,
            editButton,
            saveButton,
            backBtn
        } = renderExpandedTodoView(subtaskContainer, todo, projectId, true, true, true)
    
    
        backBtn.addEventListener("click", () => {
            subtaskContainer.remove();
        });
    
        todoForm.addEventListener("submit", (event) => {
            event.preventDefault();
    
            const title = todoTitleExpanded.value;
            const description = todoDescription.value;
            const rawData = todoDate.value;
            const dueDate = parse(rawData, "yyyy-MM-dd", new Date());
            const priority = selectTodoPriority.value;
    
            const subtask = createSubtask(title, description, dueDate, priority);
    
            todoManager.addSubtask(todo.id, projectId, subtask);
            subtaskContainer.remove();
            console.log(todo);
            renderProjectPage(projectId);
        });
    
        listItem.insertAdjacentElement("afterend", subtaskContainer);
    }

    function renderCompletedTask(todo, project, parentTodo = null){
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
        todoProject.textContent = parentTodo ?  `Main Task: ${parentTodo.title}`: `Project: ${project.name}`;

        listItem.appendChild(todoLeft);
        todoLeft.appendChild(userSvg);
        todoLeft.appendChild(todoTexts);
        todoTexts.appendChild(todoTitle);
        todoTitle.appendChild(completedTask);
        todoTexts.appendChild(todoProject);

        return listItem;
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
                    const subTasks = todo.subTasks;
                    if (!subTasks) return;
                    subTasks.forEach(subtask => {
                        if (!subtask.completed) return;
                        else {
                            const completedSubtask = renderCompletedTask(subtask, project, todo);
                            content.appendChild(completedSubtask);
                        }
                    });
                }
                else if (todo.completed) {
                    const completedTask = renderCompletedTask(todo, project)
                    content.appendChild(completedTask);
                    const subTasks = todo.subTasks;
                    if (!subTasks) return;
                    subTasks.forEach(subtask => {
                        if (!subtask.completed) return;
                        else {
                            const completedSubtask = renderCompletedTask(subtask, project, todo);
                            content.appendChild(completedSubtask);
                        }
                    });
                }
                else return;
            });
        });
    };

    function renderTodo(todo, projectId){
        const content = document.querySelector("#todo-list");
        if (!todo.completed){
            const listItem = createTodoListItem(todo, projectId);
            content.appendChild(listItem);
            if (todo.subTasks && todo.subTasks.length > 0){
                todo.subTasks.forEach(subtask => {
                    if (!subtask.completed){
                        const subItem = createTodoListItem(subtask, projectId, true);
                        content.appendChild(subItem);
                    }
                });
            }
        }
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
            renderTodo(todo, projectId);
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
        const form = document.querySelector("#create-todo");
        const closeTaskForm = document.querySelector("#close-task-form");
        addTaskBtn.addEventListener("click", () => {
            const projects = projectManager.getAllProjects();
            const inboxId = projects[0].id;
            todoProject.value = inboxId;
            addTaskForm.showModal();
            validateTodoForm();
        })
        secondAddTaskBtn.addEventListener("click", () => {
            const projectId = currentId.get();
            todoProject.value = projectId;
            addTaskForm.showModal();
            validateTodoForm();
        })
        closeTaskForm.addEventListener("click", () => {
            form.reset()
            addTaskForm.close();
        });
    }

    function validateTodoForm() {
        const tomorrow = addDays(new Date(), 1);
        const formattedTomorrow = format(tomorrow, "yyyy-MM-dd");;
        const dueDateInput = document.querySelector("#todo-date");
        dueDateInput.min = formattedTomorrow;
        return formattedTomorrow;
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
