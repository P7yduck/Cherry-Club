const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const BOT_USERNAME = "sweet_cherry_club_bot";
const MODERATION_CHAT = "https://t.me/+hI06u9Gscp03Y2Vi";

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

// Глобальные переменные для хранения текущей сгенерированной ссылки
let currentGeneratedData = "";
let isOwnProfile = false;

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
        // Мы открыли ЧУЖУЮ анкету по ссылке
        isOwnProfile = false;
        showViewScreen(encodedData);
    } else {
        // Мы открыли приложение просто так (свой профиль)
        isOwnProfile = true;
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

function handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 150;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const base64Data = canvas.toDataURL('image/jpeg', 0.5);
                document.getElementById('reg-photo-base64').value = base64Data;
                
                const preview = document.getElementById('photo-preview');
                preview.innerText = '';
                preview.style.backgroundImage = "url('" + base64Data + "')";
            };
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ФУНКЦИЯ СОХРАНЕНИЯ: ПЕРЕНПРАВЛЯЕТ НА СТРАНИЦУ ПРОФИЛЯ СРАЗУ
function saveAndShowProfile() {
    const name = document.getElementById('reg-name').value.trim();
    const age = document.getElementById('reg-age').value.trim();
    const gender = document.getElementById('reg-gender').value;
    const city = document.getElementById('reg-city').value; 
    const target = document.getElementById('reg-target').value;
    const bio = document.getElementById('reg-bio').value.trim();
    const photo = document.getElementById('reg-photo-base64').value;
    const username = tg?.initDataUnsafe?.user?.username || "test_user";

    if (!name || !age || !city || !bio) { 
        return alert("Пожалуйста, заполните все поля анкеты!"); 
    }

    let profileString = `name=${encodeURIComponent(name)}&age=${encodeURIComponent(age)}&gender=${encodeURIComponent(gender)}&city=${encodeURIComponent(city)}&target=${encodeURIComponent(target)}&bio=${encodeURIComponent(bio)}&user=${username}`;
    if (photo) {
        profileString += `&photo=${encodeURIComponent(photo)}`;
    }

    currentGeneratedData = btoa(encodeURIComponent(profileString).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));

    // Прячем экран ввода, включаем экран просмотра
    document.getElementById('screen-register').classList.add('hidden');
    showViewScreen(currentGeneratedData);
}

function showViewScreen(encodedData) {
    try {
        currentGeneratedData = encodedData;
        const decodedString = decodeURIComponent(atob(encodedData).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const params = new URLSearchParams(decodedString);
        
        document.getElementById('view-name').innerText = params.get('name') + ", " + params.get('age');
        document.getElementById('view-gender-city').innerText = params.get('gender') + " • " + params.get('city');
        document.getElementById('view-target').innerText = "Цель: " + params.get('target');
        document.getElementById('view-bio').innerText = params.get('bio');
        
        const photoData = params.get('photo');
        const avatarCircle = document.getElementById('view-avatar-circle');
        if (photoData && photoData.startsWith('data:image')) {
            avatarCircle.innerText = '';
            avatarCircle.style.backgroundImage = "url('" + photoData + "')";
        } else {
            avatarCircle.innerText = params.get('gender') === 'Девушка' ? '💃' : '🤵';
            avatarCircle.style.backgroundImage = 'none';
        }
        
        // РЕНДЕР КНОПОК ПОД ЭКРАН
        const actionsContainer = document.getElementById('view-actions-container');
        actionsContainer.innerHTML = '';

        if (isOwnProfile) {
            // Если это СВОЙ СОБСТВЕННЫЙ профиль — выводим функции шеринга и верификации
            actionsContainer.innerHTML = `
                <button onclick="shareProfileLink()" class="btn-pink uppercase" style="margin: 5px auto;">Поделиться профилем 🍒</button>
                <button onclick="sendToModeration()" class="btn-purple uppercase" style="margin: 5px auto; background: #621244;">Пройти верификацию 🛡️</button>
                <button onclick="backToEdit()" class="btn-purple uppercase" style="margin: 5px auto; background: #8e8e8e; color: white;">Редактировать</button>
            `;
        } else {
            // Если это ЧУЖОЙ профиль — выводим кнопку «Написать»
            actionsContainer.innerHTML = `
                <a href="https://t.me{params.get('user')}" target="_blank" class="btn-pink uppercase" style="text-decoration:none; text-align:center; display:block; line-height:24px; margin: 5px auto;">Написать в ЛС</a>
            `;
        }

        document.getElementById('screen-view').classList.remove('hidden');
    } catch (e) {
        alert("Ошибка отображения профиля.");
        document.getElementById('screen-register').classList.remove('hidden');
    }
}

function backToEdit() {
    document.getElementById('screen-view').classList.add('hidden');
    document.getElementById('screen-register').classList.remove('hidden');
}

// КНОПКА 1: ПРОСТО БЫСТРЫЙ ШЕРИНГ ССЫЛКИ
function shareProfileLink() {
    const appLink = `https://t.me{BOT_USERNAME}/app?startapp=${currentGeneratedData}`;
    const shareText = `🍒 Привет! Глянь мою анкету в децентрализованном клубе знакомств Cherry Club! Ищи меня по ссылке:`;
    
    const url = "https://t.me" + encodeURIComponent(appLink) + "&text=" + encodeURIComponent(shareText);
    if (tg && tg.openTelegramLink) tg.openTelegramLink(url);
    else window.open(url, '_blank');
}

// КНОПКА 2: ОТПРАВКА НА ВЕРИФИКАЦИЮ С КРУЖОЧКОМ (ОПЦИОНАЛЬНО)
function sendToModeration() {
