import createTodo from "./todo.js";
import projectManager from "./projectManager.js";
import storage from "./storage.js";


const todoManager = (function() {
    function getTodoById(todoId, projectId){
        const project = projectManager.getProjectById(projectId);
        if (!project) return null;
        return project.todos.find(todo => todo.id === todoId) || null;
    };

    function deleteTodo(todoId, projectId){
        const project = projectManager.getProjectById(projectId);
        if (!project) return false;
        const todoIndex = project.todos.findIndex(todo => todo.id === todoId);
        if (todoIndex === -1) return false;
        project.todos.splice(todoIndex, 1);
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
        toggleCompleted(todoId, projectId){
            const todo = getTodoById(todoId, projectId);
            if (!todo) return false;

            todo.completed = !todo.completed;
            storage.saveProjects();
            return true;
        },

        editTodo(todoId, projectId, newData){
            const todo = getTodoById(todoId, projectId);
            if (!todo) return false;
            todo.title = newData.title;
            todo.description = newData.description;
            todo.dueDate = newData.dueDate;
            todo.priority = newData.priority;

            if (newData.projectId && newData.projectId !== projectId){
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