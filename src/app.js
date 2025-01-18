        const platformButtons = document.querySelectorAll('.platform-btn');
        const checklistContainer = document.getElementById('checklist');
        const progressBar = document.querySelector('.progress-bar');
        const newItemInput = document.getElementById('newItem');
        const addItemForm = document.getElementById('addItemForm');
        const resetButton = document.getElementById('resetButton');
        const exportButton = document.getElementById('exportButton');
        const importFile = document.getElementById('importFile');

        let currentPlatform = 'arch';
        let editingIndex = -1;

        const defaultChecklists = {
            arch: [
                { text: 'Backup Downloads', completed: false },
                { text: 'Install Manjaro Kde', completed: false },
                { text: 'Run  setup Script', completed: false },
                { text: 'Uninstall KDE Connect,kate etc', completed: false },
                { text: 'Reboot after runing Script ', completed: false },
                { text: 'Login to Ente-Auth AppImage', completed: false },
                { text: 'Login to Bitwarden Browser', completed: false },
                { text: 'Create Containers in Browser', completed: false },
                { text: 'Setup Whitelist for auto clean', completed: false },
                { text: 'Login to Github & Google', completed: false },
                { text: 'Login to VS Code', completed: false },
                { text: 'Restore Downloads', completed: false }           
            ],
            android: [
                { text: 'Backup Images', completed: false },
                { text: 'Backup Videos', completed: false },
                { text: 'Backup Music', completed: false },
                { text: 'Remove SD Card before flashing', completed: false },
                { text: 'Flash Rom', completed: false },
                { text: 'Reboot', completed: false },
                { text: 'Flash Magisk & Reboot', completed: false },
                { text: 'Setup Magisk & Reboot', completed: false },
                { text: 'Login to Google ', completed: false },
                { text: 'Install Bitwarden & Ente-Auth', completed: false },
                { text: 'Flash LSPosed', completed: false },
                { text: 'Reboot', completed: false },
                { text: 'Install Play Store Apps', completed: false },
                { text: 'Install F-Droid Apps ', completed: false },
                { text: 'Flash LSPosed Module', completed: false }
            ],
            windows: [
                { text: 'TBD', completed: false },
                { text: 'TBD', completed: false }
            ]
        };

        let checklists = JSON.parse(localStorage.getItem('setupChecklists')) || defaultChecklists;

        const saveToStorage = () => {
            localStorage.setItem('setupChecklists', JSON.stringify(checklists));
            updateProgress();
        };

        const updateProgress = () => {
            const currentChecklist = checklists[currentPlatform];
            const completed = currentChecklist.filter(item => item.completed).length;
            const total = currentChecklist.length;
            const percentage = total === 0 ? 0 : (completed / total) * 100;
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', completed);
            progressBar.setAttribute('aria-valuemin', 0);
            progressBar.setAttribute('aria-valuemax', total);
        };

        const renderChecklist = () => {
            checklistContainer.innerHTML = '';
            const currentChecklist = checklists[currentPlatform];
            const fragment = document.createDocumentFragment();

            currentChecklist.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.className = `checklist-item ${item.completed ? 'completed' : ''}`;
                listItem.dataset.index = index;

                listItem.innerHTML = `
                    <input type="checkbox" id="item-${currentPlatform}-${index}" ${item.completed ? 'checked' : ''} aria-label="${item.text}">
                    <span class="item-text">${item.text}</span>
                    <div class="item-actions">
                        <button class="edit-button" aria-label="Edit step ${index + 1}">✏️</button>
                        <button class="delete-button" aria-label="Delete step ${index + 1}">🗑️</button>
                    </div>
                `;
                fragment.appendChild(listItem);
            });
            checklistContainer.appendChild(fragment);
            updateEventListeners();
            updateProgress();
        };

        const updateEventListeners = () => {
            checklistContainer.querySelectorAll('.checklist-item').forEach(item => {
                const index = parseInt(item.dataset.index);
                const checkbox = item.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', () => toggleItem(index));

                const editButton = item.querySelector('.edit-button');
                editButton.addEventListener('click', () => editItem(index));

                const deleteButton = item.querySelector('.delete-button');
                deleteButton.addEventListener('click', () => deleteItem(index));
            });
        };

        const renderEditForm = (index) => {
            const listItem = checklistContainer.querySelector(`.checklist-item[data-index="${index}"]`);
            if (!listItem) return;

            const itemTextSpan = listItem.querySelector('.item-text');
            const itemText = itemTextSpan.textContent;

            itemTextSpan.innerHTML = `
                <input type="text" class="edit-input" value="${itemText}" aria-label="Edit checklist item">
                <div class="edit-actions">
                    <button class="save">Save</button>
                    <button class="cancel">Cancel</button>
                </div>
            `;

            const saveButton = listItem.querySelector('.save');
            const cancelButton = listItem.querySelector('.cancel');
            const editInput = listItem.querySelector('.edit-input');

            saveButton.addEventListener('click', () => saveEditedItem(index, editInput.value));
            cancelButton.addEventListener('click', () => cancelEdit(index));
            editInput.focus();
        };

        const toggleItem = (index) => {
            checklists[currentPlatform][index].completed = !checklists[currentPlatform][index].completed;
            saveToStorage();
            renderChecklist();
        };

        const addItem = (event) => {
            event.preventDefault();
            const text = newItemInput.value.trim();
            if (text) {
                checklists[currentPlatform].push({ text, completed: false });
                saveToStorage();
                renderChecklist();
                newItemInput.value = '';
            }
        };

        const editItem = (index) => {
            editingIndex = index;
            renderChecklist();
            renderEditForm(index);
        };

        const saveEditedItem = (index, newText) => {
            checklists[currentPlatform][index].text = newText.trim();
            editingIndex = -1;
            saveToStorage();
            renderChecklist();
        };

        const cancelEdit = (index) => {
            editingIndex = -1;
            renderChecklist();
        };

        const deleteItem = (index) => {
            if (confirm('Are you sure you want to delete this step?')) {
                checklists[currentPlatform].splice(index, 1);
                saveToStorage();
                renderChecklist();
            }
        };

        const resetChecklist = () => {
            if (confirm('Are you sure you want to reset all progress for this platform?')) {
                checklists[currentPlatform] = checklists[currentPlatform].map(item => ({ ...item, completed: false }));
                saveToStorage();
                renderChecklist();
            }
        };

        const exportJSON = () => {
            const dataStr = JSON.stringify(checklists, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'setup-checklist.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        const importJSON = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const imported = JSON.parse(e.target.result);
                        checklists = imported;
                        saveToStorage();
                        renderChecklist();
                    } catch (error) {
                        alert('Invalid JSON file');
                    }
                };
                reader.readAsText(file);
            }
        };

        const setPlatform = (platform) => {
            currentPlatform = platform;
            platformButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            const activeButton = document.querySelector(`.platform-btn[data-platform="${platform}"]`);
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-pressed', 'true');
            renderChecklist();
        };

        // Event Listeners
        platformButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                setPlatform(event.target.dataset.platform);
            });
        });

        addItemForm.addEventListener('submit', addItem);
        resetButton.addEventListener('click', resetChecklist);
        exportButton.addEventListener('click', exportJSON);
        importFile.addEventListener('change', importJSON);

        // Initialization
        renderChecklist();