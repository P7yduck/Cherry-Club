// Колода импортированных анкет для свайпов
let swipeDeck = [];
let currentSwipeIndex = 0;

// Сохранение чужой анкеты в локальную колоду свайпов
function importToSwipeDeck(encodedData) {
    if (!encodedData) return;
    
    let savedDeck = localStorage.getItem("cherry_swipe_deck");
    swipeDeck = savedDeck ? JSON.parse(savedDeck) : [];
    
    // Проверяем, нет ли уже этой анкеты в колоде, чтобы не дублировать
    if (!swipeDeck.includes(encodedData)) {
        swipeDeck.push(encodedData);
        localStorage.setItem("cherry_swipe_deck", JSON.stringify(swipeDeck));
    }
}

// Запуск режима просмотра колоды свайпов
function startSwipeMode() {
    let savedDeck = localStorage.getItem("cherry_swipe_deck");
    swipeDeck = savedDeck ? JSON.parse(savedDeck) : [];
    
    if (swipeDeck.length === 0) {
        alert("Твоя колода свайпов пуста!\n\nПереходи по ссылкам других участников в чатах и каналах Cherry Club, чтобы они автоматически добавились сюда для свайпов.");
        return;
    }
    
    isOwnProfile = false; // Переключаем в режим просмотра чужих анкет
    currentSwipeIndex = 0;
    loadNextSwipeCard();
}

// Загрузка следующей анкеты на экран
function loadNextSwipeCard() {
    if (currentSwipeIndex >= swipeDeck.length) {
        alert("Ты просмотрел все доступные анкеты в колоде! Добавляй новые анкеты, кликая по ссылкам участников.");
        // Возвращаем на свой профиль или экран авторизации
        location.reload();
        return;
    }
    
    const encodedData = swipeDeck[currentSwipeIndex];
    showViewScreen(encodedData);
}

// Действие при клике на Крестик (Дизлайк)
function handleDislike() {
    currentSwipeIndex++;
    loadNextSwipeCard();
}

// Действие при клике на Галочку (Лайк)
function handleLike() {
    // Получаем текущую анкету, чтобы узнать юзернейм для связи
    try {
        const encodedData = swipeDeck[currentSwipeIndex];
        const decoded = decodeURIComponent(atob(encodedData).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
        const p = new URLSearchParams(decoded);
        const username = p.get("user");
        
        alert("Взаимность! Вы поставили лайк. Открываем чат с пользователем.");
        
        // Перенаправляем в ЛС к человеку
        window.open("https://t.me" + username, "_blank");
        
        // Переходим к следующей карте
        currentSwipeIndex++;
        loadNextSwipeCard();
    } catch(e) {
        currentSwipeIndex++;
        loadNextSwipeCard();
    }
}
