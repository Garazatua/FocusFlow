function createProject(name, id = crypto.randomUUID()){
    return {
        name, 
        id,
        todos: []
    };
}

export default createProject;