import './style.css'
const storage = (function() {
    const getProjects = function() {
        if (!localStorage.getItem('projects')) {
            localStorage.setItem('projects', JSON.stringify({}))
        }
        return localStorage.getItem('projects');
    };
    
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