const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const BOT_USERNAME = "sweet_cherry_club_bot";
const MODERATION_CHAT = "https://t.me";

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    let encodedData = urlParams.get('tgWebAppStartParam') || urlParams.get('startapp');

    if (encodedData) {
        // Если перешли по ссылке анкеты — показываем третий экран
        showViewScreen(encodedData);
    } else {
        // Если запуск первый раз — показываем заставку Match
        document.getElementById('screen-match').classList.remove('hidden');
    }
}

function goToRegister() {
    document.getElementById('screen-match').classList.add('hidden');
    document.getElementById('screen-register').classList.remove('hidden');
}

function showViewScreen(encodedData) {
    try {
        const decodedString = decodeURIComponent(atob(encodedData).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const params = new URLSearchParams(decodedString);
        
        document.getElementById('view-name').innerText = params.get('name');
        document.getElementById('view-city').innerText = params.get('city');
        document.getElementById('view-bio').innerText = params.get('bio');
        document.getElementById('view-chat-btn').href = "https://t.me" + params.get('user');
        
        document.getElementById('screen-view').classList.remove('hidden');
    } catch (e) {
        alert("Ошибка разбора анкеты.");
        document.getElementById('screen-register').classList.remove('hidden');
    }
}

function shareProfile() {
    const nameAge = document.getElementById('reg-name').value.trim();
    const city = document.getElementById('reg-city').value.trim();
    const bio = document.getElementById('reg-bio').value.trim();
    const username = tg?.initDataUnsafe?.user?.username || "test_user";

    if (!nameAge || !city || !bio) { return alert("Заполните имя, город и описание!"); }

    const profileString = `name=${encodeURIComponent(nameAge)}&city=${encodeURIComponent(city)}&bio=${encodeURIComponent(bio)}&user=${username}`;
    const encodedData = btoa(encodeURIComponent(profileString).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));

    const appLink = `https://t.me${BOT_USERNAME}/app?startapp=${encodedData}`;
    const shareText = `🍒 ЗАЯВКА CHERRY CLUB:\n\n👤 Профиль: ${nameAge}\n📍 Локация: ${city}\n📝 О себе: ${bio}\n\n🔗 Смотреть анкету: ${appLink}\n\n⚠️ ВНИМАНИЕ: Пришлите видео-кружочек СЛЕДУЮЩИМ сообщением!`;

    const finalTelegramUrl = "https://t.meshare/url?url=" + encodeURIComponent(appLink) + "&text=" + encodeURIComponent(shareText);

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(finalTelegramUrl);
    } else {
        window.open(finalTelegramUrl, '_blank');
    }
    
    alert("Инструкция:\nОтправьте текст в Чат Модерации (" + MODERATION_CHAT + "), а СЛЕДУЮЩИМ сообщением запишите туда свой видео-кружочек.");
}

init();
