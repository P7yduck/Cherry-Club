const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const BOT_USERNAME = "sweet_cherry_club_bot";
const MODERATION_CHAT = "https://t.me";

const cities = [
    "Архангельск", "Северодвинск", "Котлас", "Новодвинск", "Коряжма", "Мирный", "Вельск",
    "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань", "Нижний Новгород",
    "Челябинск", "Самара", "Омск", "Ростов-на-Дону", "Уфа", "Красноярск", "Пермь", "Воронеж",
    "Волгоград", "Краснодар", "Саратов", "Тюмень", "Тольятти", "Ижевск", "Барнаул", "Ульяновск",
    "Иркутск", "Владивосток", "Ярославль", "Махачкала", "Томск", "Оренбург", "Кемерово",
    "Новокузнецк", "Рязань", "Астрахань", "Набережные Челны", "Пенза", "Липецк", "Тула",
    "Киров", "Чебоксары", "Калининград", "Курск", "Улан-Удэ", "Ставрополь", "Магнитогорск",
    "Тверь", "Иваново", "Брянск", "Сочи", "Белгород", "Нижний Тагил", "Владимир", "Севастополь",
    "Смоленск", "Курган", "Череповец", "Вологда", "Орел", "Владикавказ", "Мурманск", "Саранск"
].sort();

function init() {
    renderCityList();
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.form-group')) {
            hideCityList();
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    let encodedData = urlParams.get('tgWebAppStartParam') || urlParams.get('startapp');

    if (encodedData) {
        showViewScreen(encodedData);
    } else {
        // Убрали экран совпадений, сразу открываем создание анкеты
        document.getElementById('screen-register').classList.remove('hidden');
    }
}

function renderCityList() {
    const container = document.getElementById('city-dropdown');
    container.innerHTML = '';
    cities.forEach(city => {
        const div = document.createElement('div');
        div.className = 'city-item';
        div.innerText = city;
        div.onclick = () => selectCity(city);
        container.appendChild(div);
    });
}

function showCityList() {
    document.getElementById('city-dropdown').classList.remove('hidden');
}

function hideCityList() {
    document.getElementById('city-dropdown').classList.add('hidden');
}

function filterCities() {
    const value = document.getElementById('city-search').value.toLowerCase();
    const items = document.querySelectorAll('.city-item');
    let hasResults = false;
    
    items.forEach(item => {
        if (item.innerText.toLowerCase().includes(value)) {
            item.style.display = 'block';
            hasResults = true;
        } else {
            item.style.display = 'none';
        }
    });
    
    if (hasResults) showCityList();
    else hideCityList();
}

function selectCity(city) {
    document.getElementById('city-search').value = city;
    document.getElementById('reg-city').value = city;
    hideCityList();
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
    const city = document.getElementById('reg-city').value; 
    const bio = document.getElementById('reg-bio').value.trim();
    const username = tg?.initDataUnsafe?.user?.username || "test_user";

    if (!nameAge || !city || !bio) { return alert("Заполните имя, выберите город из списка и заполните описание!"); }

    const profileString = `name=${encodeURIComponent(nameAge)}&city=${encodeURIComponent(city)}&bio=${encodeURIComponent(bio)}&user=${username}`;
    const encodedData = btoa(encodeURIComponent(profileString).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));

    const appLink = `https://t.me${BOT_USERNAME}/app?startapp=${encodedData}`;
    const shareText = `🍒 ЗАЯВКА CHERRY CLUB:\n\n👤 Профиль: ${nameAge}\n📍 Город: ${city}\n📝 О себе: ${bio}\n\n🔗 Смотреть анкету: ${appLink}`;

    const finalTelegramUrl = "https://t.meshare/url?url=" + encodeURIComponent(appLink) + "&text=" + encodeURIComponent(shareText);

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(finalTelegramUrl);
    } else {
        window.open(finalTelegramUrl, '_blank');
    }
    
    alert("Инструкция:\nОтправьте текст анкеты в Чат Модерации (" + MODERATION_CHAT + "). После проверки администратором она появится в общей ленте!");
}

init();
