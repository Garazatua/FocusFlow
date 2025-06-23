const projectManager = (function () {
    let projects = [];
    return {
        addProject(project){
            projects.push(project);
        },
        deleteProject(id){
            const index = projects.findIndex(project => project.id === id);
            if (index !== -1) projects.splice(index, 1);
            
        },
        getProjectById(id){
            return projects.find(project => project.id === id);
        },
        getAllProjects(){
            return projects;
        }
    }
})();

export default projectManager;