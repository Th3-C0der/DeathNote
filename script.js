document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('death-form');
    const log = document.getElementById('death-log');
    const rulesBtn = document.getElementById('toggle-rules');
    const rulesContent = document.getElementById('rules-content');
    const nameInput = document.getElementById('name');
    const causeInput = document.getElementById('cause');
    const causeTimerSpan = document.getElementById('cause-timer');
    const descriptionGroup = document.getElementById('description-group');
    const descriptionInput = document.getElementById('description');
    const descriptionTimerSpan = document.getElementById('description-timer');
    const deathTimeInput = document.getElementById('death-time');
    const deathChime = document.getElementById('death-chime');
    const shinigamiEyeBtn = document.getElementById('shinigami-eye-btn');
    const resetBtn = document.getElementById('reset-btn');
    const ryukMessage = document.getElementById('ryuk-message');

    let entries = JSON.parse(localStorage.getItem('deathWebEntries')) || [];
    let causeTimer, descriptionTimer;

    function saveEntries() {
        localStorage.setItem('deathWebEntries', JSON.stringify(entries));
    }

    function renderLog() {
        const now = new Date();
        log.innerHTML = '';
        entries.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'death-entry';
            if (entry.status === 'dead') {
                div.classList.add('dead-entry-animation');
            }
            const deathTime = new Date(entry.deathTime);
            const formattedTime = entry.deathTime ? `${deathTime.toLocaleDateString()} ${deathTime.toLocaleTimeString()}` : 'Pending';

            const shinigamiEyeActive = document.body.classList.contains('shinigami-eye-active');
            const ageSpan = shinigamiEyeActive ? `<span class="victim-age"> - ${entry.age}</span>` : '';

            let statusContent;
            if (entry.status === 'pending') {
                const remainingSeconds = Math.max(0, Math.round((deathTime - now) / 1000));
                statusContent = `Pending (${remainingSeconds}s)`;
            } else {
                statusContent = '☠️ DEAD ☠️';
            }

            div.innerHTML = `
                <div class="name-age-container">
                    <span class="name">${entry.name}</span>
                    ${ageSpan}
                </div>
                <span class="time">Scheduled: ${formattedTime}</span>
                <span class="cause">${entry.cause || 'Heart Attack'}</span>
                <span class="status ${entry.status === 'dead' ? 'status-dead' : 'status-pending'}">
                    ${statusContent}
                </span>
            `;
            log.appendChild(div);
        });
    }

    function checkDeaths() {
        const now = new Date();
        let changed = false;
        let hasPending = false;

        entries.forEach(entry => {
            if (entry.status === 'pending') {
                hasPending = true;
                if (new Date(entry.deathTime) <= now) {
                    entry.status = 'dead';
                    changed = true;
                    deathChime.play();
                }
            }
        });

        if (changed) {
            saveEntries();
        }

        // Always re-render if there are pending entries to update the countdown
        if (hasPending || changed) {
            renderLog();
        }
    }

    function startCauseTimer() {
        causeInput.disabled = false;
        let timeLeft = 40;
        causeTimerSpan.textContent = `(${timeLeft}s)`;
        causeTimer = setInterval(() => {
            timeLeft--;
            causeTimerSpan.textContent = `(${timeLeft}s)`;
            if (timeLeft <= 0) {
                clearInterval(causeTimer);
                causeInput.disabled = true;
                causeTimerSpan.textContent = '';
            }
        }, 1000);
    }

    function startDescriptionTimer() {
        descriptionGroup.style.display = 'block';
        let timeLeft = 400; // 6 minutes and 40 seconds
        descriptionTimer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            descriptionTimerSpan.textContent = `(${minutes}:${seconds.toString().padStart(2, '0')})`;
            if (timeLeft <= 0) {
                clearInterval(descriptionTimer);
                descriptionGroup.style.display = 'none';
            }
            timeLeft--;
        }, 1000);
    }

    nameInput.addEventListener('input', () => {
        if (nameInput.value.trim() !== '' && !causeTimer) {
            startCauseTimer();
        }
    });

    causeInput.addEventListener('input', () => {
        if (causeInput.value.trim() !== '' && !descriptionTimer) {
            startDescriptionTimer();
        }
    });

    flatpickr(deathTimeInput, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: "today",
        maxDate: new Date().fp_incr(23)
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = nameInput.value.trim();
        if (!name) return;

        if (name.toLowerCase() === 'divya patil' || name.toLowerCase() === 'divya' || name.toLowerCase() === 'th3-c0der' || name.toLowerCase() === 'th3 c0der' || name.toLowerCase() === 'th3coder' || name.toLowerCase() === 'th3-coder' || name.toLowerCase() === 'divya vijay patil') {
            alert('Nice try, but some people are off-limits.');
            form.reset();
            return;
        }

        let deathTime;
        if (deathTimeInput.value) {
            deathTime = new Date(deathTimeInput.value);
        } else {
            deathTime = new Date(Date.now() + 40000); // 40 seconds from now
        }

        const newEntry = {
            name,
            cause: causeInput.value.trim(),
            description: descriptionInput.value.trim(),
            deathTime: deathTime.toISOString(),
            status: 'pending',
            entryTime: new Date().toISOString(),
            age: Math.floor(Math.random() * 50) + 20 // Random age for Shinigami Eyes
        };

        entries.unshift(newEntry);

        renderLog();
        saveEntries();
        form.reset();
        clearInterval(causeTimer);
        causeTimer = null;
        causeInput.disabled = true;
        causeTimerSpan.textContent = '';
        clearInterval(descriptionTimer);
        descriptionTimer = null;
        descriptionGroup.style.display = 'none';

        if (entries.length >= 3 && entries.length % 3 === 0) {
            ryukMessage.querySelector('p').textContent = "You’re getting used to this, aren’t you?";
            ryukMessage.hidden = false;
            setTimeout(() => ryukMessage.hidden = true, 5000);
        }
    });

    rulesBtn.addEventListener('click', () => {
        const expanded = rulesBtn.getAttribute('aria-expanded') === 'true';
        rulesBtn.setAttribute('aria-expanded', !expanded);
        rulesContent.hidden = expanded;
    });

    shinigamiEyeBtn.addEventListener('click', () => {
        const isActive = document.body.classList.toggle('shinigami-eye-active');
        shinigamiEyeBtn.textContent = isActive ? 'Disable Shinigami Eye' : 'Enable Shinigami Eye';
        renderLog(); // Re-render the log to show/hide ages
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to burn this notebook? All entries will be lost forever.')) {
            document.body.style.animation = 'burn 2s forwards';
            setTimeout(() => {
                entries = [];
                saveEntries();
                location.reload();
            }, 1800);
        }
    });

    setInterval(checkDeaths, 1000);
    renderLog();
});