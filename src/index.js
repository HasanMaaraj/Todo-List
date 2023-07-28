import './style.css'
import { compareAsc, format, parseISO } from 'date-fns'


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
                description,
                isComplete: false,
            }
        }

        const AddTask = function(project, title, date, urgency, description) {
            // Create task object and store in localStorage
            const task = taskFactory(title, date, urgency, description);
            const projects = storage.projectStorage.getProjects();
            projects[project].push(task);
            storage.projectStorage.saveProjects(projects);
        }

        const getProjectsTasks = function(project) {
            // Retrieve the project's tasks from the localStorage
            const projects = storage.projectStorage.getProjects();
            const tasks = projects[project]
            return tasks;
        }

        return {AddTask, getProjectsTasks}
    })();

    

    return {taskStorage, projectStorage};
})();

const display = (function(){

    const tasksDisplay = (function(){
        const clearTasksDisplay = function() {
            Array.from(document.querySelector('#tasks-display').childNodes).forEach(node => node.remove());
        }

        const appendTaskDiv = function(project, task) {
            // Create a task div
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task';
            taskDiv.dataset.project = project;
            const index = storage.taskStorage.getProjectsTasks(project).map(task => task.title).indexOf(task.title);
            taskDiv.dataset.index = index;
            // Create and append complete button
            const completeButton = document.createElement('button');
            completeButton.className = 'complete-button';
            completeButton.dataset.project = project;
            completeButton.dataset.index = index;
            completeButton.textContent = task.isComplete ? 'Mark as Uncompleted':'Mark as completed';
            completeButton.addEventListener('click', () => {
                const projects = storage.projectStorage.getProjects();
                const task = projects[completeButton.dataset.project][parseInt(completeButton.dataset.index)];
                if (completeButton.textContent === 'Mark as Uncompleted') {
                    task.isComplete = false;
                } else if (completeButton.textContent === 'Mark as Completed') {
                    task.isComplete = true;
                }
                completeButton.textContent = completeButton.textContent === 'Mark as Uncompleted'? 'Mark as Completed':'Mark as Uncompleted';
                storage.projectStorage.saveProjects(projects);
            })
            taskDiv.appendChild(completeButton);
            // Create and append task title div
            const taskTitle = document.createElement('div');
            taskTitle.textContent = task.title;
            taskTitle.className = 'task-title';
            taskDiv.appendChild(taskTitle);
            // Create and append task date div
            const taskDate = document.createElement('div');
            taskDate.textContent = format(new Date(task.date), 'yyyy-MM-dd');
            taskDate.className = 'task-date';
            taskDiv.appendChild(taskDate);
            // Create and append task urgency div
            const taskUrgency = document.createElement('div');
            taskUrgency.textContent = task.urgency;
            taskUrgency.className = 'task-urgency';
            taskDiv.appendChild(taskUrgency);
            // Create and append delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.dataset.project = project;
            deleteButton.dataset.index = index;
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                const projects = storage.projectStorage.getProjects();
                const project = projects[completeButton.dataset.project];
                project.splice(deleteButton.dataset.index, 1)
                storage.projectStorage.saveProjects(projects);
                displayProjectTasks(completeButton.dataset.project);
            })
            taskDiv.appendChild(deleteButton);
            // Craete and append task descreption div
            const taskDescription = document.createElement('div');
            taskDescription.textContent = task.description;
            taskDescription.className = 'task-description';
            taskDiv.appendChild(taskDescription);
            // append the task div to the .tasks-display div within the #project-display div
            document.querySelector('#tasks-display').appendChild(taskDiv);
        }

        const displayProjectTasks = function(project) {
            clearTasksDisplay();
            // Retrieve project's tasks and loop through them to append each task
            const projectTasks = storage.taskStorage.getProjectsTasks(project);
            const sortedTasks = projectTasks.sort((leftTask, rightTask) => {
                return compareAsc(new Date(leftTask.date), new Date(rightTask.date))
            });
            sortedTasks.forEach(task => {
                appendTaskDiv(project, task)
            });
        }
        return {displayProjectTasks, appendTaskDiv}
    })();


    const projectsDisplay = (function() {
        const popProject = function(project) {
            // Delete chosen item from the list display
            document.querySelector(`li[data-name="${project}"]`).remove();
        }

        const clearProjectDisplay = function() {
            // Clear the #project-display div
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
            // Call a task display function to fill the tasks-display
            tasksDisplay.displayProjectTasks(project)
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
                tasksDisplay.displayProjectTasks(project);
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

    return {projectsDisplay, tasksDisplay}
})();



display.projectsDisplay.displayProject('My Project');
display.tasksDisplay.displayProjectTasks('My Project')


const projectsForm = document.querySelector('#add-project-form');
projectsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const projectTitle = document.querySelector('#project-title').value;
    // Prevent the user from using the same name
    if (projectTitle in storage.projectStorage.getProjects()) return;
    // Add the project on submission and clear the field
    storage.projectStorage.addProject(projectTitle);
    display.projectsDisplay.appendProject(projectTitle)
    document.querySelector('#project-title').value = '';
});

const tasksForm = document.querySelector('#add-task-form');
tasksForm.addEventListener('submit', e => {
    e.preventDefault();
    // Obtain form data
    const taskProject = document.getElementById('new-task-project-name').value;
    const taskTitle = document.getElementById('task-title').value;
    const taskDate = document.getElementById('due-date').value;
    const taskUrgency = document.getElementById('urgency').value;
    const taskDescription = document.getElementById('description').value;
    // Add task to localStorage
    storage.taskStorage.AddTask(taskProject, taskTitle, taskDate, taskUrgency, taskDescription);
    // Add task to tasks-display
    display.tasksDisplay.displayProjectTasks(taskProject);
    console.log(taskTitle, taskDate, taskUrgency, taskDescription)
});
