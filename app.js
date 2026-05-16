let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

const isDark = localStorage.getItem('theme') === 'dark';
if (isDark) document.body.classList.add('dark');

const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const itemsLeft = document.getElementById('items-left');
const clearCompleted = document.getElementById('clear-completed');
const themeToggle = document.getElementById('theme-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');

// THEME
updateThemeIcon();
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    updateThemeIcon();
});

function updateThemeIcon() {
    themeToggle.querySelector('img').src = document.body.classList.contains('dark')
        ? './images/icon-sun.svg'
        : './images/icon-moon.svg';
}

// ADD TODO
todoInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && todoInput.value.trim()) {
        e.preventDefault();
        todos.push({ id: Date.now(), text: todoInput.value.trim(), completed: false });
        todoInput.value = '';
        saveTodos();
        render();
    }
});

// CREATE ELEMENT
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    li.setAttribute('draggable', true);
    li.dataset.id = todo.id;

    const checkBtn = document.createElement('button');
    checkBtn.className = `todo-check ${todo.completed ? 'checked' : ''}`;
    const checkImg = document.createElement('img');
    checkImg.src = './images/icon-check.svg';
    checkImg.alt = 'check';
    checkBtn.appendChild(checkImg);

    const textSpan = document.createElement('span');
    textSpan.className = `todo-text ${todo.completed ? 'completed' : ''}`;
    textSpan.textContent = todo.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    const deleteImg = document.createElement('img');
    deleteImg.src = './images/icon-cross.svg';
    deleteImg.alt = 'delete';
    deleteBtn.appendChild(deleteImg);

    li.appendChild(checkBtn);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);

    return li;
}

// RENDER
function render() {
    const filtered = todos.filter(t => {
        if (currentFilter === 'active') return !t.completed;
        if (currentFilter === 'completed') return t.completed;
        return true;
    });

    todoList.innerHTML = '';
    filtered.forEach(todo => todoList.appendChild(createTodoElement(todo)));

    const active = todos.filter(t => !t.completed).length;
    itemsLeft.textContent = `${active} item${active !== 1 ? 's' : ''} left`;
}

// EVENT DELEGATION - click
todoList.addEventListener('click', e => {
    const li = e.target.closest('.todo-item');
    if (!li) return;
    const id = Number(li.dataset.id);

    if (e.target.closest('.todo-check')) {
        const t = todos.find(t => t.id === id);
        if (t) { t.completed = !t.completed; saveTodos(); render(); }
    }

    if (e.target.closest('.delete-btn')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        render();
    }
});

// EVENT DELEGATION - drag
let dragSrcId = null;

todoList.addEventListener('dragstart', e => {
    const li = e.target.closest('.todo-item');
    if (!li) return;
    dragSrcId = Number(li.dataset.id);
    setTimeout(() => li.classList.add('dragging'), 0);
});

todoList.addEventListener('dragend', e => {
    const li = e.target.closest('.todo-item');
    if (li) li.classList.remove('dragging');
    updateTodosOrder();
});

todoList.addEventListener('dragover', e => {
    e.preventDefault();
    const dragging = todoList.querySelector('.dragging');
    const target = e.target.closest('.todo-item');
    if (!dragging || !target || dragging === target) return;
    const rect = target.getBoundingClientRect();
    if (e.clientY < rect.top + rect.height / 2) {
        todoList.insertBefore(dragging, target);
    } else {
        todoList.insertBefore(dragging, target.nextSibling);
    }
});

function updateTodosOrder() {
    const items = todoList.querySelectorAll('.todo-item');
    const newOrder = Array.from(items).map(item => Number(item.dataset.id));
    todos.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
    saveTodos();
}

// FILTER
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.filter === currentFilter) return;
        currentFilter = btn.dataset.filter;
        filterBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`[data-filter="${currentFilter}"]`)
            .forEach(b => b.classList.add('active'));
        render();
    });
});

// CLEAR COMPLETED
clearCompleted.addEventListener('click', () => {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    render();
});

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

render();