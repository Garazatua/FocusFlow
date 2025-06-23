import projectManager from './projectManager.js';

const storage = (function () {
    function saveProjects() {
        const projects = projectManager.getAllProjects();
        localStorage.setItem("projects", JSON.stringify(projects));
    }
  
    function loadProjects() {
        const raw = localStorage.getItem('projects');
        if (!raw) return;
        const parsedData = JSON.parse(raw);
        parsedData.forEach(project => {
            projectManager.addProject(project);
        });
    }
  
    return {
      saveProjects,
      loadProjects,
    };
  })();
  
  export default storage;