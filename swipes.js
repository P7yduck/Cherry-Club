let touchStartX = 0, touchStartY = 0, swipeDeck = [], currentSwipeIndex = 0;

// НА ТЕЛЕФОНЕ ХВАТАЕМ ВСЕ СВАЙПЫ НАПРЯМУЮ ЧЕРЕЗ ОКНО БРАУЗЕРА
window.addEventListener("touchstart", function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

window.addEventListener("touchend", function(e) {
    const diffX = touchStartX - e.changedTouches[0].screenX;
    const diffY = touchStartY - e.changedTouches[0].screenY;
    
    // Проверяем, что это был именно горизонтальный свайп, а не вертикальный скролл
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 40) {
        if (typeof isOwnProfile !== "undefined" && isOwnProfile) {
            if (diffX > 0) { startSwipeMode(); } // Свайп влево на своем профиле -> открыть ленту
        } else {
            if (diffX > 0) { handleDislike(); } // Свайп влево в ленте -> дизлайк
            else if (diffX < 0) { handleLike(); } // Свайп вправо в ленте -> лайк
        }
    }
}, { passive: true });

function startSwipeMode() {
    if (typeof globalCherryDatabase === "undefined" || globalCherryDatabase.length === 0) return alert("База анкет пуста.");
    const savedOwn = localStorage.getItem("cherry_profile_data");
    let ownGender = "Парень", ownCity = "";
    if (savedOwn) {
        try {
            const decoded = decodeURIComponent(atob(savedOwn).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
            const p = new URLSearchParams(decoded);
            ownGender = p.get("gender") || "Парень"; ownCity = p.get("city") || "";
        } catch(e) {}
    }
    swipeDeck = [];
    globalCherryDatabase.forEach(enc => {
        try {
            const decoded = decodeURIComponent(atob(enc).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
            const prof = new URLSearchParams(decoded);
            if (prof.get("gender") !== ownGender && prof.get("city") === ownCity) swipeDeck.push(enc);
        } catch(e) {}
    });
    if (swipeDeck.length === 0) {
        globalCherryDatabase.forEach(enc => {
            try {
                const decoded = decodeURIComponent(atob(enc).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
                const prof = new URLSearchParams(decoded);
                if (prof.get("gender") !== ownGender) swipeDeck.push(enc);
            } catch(e) {}
        });
    }
    swipeDeck.sort(() => Math.random() - 0.5);
    if (swipeDeck.length === 0) return alert("Подходящих анкет пока нет.");
    isOwnProfile = false; currentSwipeIndex = 0; loadNextSwipeCard();
}

function loadNextSwipeCard() {
    if (currentSwipeIndex >= swipeDeck.length) { alert("Вы посмотрели все анкеты в ленте!"); location.reload(); return; }
    showViewScreen(swipeDeck[currentSwipeIndex]);
}
function handleDislike() { currentSwipeIndex++; loadNextSwipeCard(); }
function handleLike() {
    try {
        const decoded = decodeURIComponent(atob(swipeDeck[currentSwipeIndex]).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
        const p = new URLSearchParams(decoded); alert("Взаимность! Открываем чат 🍒");
        if (tg && tg.openTelegramLink) tg.openTelegramLink("https://t.me" + p.get("user")); else window.open("https://t.me" + p.get("user"), "_blank");
        currentSwipeIndex++; loadNextSwipeCard();
    } catch(e) { currentSwipeIndex++; loadNextSwipeCard(); }
}
