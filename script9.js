class KanbanBoard {
    constructor() {
        this.columns = this.loadData() || [
            { id: 'todo', title: 'To Do', tasks: [] },
            { id: 'inprogress', title: 'In Progress', tasks: [] },
            { id: 'done', title: 'Done', tasks: [] }
        ];
        this.nextId = 1;
        this.init();
    }

    init() {
        this.board = document.getElementById('board');
        this.addColumnBtn = document.getElementById('addColumnBtn');
        this.render();
        this.bindEvents();
    }

    render() {
        this.board.innerHTML = '';
        this.columns.forEach(column => {
            const colElement = this.createColumn(column);
            this.board.appendChild(colElement);
        });
    }

    createColumn(column) {
        const col = document.createElement('div');
        col.className = 'column';
        col.dataset.columnId = column.id;
        col.draggable = true;
        col.innerHTML = `
            <div class="column-header">
                <div class="column-title" contenteditable="true">${column.title}</div>
                <div class="column-count">${column.tasks.length}</div>
                <button class="delete-column" title="Delete Column">×</button>
            </div>
            <button class="add-task">+ Add Task</button>
            <div class="task-list"></div>
        `;
        
        const taskList = col.querySelector('.task-list');
        column.tasks.forEach(task => {
            taskList.appendChild(this.createTask(task));
        });

        return col;
    }

    createTask(task) {
        const taskEl = document.createElement('div');
        taskEl.className = `task priority-${task.priority}`;
        taskEl.draggable = true;
        taskEl.dataset.taskId = task.id;
        taskEl.innerHTML = `
            <div class="task-content" contenteditable="true">${task.content}</div>
            <div class="task-meta">
                <span>${new Date(task.created).toLocaleDateString()}</span>
                <button class="delete-task">×</button>
            </div>
        `;
        return taskEl;
    }

    bindEvents() {
        this.addColumnBtn.addEventListener('click', () => this.addColumn());
        
        this.board.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-task')) {
                this.addTask(e.target.parentNode.dataset.columnId);
            } else if (e.target.classList.contains('delete-task')) {
                this.deleteTask(e.target.closest('.task').dataset.taskId);
            } else if (e.target.classList.contains('delete-column')) {
                this.deleteColumn(e.target.closest('.column').dataset.columnId);
            }
        });

        // Auto-expand task content
        this.board.addEventListener('input', (e) => {
            if (e.target.classList.contains('task-content')) {
                this.handleTaskContentInput(e.target);
            } else if (e.target.classList.contains('column-title')) {
                this.saveData();
            }
        });

        this.board.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('task-content')) {
                e.target.closest('.task').classList.add('expanded');
            }
        });

        this.board.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('task-content')) {
                e.target.closest('.task').classList.remove('expanded');
            }
            this.saveData();
        });

        // Drag and drop
        this.board.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task') || e.target.classList.contains('column')) {
                e.target.classList.add('dragging');
            }
        });

        this.board.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });

        this.board.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.board.addEventListener('drop', (e) => {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            if (dragging && dragging.classList.contains('task')) {
                this.handleTaskDrop(e, dragging);
            }
        });
    }

    handleTaskContentInput(contentEl) {
        contentEl.style.height = 'auto';
        contentEl.style.height = contentEl.scrollHeight + 'px';
        
        const taskEl = contentEl.closest('.task');
        taskEl.style.height = 'auto';
        taskEl.style.maxHeight = '400px';
        
        const columnEl = taskEl.closest('.column');
        const countEl = columnEl.querySelector('.column-count');
        const columnId = columnEl.dataset.columnId;
        const column = this.columns.find(col => col.id === columnId);
        countEl.textContent = column.tasks.length;
    }

    addColumn() {
        const title = prompt('Column title:') || 'New Column';
        const id = `col${Date.now()}`;
        this.columns.push({ id, title, tasks: [] });
        this.render();
        this.saveData();
    }

    deleteColumn(columnId) {
        if (confirm('Delete this column and all its tasks?')) {
            this.columns = this.columns.filter(col => col.id !== columnId);
            this.render();
            this.saveData();
        }
    }

    addTask(columnId) {
        const content = prompt('Task description:') || 'New Task';
        const task = {
            id: `task${Date.now()}${this.nextId++}`,
            content,
            priority: 'medium',
            created: new Date().toISOString()
        };
        
        const column = this.columns.find(col => col.id === columnId);
        column.tasks.push(task);
        this.render();
        this.saveData();
    }

    deleteTask(taskId) {
        this.columns.forEach(col => {
            col.tasks = col.tasks.filter(task => task.id !== taskId);
        });
        this.render();
        this.saveData();
    }

    handleTaskDrop(e, taskEl) {
        const columnEl = e.target.closest('.column');
        if (columnEl) {
            const columnId = columnEl.dataset.columnId;
            const taskId = taskEl.dataset.taskId;
            
            this.columns.forEach(col => {
                col.tasks = col.tasks.filter(task => task.id !== taskId);
            });
            
            const column = this.columns.find(col => col.id === columnId);
            const taskData = this.columns.flatMap(col => col.tasks).find(t => t.id === taskId);
            if (taskData) {
                column.tasks.push(taskData);
            }
            
            this.render();
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('kanban9', JSON.stringify(this.columns));
    }

    loadData() {
        const data = localStorage.getItem('kanban9');
        return data ? JSON.parse(data) : null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new KanbanBoard();
});
