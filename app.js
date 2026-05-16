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
    const dark = document.body.classList.contains('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    updateThemeIcon();
});

function updateThemeIcon() {
    const dark = document.body.classList.contains('dark');
    themeToggle.querySelector('img').src = dark
        ? './images/icon-sun.svg'
        : './images/icon-moon.svg';
}

// ADD TODO
todoInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && todoInput.value.trim()) {
        todos.push({ id: Date.now(), text: todoInput.value.trim(), completed: false });
        todoInput.value = '';
        saveTodos();
        render();
    }
});

// RENDER
function render() {
    const filtered = todos.filter(t => {
        if (currentFilter === 'active') return !t.completed;
        if (currentFilter === 'completed') return t.completed;
        return true;
    });

    todoList.innerHTML = '';
    filtered.forEach(todo => {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        li.setAttribute('draggable', true);
        li.dataset.id = todo.id;
        li.innerHTML = `
      <button class="todo-check ${todo.completed ? 'checked' : ''}">
        <img src="./images/icon-check.svg" alt="check" />
      </button>
      <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
      <button class="delete-btn">
        <img src="./images/icon-cross.svg" alt="delete" />
      </button>
    `;

        li.querySelector('.todo-check').addEventListener('click', () => {
            const t = todos.find(t => t.id === todo.id);
            t.completed = !t.completed;
            saveTodos();
            render();
        });

        li.querySelector('.delete-btn').addEventListener('click', () => {
            todos = todos.filter(t => t.id !== todo.id);
            saveTodos();
            render();
        });

        todoList.appendChild(li);
    });

    const active = todos.filter(t => !t.completed).length;
    itemsLeft.textContent = `${active} item${active !== 1 ? 's' : ''} left`;

    setupDragAndDrop();
}

// FILTER
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
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

// SAVE
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// DRAG AND DROP
function setupDragAndDrop() {
    const items = todoList.querySelectorAll('.todo-item');
    let dragSrc = null;

    items.forEach(item => {
        item.addEventListener('dragstart', () => {
            dragSrc = item;
            setTimeout(() => item.classList.add('dragging'), 0);
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            updateTodosOrder();
        });
        item.addEventListener('dragover', e => {
            e.preventDefault();
            const dragging = todoList.querySelector('.dragging');
            if (dragging && dragging !== item) {
                const rect = item.getBoundingClientRect();
                const mid = rect.top + rect.height / 2;
                if (e.clientY < mid) {
                    todoList.insertBefore(dragging, item);
                } else {
                    todoList.insertBefore(dragging, item.nextSibling);
                }
            }
        });
    });
}

function updateTodosOrder() {
    const items = todoList.querySelectorAll('.todo-item');
    const newOrder = Array.from(items).map(item => parseInt(item.dataset.id));
    todos.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
    saveTodos();
}

render();