// script.js
const titleInput = document.getElementById('titleInput');
const descInput = document.getElementById('descInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

function createTaskElement(task) {
  const {id, title, description, completed} = task;

  const wrapper = document.createElement('div');
  wrapper.className = 'task';
  wrapper.dataset.id = id;

  const body = document.createElement('div');
  body.className = 'task-body';

  const titleEl = document.createElement('h3');
  titleEl.className = 'task-title';
  titleEl.textContent = title;

  const descEl = document.createElement('p');
  descEl.className = 'task-desc';
  descEl.textContent = description;

  if (completed) wrapper.classList.add('completed');

  body.appendChild(titleEl);
  body.appendChild(descEl);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const completeBtn = document.createElement('button');
  completeBtn.type = 'button';
  completeBtn.textContent = completed ? 'Mark as Incomplete' : 'Mark as Completed';
  completeBtn.addEventListener('click', () => toggleComplete(wrapper, completeBtn));

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => toggleEdit(wrapper, task));

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'warn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteTask(wrapper));

  actions.appendChild(completeBtn);
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  wrapper.appendChild(body);
  wrapper.appendChild(actions);

  return wrapper;
}

function addTaskToDOM(task) {
  const el = createTaskElement(task);
  taskList.prepend(el);
}

function uid() {
  return 't_' + Math.random().toString(36).slice(2,9);
}

addBtn.addEventListener('click', () => {
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  if (!title) { titleInput.focus(); return; }

  const task = { id: uid(), title, description, completed: false };
  addTaskToDOM(task);

  // clear inputs
  titleInput.value = '';
  descInput.value = '';
  titleInput.focus();
});

function toggleComplete(wrapper, button) {
  wrapper.classList.toggle('completed');
  const isCompleted = wrapper.classList.contains('completed');
  button.textContent = isCompleted ? 'Mark as Incomplete' : 'Mark as Completed';
}

function deleteTask(wrapper) {
  wrapper.remove();
}

function toggleEdit(wrapper, taskData) {
  const body = wrapper.querySelector('.task-body');
  const titleEl = body.querySelector('.task-title');
  const descEl = body.querySelector('.task-desc');
  const editBtn = wrapper.querySelector('.task-actions button:nth-child(2)');

  const isEditing = editBtn.textContent === 'Save';

  if (!isEditing) {
    // switch to edit mode
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = titleEl.textContent;
    titleInput.className = 'edit-title';
    titleInput.style.width = '100%';

    const descInput = document.createElement('textarea');
    descInput.value = descEl.textContent;
    descInput.className = 'edit-desc';
    descInput.style.width = '100%';
    descInput.style.minHeight = '60px';

    body.replaceChild(titleInput, titleEl);
    body.replaceChild(descInput, descEl);

    editBtn.textContent = 'Save';
    titleInput.focus();
  } else {
    // save mode
    const newTitleInput = body.querySelector('.edit-title');
    const newDescInput = body.querySelector('.edit-desc');
    const newTitle = newTitleInput.value.trim();
    const newDesc = newDescInput.value.trim();
    if (!newTitle) { newTitleInput.focus(); return; }

    const newTitleEl = document.createElement('h3');
    newTitleEl.className = 'task-title';
    newTitleEl.textContent = newTitle;

    const newDescEl = document.createElement('p');
    newDescEl.className = 'task-desc';
    newDescEl.textContent = newDesc;

    body.replaceChild(newTitleEl, newTitleInput);
    body.replaceChild(newDescEl, newDescInput);

    editBtn.textContent = 'Edit';
  }
}

titleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addBtn.click();
});
