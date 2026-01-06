// script.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const typeOptionsContainer = document.getElementById('type-options');
    const subOptionsContainer = document.getElementById('sub-options');
    const specialOptionsContainer = document.getElementById('special-options');

    const weaponNameEl = document.getElementById('weapon-name');
    const weaponSubEl = document.getElementById('weapon-sub');
    const weaponSpecialEl = document.getElementById('weapon-special');
    const resultCard = document.getElementById('result-card');

    const spinBtn = document.getElementById('spin-btn');
    const resetBtn = document.getElementById('reset-btn');

    // State
    // weaponData is available globally from data.js
    let filteredWeapons = [...weaponData];
    let isSpinning = false;

    // Selection Sets (store IDs/keys of selected items)
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
            // Types
            if (w.type) {
                uniqueTypes.set(w.type.key, w.type.name.ja_JP);
            }
            // Subs
            if (w.sub) {
                uniqueSubs.set(w.sub.key, w.sub.name.ja_JP);
            }
            // Specials
            if (w.special) {
                uniqueSpecials.set(w.special.key, w.special.name.ja_JP);
            }
        });
    }

    function renderOptionButtons(container, dataMap, selectionSet) {
        container.innerHTML = ''; // Clear existing
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

    function startSpin() {
        if (isSpinning || filteredWeapons.length === 0) return;

        isSpinning = true;
        spinBtn.disabled = true;
        resultCard.classList.add('spinning');

        let counter = 0;
        const totalSpins = 20 + Math.floor(Math.random() * 10);
        const speed = 50;

        function spinStep() {
            const randomWeapon = filteredWeapons[Math.floor(Math.random() * filteredWeapons.length)];
            displayWeapon(randomWeapon);

            counter++;
            if (counter < totalSpins) {
                let currentSpeed = speed;
                if (counter > totalSpins - 5) {
                    currentSpeed = speed * (counter - (totalSpins - 6));
                }
                setTimeout(spinStep, currentSpeed);
            } else {
                stopSpin(randomWeapon);
            }
        }

        spinStep();
    }

    function stopSpin(finalWeapon) {
        isSpinning = false;
        spinBtn.disabled = false;
        resultCard.classList.remove('spinning');
        displayWeapon(finalWeapon);

        resultCard.style.transform = "scale(1.05)";
        setTimeout(() => {
            resultCard.style.transform = "scale(1)";
        }, 200);
    }

    function displayWeapon(weapon) {
        weaponNameEl.textContent = weapon.name.ja_JP;
        weaponSubEl.textContent = weapon.sub.name.ja_JP;
        weaponSpecialEl.textContent = weapon.special.name.ja_JP;
    }

    // Run init
    init();
});
