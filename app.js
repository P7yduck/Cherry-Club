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
        if (!e.target.closest('.form-group-vertical')) {
            hideCityList();
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    let encodedData = urlParams.get('tgWebAppStartParam') || urlParams.get('startapp');

    if (encodedData) {
        showViewScreen(encodedData);
    } else {
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

function showCityList() { document.getElementById('city-dropdown').classList.remove('hidden'); }
function hideCityList() { document.getElementById('city-dropdown').classList.add('hidden'); }

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

function selectGender(genderValue) {
    document.getElementById('reg-gender').value = genderValue;
    if (genderValue === 'Парень') {
        document.getElementById('gender-male').classList.add('active');
        document.getElementById('gender-female').classList.remove('active');
    } else {
        document.getElementById('gender-female').classList.add('active');
        document.getElementById('gender-male').classList.remove('active');
    }
}

function selectTarget(targetValue) {
    document.getElementById('reg-target').value = targetValue;
    if (targetValue === 'Длительное общение') {
        document.getElementById('target-long').classList.add('active');
        document.getElementById('target-short').classList.remove('active');
    } else {
        document.getElementById('target-short').classList.add('active');
        document.getElementById('target-long').classList.remove('active');
    }
}

// ОБРАБОТКА И СЖАТИЕ ФОТО ДЛЯ ССЫЛКИ
function handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                // Создаем холст для экстремального сжатия фото ради экономии места в ссылке
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 150;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Переводим в сжатый base64 JPEG
                const base64Data = canvas.toDataURL('image/jpeg', 0.5);
                document.getElementById('reg-photo-base64').value = base64Data;
                
                // Рисуем превью в окне приложения
                const preview = document.getElementById('photo-preview');
                preview.innerText = '';
                preview.style.backgroundImage = `url(${base64Data})`;
            };
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function showViewScreen(encodedData) {
    try {
        const decodedString = decodeURIComponent(atob(encodedData).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const params = new URLSearchParams(decodedString);
        
        document.getElementById('view-name').innerText = params.get('name') + ", " + params.get('age');
        document.getElementById('view-gender-city').innerText = params.get('gender') + " • " + params.get('city');
        document.getElementById('view-target').innerText = "Цель: " + params.get('target');
        document.getElementById('view-bio').innerText = params.get('bio');
        document.getElementById('view-chat-btn').href = "https://t.me" + params.get('user');
        
        // Подгружаем фото аватара, если оно передано по ссылке
        const photoData = params.get('photo');
        const avatarCircle = document.getElementById('view-avatar-circle');
        if (photoData && photoData.startsWith('data:image')) {
            avatarCircle.innerText = '';
            avatarCircle.style.backgroundImage = `url(${photoData})`;
        } else {
            avatarCircle.innerText = params.get('gender') === 'Девушка' ? '💃' : '🤵';
            avatarCircle.style.backgroundImage = 'none';
        }
        
        document.getElementById('screen-view').classList.remove('hidden');
    } catch (e) {
        alert("Ошибка разбора анкеты.");
        document.getElementById('screen-register').classList.remove('hidden');
    }
}

function shareProfile() {
    const name = document.getElementById('reg-name').value.trim();
    const age = document.getElementById('reg-age').value.trim();
    const gender = document.getElementById('reg-gender').value;
    const city = document.getElementById('reg-city').value; 
    const target = document.getElementById('reg-target').value;
    const bio = document.getElementById('reg-bio').value.trim();
    const photo = document.getElementById('reg-photo-base64').value;
    const username = tg?.initDataUnsafe?.user?.username || "test_user";

    if (!name || !age || !city || !bio) { return alert("Заполните имя, возраст, выберите город из списка и заполните описание!"); }

    // Собираем все параметры
    let profileString = `name=${encodeURIComponent(name)}&age=${encodeURIComponent(age)}&gender=${encodeURIComponent(gender)}&city=${encodeURIComponent(city)}&target=${encodeURIComponent(target)}&bio=${encodeURIComponent(bio)}&user=${username}`;
    if (photo) {
        profileString += `&photo=${encodeURIComponent(photo)}`;
    }

    const encodedData = btoa(encodeURIComponent(profileString).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));

    const appLink = `https://t.me${BOT_USERNAME}/app?startapp=${encodedData}`;
    const shareText = `🍒 ЗАЯВКА CHERRY CLUB:\n\n👤 Имя: ${name}, ${age} лет (${gender})\n📍 Город: ${city}\n🎯 Цель: ${target}\n📝 О себе: ${bio}\n\n🔗 Смотреть анкету и фото: ${appLink}`;

    const finalTelegramUrl = "https://t.meshare/url?url=" + encodeURIComponent(appLink) + "&text=" + encodeURIComponent(shareText);

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(finalTelegramUrl);
    } else {
        window.open(finalTelegramUrl, '_blank');
    }
    
    alert("Инструкция:\nОтправьте текст анкеты в Чат Модерации (" + MODERATION_CHAT + "). После проверки администратором она появится в общей ленте!");
}

init();
