import projectManager from './projectManager.js';
import storage from './storage.js';

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
        projects.forEach(project => {
            if (project.name === "Inbox") return;
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.classList.add("btn", "project-btn");
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

            btn.addEventListener("mouseover", () => {
                trashIcon.classList.remove("hidden");
            })

            btn.addEventListener("mouseleave",() => {
                trashIcon.classList.add("hidden");
            })

            trashIcon.addEventListener("click", () => {
                projectManager.deleteProject(project.id);
                storage.saveProjects();
                renderProjects();
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
          option.textContent = project.name;
          select.appendChild(option);
        });
      }
    return {
        showProjectForm,
        resetProjectForm,
        populateProjectOptions,
        renderProjects
    }
})();

export default dom;
