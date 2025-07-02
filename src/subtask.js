function createSubtask(title, description, dueDate, priority, id = crypto.randomUUID() ) {
    return {
        title,
        description,
        dueDate,
        priority,
        completed: false,
        id,
    };
}

export default createSubtask;