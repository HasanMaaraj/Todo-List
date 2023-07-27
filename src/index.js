import './style.css'



const storage = (function() {

    const projectStorage = (function(){
        
        const getProjects = function() {
            // If there is no local storage create one with default project
            if (!localStorage.getItem('projects')) {
                localStorage.setItem('projects', JSON.stringify({'My Project':[]}));
            }
            // Return the local storage projects
            return JSON.parse(localStorage.getItem('projects'));
        };
        
        const saveProjects = function(projects) {
            // Save the projects
            localStorage.setItem('projects', JSON.stringify(projects));
        }
        const removeProject = function(title) {
            // Delete the project
            let projects = getProjects();
            delete projects[title];
            saveProjects(projects);
        }
        
        const addProject = function(title) {
            // Add a project to the projects object and save it
            let projects = getProjects();
            projects[title] = [];
            saveProjects(projects);
        }
    
        return {getProjects, addProject, removeProject, saveProjects};

    })();


    const taskStorage = (function(){
        const taskFactory = function(title, date, urgency, description) {
            return {
                title,
                date: new Date(date),
                urgency,
                description
            }
        }

        const AddTask = function(project, title, date, urgency, description) {
            const task = taskFactory(title, date, urgency, description);
            const projects = storage.projectStorage.getProjects();
            projects[project].push(task);
            storage.projectStorage.saveProjects(projects);
        }

        const getProjectsTasks = function(project) {
            const projects = storage.projectStorage.getProjects();
            const tasks = projects[project]
            return tasks;
        }

    })();

    

    return {taskStorage, projectStorage};
})();

const display = (function(){

    const projectsDisplay = (function() {
        const popProject = function(project) {
            // Delete chosen item from the list display
            document.querySelector(`li[data-name="${project}"]`).remove();
        }

        const clearProjectDisplay = function() {
            const projectDisplay = document.querySelector('#project-display');
            Array.from(projectDisplay.childNodes).forEach(node => {
                node.remove();
            });
        }

        const displayProject = function(project) {
            clearProjectDisplay();
            const projectDisplay = document.querySelector('#project-display');
            const projectHeader = document.createElement('h3');
            projectHeader.textContent = project;
            projectHeader.className = 'project-header';
            document.querySelector('#new-task-project-name').value = project;
            projectDisplay.appendChild(projectHeader);
        }

        const appendProject = function(project) {
            // Create a list item and append it the projects list
            const projectsList = document.querySelector('#projects');
            const listItem = document.createElement('li');
            listItem.dataset.name = project;
            listItem.textContent = project;
            // Add delete buttons to projects other than the default project
            if (project !== "My Project"){
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-button';
                deleteButton.dataset.name = project;
                listItem.appendChild(deleteButton);
                deleteButton.addEventListener('click', e => {
                    e.stopPropagation();
                    if (document.querySelector('.project-header').textContent === project) {
                        displayProject('My Project');
                    }
                    storage.projectStorage.removeProject(project);
                    popProject(project);
                })
            }
            listItem.addEventListener('click', () => {
                displayProject(project);
            })
            projectsList.appendChild(listItem);
        }

        
        const displayProjects = (function() {
            // Loop through the projects and append each one
            const projects = storage.projectStorage.getProjects();
            for (let project in projects){
                appendProject(project);
            }
        })();
        
        return {appendProject, displayProject};
    })();

    return {projectsDisplay}
})();



display.projectsDisplay.displayProject('My Project');

document.querySelector('#add-project-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const projectTitle = document.querySelector('#project-title').value;
    // Prevent the user from using the same name
    if (projectTitle in storage.projectStorage.getProjects()) return;
    // Add the project on submission and clear the field
    storage.projectStorage.addProject(projectTitle);
    display.projectsDisplay.appendProject(projectTitle)
    document.querySelector('#project-title').value = '';
});