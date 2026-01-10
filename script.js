// script.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const typeOptionsContainer = document.getElementById('type-options');
    const subOptionsContainer = document.getElementById('sub-options');
    const specialOptionsContainer = document.getElementById('special-options');
    const playerCountInput = document.getElementById('player-count');

    // Result Grid
    const resultsGrid = document.getElementById('results-grid');

    const spinBtn = document.getElementById('spin-btn');
    const resetBtn = document.getElementById('reset-btn');

    // State
    // weaponData is available globally from data.js
    let filteredWeapons = [...weaponData];
    let isSpinning = false;
    let activeSpins = 0;

    // Selection Sets
    const selectedTypes = new Set();
    const selectedSubs = new Set();
    const selectedSpecials = new Set();

    // Filters Data map
    const uniqueTypes = new Map();
    const uniqueSubs = new Map();
    const uniqueSpecials = new Map();

    // Initialize
    function init() {
        extractFilterData();
        renderOptionButtons(typeOptionsContainer, uniqueTypes, selectedTypes);
        renderOptionButtons(subOptionsContainer, uniqueSubs, selectedSubs);
        renderOptionButtons(specialOptionsContainer, uniqueSpecials, selectedSpecials);
        addEventListeners();
    }

    function extractFilterData() {
        weaponData.forEach(w => {
            if (w.type) uniqueTypes.set(w.type.key, w.type.name.ja_JP);
            if (w.sub) uniqueSubs.set(w.sub.key, w.sub.name.ja_JP);
            if (w.special) uniqueSpecials.set(w.special.key, w.special.name.ja_JP);
        });
    }

    function renderOptionButtons(container, dataMap, selectionSet) {
        container.innerHTML = '';
        const sortedItems = Array.from(dataMap).sort((a, b) => a[1].localeCompare(b[1]));

        sortedItems.forEach(([key, name]) => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = name;
            btn.dataset.value = key;

            // Re-apply active state if re-rendering (though we prob won't re-render much)
            if (selectionSet.has(key)) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', () => {
                toggleSelection(btn, key, selectionSet);
            });

            container.appendChild(btn);
        });
    }

    function toggleSelection(btn, key, selectionSet) {
        if (selectionSet.has(key)) {
            selectionSet.delete(key);
            btn.classList.remove('active');
        } else {
            selectionSet.add(key);
            btn.classList.add('active');
        }
        updateFilters();
    }

    function addEventListeners() {
        spinBtn.addEventListener('click', startSpin);
        resetBtn.addEventListener('click', resetFilters);

        document.getElementById('p-minus').addEventListener('click', () => changePlayerCount(-1));
        document.getElementById('p-plus').addEventListener('click', () => changePlayerCount(1));
    }

    function changePlayerCount(delta) {
        let count = parseInt(playerCountInput.value) || 1;
        count += delta;
        if (count < 1) count = 1;
        if (count > 8) count = 8;
        playerCountInput.value = count;
    }

    function updateFilters() {
        filteredWeapons = weaponData.filter(w => {
            // Logic:
            // Within a category (e.g. Type), if ANY are selected, the weapon must match ONE of them.
            // If NONE are selected, it matches ALL (ignore filter).
            // Combine categories with AND logic.

            const matchType = selectedTypes.size === 0 || selectedTypes.has(w.type.key);
            const matchSub = selectedSubs.size === 0 || selectedSubs.has(w.sub.key);
            const matchSpecial = selectedSpecials.size === 0 || selectedSpecials.has(w.special.key);
            return matchType && matchSub && matchSpecial;
        });

        // Visual feedback
        if (filteredWeapons.length === 0) {
            spinBtn.disabled = true;
            spinBtn.textContent = "該当なし"; // No Match
            spinBtn.style.opacity = "0.5";
        } else {
            spinBtn.disabled = false;
            spinBtn.textContent = "SPIN!"; // Or 'ルーレットを回す'
            spinBtn.style.opacity = "1";
        }
    }

    function resetFilters() {
        selectedTypes.clear();
        selectedSubs.clear();
        selectedSpecials.clear();

        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

        updateFilters();
    }

    function getSecureRandom() {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] / (0xFFFFFFFF + 1);
    }

    function createResultCard(index) {
        const card = document.createElement('div');
        card.className = 'weapon-card';
        card.innerHTML = `
            <div class="player-label">PLAYER ${index + 1}</div>
            <div class="weapon-name">???</div>
            <div class="weapon-details">
                <div class="detail-item">
                    <span class="label">Sub:</span>
                    <span class="value weapon-sub">-</span>
                </div>
                <div class="detail-item">
                    <span class="label">Special:</span>
                    <span class="value weapon-special">-</span>
                </div>
            </div>
        `;
        return card;
    }

    function startSpin() {
        if (isSpinning || filteredWeapons.length === 0) return;

        isSpinning = true;
        spinBtn.disabled = true;
        resultsGrid.innerHTML = ''; // Clear previous results

        let count = parseInt(playerCountInput.value);
        if (isNaN(count) || count < 1) count = 1;
        if (count > 8) count = 8;
        playerCountInput.value = count; // Validate input display

        activeSpins = count;

        for (let i = 0; i < count; i++) {
            const card = createResultCard(i);
            resultsGrid.appendChild(card);
            spinCard(card);
        }
    }

    function spinCard(cardElement) {
        const nameEl = cardElement.querySelector('.weapon-name');
        const subEl = cardElement.querySelector('.weapon-sub');
        const specialEl = cardElement.querySelector('.weapon-special');

        cardElement.classList.add('spinning');

        let counter = 0;
        // Random spin duration for each card
        const totalSpins = 20 + Math.floor(getSecureRandom() * 15);
        const speed = 50;

        function spinStep() {
            const randomWeapon = filteredWeapons[Math.floor(getSecureRandom() * filteredWeapons.length)];

            nameEl.textContent = randomWeapon.name.ja_JP;
            subEl.textContent = randomWeapon.sub.name.ja_JP;
            specialEl.textContent = randomWeapon.special.name.ja_JP;

            counter++;
            if (counter < totalSpins) {
                let currentSpeed = speed;
                if (counter > totalSpins - 5) {
                    currentSpeed = speed * (counter - (totalSpins - 6));
                }
                setTimeout(spinStep, currentSpeed);
            } else {
                stopCardSpin(cardElement);
            }
        }

        spinStep();
    }

    function stopCardSpin(cardElement) {
        cardElement.classList.remove('spinning');

        cardElement.style.transform = "scale(1.05)";
        setTimeout(() => {
            cardElement.style.transform = "scale(1)";
        }, 200);

        activeSpins--;
        if (activeSpins <= 0) {
            isSpinning = false;
            spinBtn.disabled = false;
        }
    }

    // Run init
    init();
});
