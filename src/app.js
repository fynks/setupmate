class SetupMate {
    constructor() {
        this.currentPlatform = 'arch';
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.editingIndex = -1;
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.initializeElements();
        this.initializeData();
        this.bindEvents();
        this.applyTheme();
        this.render();
    }

    initializeElements() {
        // Platform elements
        this.platformButtons = document.querySelectorAll('.platform-btn');
        
        // Checklist elements
        this.checklistContainer = document.getElementById('checklist');
        this.emptyState = document.getElementById('emptyState');
        
        // Progress elements
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');
        
        // Form elements
        this.addItemModal = document.getElementById('addItemModal');
        this.addItemForm = document.getElementById('addItemForm');
        this.newItemInput = document.getElementById('newItem');
        this.stepCategorySelect = document.getElementById('stepCategory');
        this.quickAddBtn = document.getElementById('quickAddBtn');
        this.modalClose = document.getElementById('modalClose');
        this.cancelAdd = document.getElementById('cancelAdd');
        
        // Control elements
        this.resetButton = document.getElementById('resetButton');
        this.exportButton = document.getElementById('exportButton');
        this.importFile = document.getElementById('importFile');
        this.shareButton = document.getElementById('shareButton');
        
        // Search elements
        this.searchToggle = document.getElementById('searchToggle');
        this.searchContainer = document.getElementById('searchContainer');
        this.searchInput = document.getElementById('searchInput');
        this.searchClear = document.getElementById('searchClear');
        
        // Filter elements
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // Theme elements
        this.themeToggle = document.getElementById('themeToggle');
        
        // Stats elements
        this.totalSteps = document.getElementById('totalSteps');
        this.completedSteps = document.getElementById('completedSteps');
        this.pendingSteps = document.getElementById('pendingSteps');
        this.progressPercentage = document.getElementById('progressPercentage');
        
        // Platform counts
        this.platformCounts = {
            arch: document.getElementById('archCount'),
            android: document.getElementById('androidCount'),
            windows: document.getElementById('windowsCount')
        };
        
        // Notifications
        this.notificationContainer = document.getElementById('notifications');
    }

    initializeData() {
        this.defaultChecklists = {
            arch: [
                { text: 'Backup Downloads', completed: false, category: 'backup' },
                { text: 'Install Manjaro KDE', completed: false, category: 'installation' },
                { text: 'Run setup Script', completed: false, category: 'configuration' },
                { text: 'Uninstall KDE Connect, Kate etc', completed: false, category: 'configuration' },
                { text: 'Reboot after running Script', completed: false, category: 'configuration' },
                { text: 'Login to Ente-Auth AppImage', completed: false, category: 'login' },
                { text: 'Login to Bitwarden Browser', completed: false, category: 'login' },
                { text: 'Create Containers in Browser', completed: false, category: 'configuration' },
                { text: 'Setup Whitelist for auto clean', completed: false, category: 'configuration' },
                { text: 'Login to Github & Google', completed: false, category: 'login' },
                { text: 'Login to VS Code', completed: false, category: 'login' },
                { text: 'Restore Downloads', completed: false, category: 'backup' }
            ],
            android: [
                { text: 'Backup Images', completed: false, category: 'backup' },
                { text: 'Backup Videos', completed: false, category: 'backup' },
                { text: 'Backup Music', completed: false, category: 'backup' },
                { text: 'Remove SD Card before flashing', completed: false, category: 'configuration' },
                { text: 'Flash Rom', completed: false, category: 'installation' },
                { text: 'Reboot', completed: false, category: 'configuration' },
                { text: 'Flash Magisk & Reboot', completed: false, category: 'installation' },
                { text: 'Setup Magisk & Reboot', completed: false, category: 'configuration' },
                { text: 'Login to Google', completed: false, category: 'login' },
                { text: 'Install Bitwarden & Ente-Auth', completed: false, category: 'installation' },
                { text: 'Flash LSPosed', completed: false, category: 'installation' },
                { text: 'Reboot', completed: false, category: 'configuration' },
                { text: 'Install Play Store Apps', completed: false, category: 'installation' },
                { text: 'Install F-Droid Apps', completed: false, category: 'installation' },
                { text: 'Flash LSPosed Module', completed: false, category: 'installation' }
            ],
            windows: [
                { text: 'Create System Backup', completed: false, category: 'backup' },
                { text: 'Install Windows Updates', completed: false, category: 'installation' },
                { text: 'Install Essential Software', completed: false, category: 'installation' },
                { text: 'Configure Windows Settings', completed: false, category: 'configuration' },
                { text: 'Setup Development Environment', completed: false, category: 'configuration' },
                { text: 'Install Security Software', completed: false, category: 'installation' },
                { text: 'Configure User Accounts', completed: false, category: 'configuration' },
                { text: 'Setup Cloud Storage', completed: false, category: 'configuration' }
            ]
        };

        this.checklists = this.loadFromStorage() || this.defaultChecklists;
    }

    bindEvents() {
        // Platform selection
        this.platformButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.setPlatform(e.target.dataset.platform);
            });
        });

        // Add item form
        this.addItemForm.addEventListener('submit', (e) => this.addItem(e));
        this.quickAddBtn.addEventListener('click', () => this.showAddModal());
        this.modalClose.addEventListener('click', () => this.hideAddModal());
        this.cancelAdd.addEventListener('click', () => this.hideAddModal());

        // Modal backdrop
        this.addItemModal.addEventListener('click', (e) => {
            if (e.target === this.addItemModal) {
                this.hideAddModal();
            }
        });

        // Control buttons
        this.resetButton.addEventListener('click', () => this.resetChecklist());
        this.exportButton.addEventListener('click', () => this.exportJSON());
        this.importFile.addEventListener('change', (e) => this.importJSON(e));
        this.shareButton.addEventListener('click', () => this.shareProgress());

        // Search
        this.searchToggle.addEventListener('click', () => this.toggleSearch());
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.searchClear.addEventListener('click', () => this.clearSearch());

        // Filter buttons
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Auto-save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveToStorage();
            }
        });
    }

    // Data Management
    loadFromStorage() {
        try {
            const data = localStorage.getItem('setupChecklists');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return null;
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('setupChecklists', JSON.stringify(this.checklists));
            localStorage.setItem('theme', this.theme);
        } catch (error) {
            console.error('Error saving to storage:', error);
            this.showNotification('Error saving data', 'error');
        }
    }

    // Platform Management
    setPlatform(platform) {
        this.currentPlatform = platform;
        this.platformButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        const activeButton = document.querySelector(`.platform-btn[data-platform="${platform}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-pressed', 'true');
        }
        
        this.render();
        this.showNotification(`Switched to ${platform} platform`, 'info');
    }

    // Item Management
    addItem(event) {
        event.preventDefault();
        const text = this.newItemInput.value.trim();
        const category = this.stepCategorySelect.value;
        
        if (!text) {
            this.showNotification('Please enter a step description', 'warning');
            return;
        }

        const newItem = {
            text,
            category: category || 'other',
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.checklists[this.currentPlatform].push(newItem);
        this.saveToStorage();
        this.render();
        this.hideAddModal();
        this.newItemInput.value = '';
        this.stepCategorySelect.value = '';
        this.showNotification('Step added successfully', 'success');
    }

    editItem(index) {
        this.editingIndex = index;
        this.renderEditForm(index);
    }

    saveEditedItem(index, newText, newCategory) {
        if (!newText.trim()) {
            this.showNotification('Step description cannot be empty', 'warning');
            return;
        }

        this.checklists[this.currentPlatform][index].text = newText.trim();
        if (newCategory) {
            this.checklists[this.currentPlatform][index].category = newCategory;
        }
        this.editingIndex = -1;
        this.saveToStorage();
        this.render();
        this.showNotification('Step updated successfully', 'success');
    }

    cancelEdit() {
        this.editingIndex = -1;
        this.render();
    }

    deleteItem(index) {
        const item = this.checklists[this.currentPlatform][index];
        if (confirm(`Are you sure you want to delete "${item.text}"?`)) {
            this.checklists[this.currentPlatform].splice(index, 1);
            this.saveToStorage();
            this.render();
            this.showNotification('Step deleted successfully', 'success');
        }
    }

    toggleItem(index) {
        this.checklists[this.currentPlatform][index].completed = 
            !this.checklists[this.currentPlatform][index].completed;
        this.saveToStorage();
        this.render();
        
        const isCompleted = this.checklists[this.currentPlatform][index].completed;
        this.showNotification(
            `Step ${isCompleted ? 'completed' : 'uncompleted'}`, 
            isCompleted ? 'success' : 'info'
        );
    }

    // Filtering and Search
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeFilter = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
        if (activeFilter) {
            activeFilter.classList.add('active');
        }
        
        this.render();
    }

    handleSearch(event) {
        this.searchQuery = event.target.value.toLowerCase();
        this.render();
        
        const hasQuery = this.searchQuery.trim().length > 0;
        this.searchClear.classList.toggle('visible', hasQuery);
    }

    clearSearch() {
        this.searchInput.value = '';
        this.searchQuery = '';
        this.searchClear.classList.remove('visible');
        this.render();
    }

    toggleSearch() {
        this.searchContainer.classList.toggle('active');
        if (this.searchContainer.classList.contains('active')) {
            this.searchInput.focus();
        } else {
            this.clearSearch();
        }
    }

    getFilteredItems() {
        let items = this.checklists[this.currentPlatform];
        
        // Apply search filter
        if (this.searchQuery) {
            items = items.filter(item => 
                item.text.toLowerCase().includes(this.searchQuery) ||
                (item.category && item.category.toLowerCase().includes(this.searchQuery))
            );
        }
        
        // Apply completion filter
        if (this.currentFilter === 'completed') {
            items = items.filter(item => item.completed);
        } else if (this.currentFilter === 'pending') {
            items = items.filter(item => !item.completed);
        }
        
        return items;
    }

    // Rendering Methods
    render() {
        this.renderChecklist();
        this.updateProgress();
        this.updateStats();
        this.updatePlatformCounts();
    }

    renderChecklist() {
        const items = this.getFilteredItems();
        const allItems = this.checklists[this.currentPlatform];
        
        this.checklistContainer.innerHTML = '';
        
        if (items.length === 0) {
            this.emptyState.classList.remove('hidden');
            return;
        }
        
        this.emptyState.classList.add('hidden');
        const fragment = document.createDocumentFragment();

        items.forEach((item, displayIndex) => {
            const actualIndex = allItems.findIndex(i => i === item);
            const listItem = document.createElement('li');
            listItem.className = `checklist-item ${item.completed ? 'completed' : ''} fade-in`;
            listItem.dataset.index = actualIndex;
            listItem.style.animationDelay = `${displayIndex * 0.1}s`;

            if (this.editingIndex === actualIndex) {
                this.renderEditFormInline(listItem, item, actualIndex);
            } else {
                this.renderNormalItem(listItem, item, actualIndex);
            }

            fragment.appendChild(listItem);
        });

        this.checklistContainer.appendChild(fragment);
        this.updateEventListeners();
    }

    renderNormalItem(listItem, item, index) {
        const categoryClass = item.category ? `category-${item.category}` : '';
        const categoryLabel = item.category ? this.getCategoryLabel(item.category) : '';
        
        listItem.innerHTML = `
            <input type="checkbox" 
                   id="item-${this.currentPlatform}-${index}" 
                   ${item.completed ? 'checked' : ''} 
                   aria-label="${item.text}">
            <div class="item-content">
                <span class="item-text">${this.escapeHtml(item.text)}</span>
                ${categoryLabel ? `<span class="item-category ${categoryClass}">${categoryLabel}</span>` : ''}
            </div>
            <div class="item-actions">
                <button class="edit-button" aria-label="Edit step ${index + 1}">
                    <i data-lucide="edit-2"></i>
                </button>
                <button class="delete-button" aria-label="Delete step ${index + 1}">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
        
        // Initialize Lucide icons for this item
        setTimeout(() => lucide.createIcons(), 10);
    }

    renderEditFormInline(listItem, item, index) {
        listItem.innerHTML = `
            <div class="edit-form">
                <input type="text" 
                       class="edit-input" 
                       value="${this.escapeHtml(item.text)}" 
                       aria-label="Edit checklist item">
                <select class="edit-category">
                    <option value="">No category</option>
                    <option value="installation" ${item.category === 'installation' ? 'selected' : ''}>Installation</option>
                    <option value="configuration" ${item.category === 'configuration' ? 'selected' : ''}>Configuration</option>
                    <option value="backup" ${item.category === 'backup' ? 'selected' : ''}>Backup</option>
                    <option value="login" ${item.category === 'login' ? 'selected' : ''}>Login/Auth</option>
                    <option value="customization" ${item.category === 'customization' ? 'selected' : ''}>Customization</option>
                    <option value="other" ${item.category === 'other' ? 'selected' : ''}>Other</option>
                </select>
                <div class="edit-actions">
                    <button class="save">Save</button>
                    <button class="cancel">Cancel</button>
                </div>
            </div>
        `;

        const editInput = listItem.querySelector('.edit-input');
        const editCategory = listItem.querySelector('.edit-category');
        const saveButton = listItem.querySelector('.save');
        const cancelButton = listItem.querySelector('.cancel');

        saveButton.addEventListener('click', () => 
            this.saveEditedItem(index, editInput.value, editCategory.value));
        cancelButton.addEventListener('click', () => this.cancelEdit());
        
        editInput.focus();
        editInput.select();
    }

    updateEventListeners() {
        this.checklistContainer.querySelectorAll('.checklist-item').forEach(item => {
            const index = parseInt(item.dataset.index);
            const checkbox = item.querySelector('input[type="checkbox"]');
            
            if (checkbox) {
                checkbox.addEventListener('change', () => this.toggleItem(index));
            }

            const editButton = item.querySelector('.edit-button');
            if (editButton) {
                editButton.addEventListener('click', () => this.editItem(index));
            }

            const deleteButton = item.querySelector('.delete-button');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => this.deleteItem(index));
            }
        });
    }

    updateProgress() {
        const currentChecklist = this.checklists[this.currentPlatform];
        const completed = currentChecklist.filter(item => item.completed).length;
        const total = currentChecklist.length;
        const percentage = total === 0 ? 0 : (completed / total) * 100;
        
        const progressFill = this.progressBar.querySelector('.progress-fill');
        progressFill.style.width = `${percentage}%`;
        
        this.progressText.textContent = `${completed} of ${total} steps completed`;
    }

    updateStats() {
        const currentChecklist = this.checklists[this.currentPlatform];
        const completed = currentChecklist.filter(item => item.completed).length;
        const total = currentChecklist.length;
        const pending = total - completed;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        this.totalSteps.textContent = total;
        this.completedSteps.textContent = completed;
        this.pendingSteps.textContent = pending;
        this.progressPercentage.textContent = `${percentage}%`;
    }

    updatePlatformCounts() {
        Object.keys(this.checklists).forEach(platform => {
            const count = this.checklists[platform].length;
            if (this.platformCounts[platform]) {
                this.platformCounts[platform].textContent = count;
            }
        });
    }

    // Theme Management
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveToStorage();
        this.showNotification(`Switched to ${this.theme} theme`, 'info');
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
    }

    // Modal Management
    showAddModal() {
        this.addItemModal.classList.add('active');
        this.newItemInput.focus();
    }

    hideAddModal() {
        this.addItemModal.classList.remove('active');
        this.newItemInput.value = '';
        this.stepCategorySelect.value = '';
    }

    // Control Functions
    resetChecklist() {
        const platform = this.currentPlatform;
        const itemCount = this.checklists[platform].length;
        
        if (confirm(`Are you sure you want to reset all progress for ${platform}? This will uncheck all ${itemCount} items.`)) {
            this.checklists[platform] = this.checklists[platform].map(item => ({ 
                ...item, 
                completed: false 
            }));
            this.saveToStorage();
            this.render();
            this.showNotification('Progress reset successfully', 'success');
        }
    }

    exportJSON() {
        const dataStr = JSON.stringify(this.checklists, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        
        a.href = url;
        a.download = `setupmate-backup-${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully', 'success');
    }

    importJSON(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                
                // Validate structure
                if (!this.validateImportData(imported)) {
                    throw new Error('Invalid file structure');
                }

                this.checklists = imported;
                this.saveToStorage();
                this.render();
                this.showNotification('Data imported successfully', 'success');
            } catch (error) {
                console.error('Import error:', error);
                this.showNotification('Invalid JSON file or corrupted data', 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    validateImportData(data) {
        if (!data || typeof data !== 'object') return false;
        
        const platforms = ['arch', 'android', 'windows'];
        return platforms.every(platform => {
            if (!data[platform] || !Array.isArray(data[platform])) return false;
            return data[platform].every(item => 
                item.hasOwnProperty('text') && 
                item.hasOwnProperty('completed') &&
                typeof item.text === 'string' &&
                typeof item.completed === 'boolean'
            );
        });
    }

    async shareProgress() {
        const currentChecklist = this.checklists[this.currentPlatform];
        const completed = currentChecklist.filter(item => item.completed).length;
        const total = currentChecklist.length;
        const percentage = Math.round((completed / total) * 100);
        
        const shareText = `🚀 My ${this.currentPlatform} setup progress: ${completed}/${total} steps completed (${percentage}%)!\n\nUsing Setupmate to track my system setup.`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Setup Progress',
                    text: shareText,
                    url: window.location.href
                });
                this.showNotification('Progress shared successfully', 'success');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this.fallbackShare(shareText);
                }
            }
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Progress copied to clipboard', 'success');
        }).catch(() => {
            this.showNotification('Could not copy to clipboard', 'error');
        });
    }

    // Keyboard Shortcuts
    handleKeyboard(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'n':
                    event.preventDefault();
                    this.showAddModal();
                    break;
                case 'f':
                    event.preventDefault();
                    this.toggleSearch();
                    break;
                case 'e':
                    event.preventDefault();
                    this.exportJSON();
                    break;
                case 'r':
                    if (event.shiftKey) {
                        event.preventDefault();
                        this.resetChecklist();
                    }
                    break;
            }
        }
        
        if (event.key === 'Escape') {
            this.hideAddModal();
            if (this.searchContainer.classList.contains('active')) {
                this.toggleSearch();
            }
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Utility Functions
    getCategoryLabel(category) {
        const labels = {
            installation: 'Installation',
            configuration: 'Configuration',
            backup: 'Backup',
            login: 'Login/Auth',
            customization: 'Customization',
            other: 'Other'
        };
        return labels[category] || category;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new SetupMate();
});