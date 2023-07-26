import './style.css'
const storage = (function() {
    const getProjects = function() {
        if (!localStorage.getItem('projects')) {
            localStorage.setItem('projects', JSON.stringify({}))
        }
        return localStorage.getItem('projects');
    };

    const projectsDisplay = (function() {
        const appendProject = function(project) {
            const projectsList = document.querySelector('#projects');
            const listItem = document.createElement('li')
            listItem.textContent = project.title;
            projectsList.appendChild(listItem);
        }
        const displayProjects = function() {
            const projects = storage.getProjects();
            for (let project in projects){
                appendProject(project)
            }
        }
    })();
    
    const saveProjects = function(projects) {
        localStorage.setItem('projects', JSON.stringify(projects))
    }

    const addProject = function(title) {
        let projects = getProjects();
        projects[title] = [];
        saveProjects(projects);
    }

    const removeProject = function(title) {
        let projects = getProjects();
        delete projects[title]
        saveProjects(projects);
    }

    return {getProjects, addProject, removeProjects}
})();


document.querySelector('#add-project-form').addEventListener('submit', (e) => {
    localStorage.getItem(projects)
    e.preventDefault();
    console.log(projects);
});