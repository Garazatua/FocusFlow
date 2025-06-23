import projectManager from './projectManager.js';

const dom = (function() {
    function showProjectForm() {
        document.querySelector("#create-project").classList.remove("hidden");
        document.querySelector("#show-project-form-btn").classList.add("hidden");
      }
    
      function cancelProjectForm() {
        const form = document.querySelector("#create-project");
        form.classList.add("hidden");
        document.querySelector("#show-project-form-btn").classList.remove("hidden");
        form.reset();
      }
    
    
    function populateProjectOptions() {
        const select = document.querySelector("#todo-project");
        select.innerHTML = ""; 
      
        const projects = projectManager.getAllProjects();
        projects.forEach(project => {
          const option = document.createElement("option");
          option.value = project.id;
          option.textContent = project.name;
          select.appendChild(option);
        });
      }
    return {
        showProjectForm,
        cancelProjectForm,
        populateProjectOptions
    }
})();

export default dom;
