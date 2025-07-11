import createTodo from "./todo.js";
import projectManager from "./projectManager.js";
import storage from "./storage.js";


const todoManager = (function() {
    function getTodoById(todoId, projectId){
        const project = projectManager.getProjectById(projectId);
        if (!project) return null;
        return project.todos.find(todo => todo.id === todoId) || null;
    };

    function getSubtaskById(subtaskId, projectId, parentTodoId) {
        const parent = getTodoById(parentTodoId, projectId);
        if (!parent || !parent.subTasks) return null;
        return parent.subTasks.find(t => t.id === subtaskId) || null;
    }

    function getParentTodoId(subtaskId, projectId) {
        const project = projectManager.getProjectById(projectId);
        if (!project) return null;
    
        for (const todo of project.todos) {
            if (!todo.subTasks) continue;
            const match = todo.subTasks.find(sub => sub.id === subtaskId);
            if (match) return todo.id;
        }
    
        return null;
    }

    function deleteTodo(todoId, projectId, parentTodoId = null){
        if (parentTodoId){
            const parent = getTodoById(parentTodoId, projectId);
            if (!parent || !parent.subTasks) return false;
            const index = parent.subTasks.findIndex(todo => todo.id === todoId);
            if (index === -1) return false;
            parent.subTasks.splice(index, 1);
        }
        else{
            const project = projectManager.getProjectById(projectId);
            if (!project) return false;
            const todoIndex = project.todos.findIndex(todo => todo.id === todoId);
            if (todoIndex === -1) return false;
            project.todos.splice(todoIndex, 1);
        }
        storage.saveProjects();
        return true;
    };
    return {
        createTodoInProject(projectId, title, description, dueDate, priority) {
            const project = projectManager.getProjectById(projectId);
            if (!project) return false;
            const todo = createTodo(title,description,dueDate,priority);
            project.todos.push(todo);
            storage.saveProjects();
            return todo;
        },
        getTodoById,
        deleteTodo,
        getParentTodoId,
        toggleCompleted(todoId, projectId, parentTodoId = null){
            const todo = parentTodoId ? getSubtaskById(todoId, projectId, parentTodoId) : getTodoById(todoId, projectId);
            if (!todo) return false;

            todo.completed = !todo.completed;
            if (!parentTodoId){
               const subtasks = todo.subTasks;
               subtasks.forEach(subtask => {
                subtask.completed = true;
               });
            }
            storage.saveProjects();
            return true;
        },

        editTodo(todoId, projectId, newData, parentTodoId = null){
            const todo = parentTodoId ? getSubtaskById(todoId, projectId, parentTodoId) : getTodoById(todoId, projectId);
            if (!todo) return false;
            todo.title = newData.title;
            todo.description = newData.description;
            todo.dueDate = newData.dueDate;
            todo.priority = newData.priority;

            if (!parentTodoId && newData.projectId && newData.projectId !== projectId){
                const newProject = projectManager.getProjectById(newData.projectId);
                if (!newProject) return false;

                if (!deleteTodo(todoId, projectId)) return false;
                newProject.todos.push(todo);
            }
            storage.saveProjects();
            return true;
        },

        addSubtask(todoId, projectId, subtask){
            const todo = getTodoById(todoId, projectId);
            if (!todo) return false;
            todo.subTasks.push(subtask);
            storage.saveProjects();
            return true;
        }

    };
})();

export default todoManager;