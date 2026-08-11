const tg = window.Telegram?.WebApp; if (tg) { tg.ready(); tg.expand(); }
const BOT_USERNAME = "sweet_cherry_club_bot", MODERATION_CHAT = "https://t.me";
let currentGeneratedData = "", isOwnProfile = true;

function init() {
    renderCityList();
    document.addEventListener("click", e => {
        const d = document.getElementById("dots-dropdown"); if (d) d.classList.add("hidden");
        if (!e.target.closest(".form-group-vertical")) hideCityList();
    });
    const urlParams = new URLSearchParams(window.location.search);
    let enc = urlParams.get("tgWebAppStartParam") || urlParams.get("startapp");
    if (enc) { isOwnProfile = false; document.getElementById("screen-auth").classList.add("hidden"); showViewScreen(enc); }
}

function authAction(type) {
    const saved = localStorage.getItem("cherry_profile_data");
    if (type === "login") {
        if (saved) { document.getElementById("screen-auth").classList.add("hidden"); showViewScreen(saved); }
        else alert("У вас еще нет анкеты! Пройдите регистрацию.");
    } else if (type === "register") {
        document.getElementById("screen-auth").classList.add("hidden"); document.getElementById("screen-register").classList.remove("hidden");
    }
}

function renderCityList() {
    const c = document.getElementById("city-dropdown"); if (!c || typeof cities === "undefined") return;
    c.innerHTML = ""; cities.forEach(city => {
        const d = document.createElement("div"); d.className = "city-item"; d.innerText = city; d.onclick = () => selectCity(city); c.appendChild(d);
    });
}
function showCityList() { const e = document.getElementById("city-dropdown"); if (e) e.classList.remove("hidden"); }
function hideCityList() { const e = document.getElementById("city-dropdown"); if (e) e.classList.add("hidden"); }
function filterCities() {
    const val = document.getElementById("city-search").value.toLowerCase();
    const items = document.querySelectorAll('.city-item'); let has = false;
    items.forEach(i => { const match = i.innerText.toLowerCase().includes(val); i.style.display = match ? "block" : "none"; if (match) has = true; });
    if (has) showCityList(); else hideCityList();
}
function selectCity(city) { document.getElementById("city-search").value = city; document.getElementById("reg-city").value = city; hideCityList(); }
function validateAgeInput(i) { if (i.value && parseInt(i.value) < 18) { alert("Вход только с 18 лет!"); i.value = ""; } }
function toggleDotsMenu(e) { e.stopPropagation(); const d = document.getElementById("dots-dropdown"); if (d) d.classList.toggle("hidden"); }
function selectGender(v) { document.getElementById("reg-gender").value = v; document.getElementById("gender-male").classList.toggle("active", v === "Парень"); document.getElementById("gender-female").classList.toggle("active", v === "Девушка"); }
function selectTarget(v) { document.getElementById("reg-target").value = v; document.getElementById("target-long").classList.toggle("active", v === "Длительное общение"); document.getElementById("target-short").classList.toggle("active", v === "На одну ночь"); }

function handlePhotoUpload(input) {
    if (input.files && input.files) {
        const reader = new FileReader(); reader.onload = function(e) {
            const img = new Image(); img.src = e.target.result; img.onload = function() {
                const canvas = document.createElement("canvas"); canvas.width = 150; canvas.height = img.height * (150 / img.width);
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                const b64 = canvas.toDataURL("image/jpeg", 0.5); document.getElementById("reg-photo-base64").value = b64;
                const p = document.getElementById("photo-preview"); if (p) { p.innerText = ""; p.style.backgroundImage = "url('" + b64 + "')"; }
            };
        }; reader.readAsDataURL(input.files);
    }
}

function saveAndShowProfile() {
    const n = document.getElementById("reg-name").value.trim(), a = document.getElementById("reg-age").value.trim();
    const g = document.getElementById("reg-gender").value, c = document.getElementById("reg-city").value; 
    const t = document.getElementById("reg-target").value, b = document.getElementById("reg-bio").value.trim();
    const p = document.getElementById("reg-photo-base64").value, u = tg?.initDataUnsafe?.user?.username || "test_user";
    if (!n || !a || !c || !b) return alert("Заполните все поля и выберите город!");
    if (parseInt(a) < 18) return alert("Регистрация только с 18 лет!");
    let str = "name=" + encodeURIComponent(n) + "&age=" + encodeURIComponent(a) + "&gender=" + encodeURIComponent(g) + "&city=" + encodeURIComponent(c) + "&target=" + encodeURIComponent(t) + "&bio=" + encodeURIComponent(b) + "&user=" + u;
    if (p) str += "&photo=" + encodeURIComponent(p);
    currentGeneratedData = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (m, p) => String.fromCharCode("0x" + p)));
    localStorage.setItem("cherry_profile_data", currentGeneratedData);
    document.getElementById("screen-register").classList.add("hidden"); showViewScreen(currentGeneratedData);
}

function showViewScreen(encodedData) {
    try {
        currentGeneratedData = encodedData;
        const decoded = decodeURIComponent(atob(encodedData).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
        const p = new URLSearchParams(decoded);
        document.getElementById("view-name").innerText = p.get("name") + ", " + p.get("age");
        document.getElementById("view-gender-city").innerText = p.get("gender") + " • " + p.get("city");
        document.getElementById("view-target").innerText = "Цель: " + p.get("target");
        document.getElementById("view-bio").innerText = p.get("bio");
        const photo = p.get("photo"), avatar = document.getElementById("view-avatar-circle");
        if (avatar) {
            if (photo && photo.startsWith("data:image")) { avatar.innerText = ""; avatar.style.backgroundImage = "url('" + photo + "')"; }
            else { avatar.innerText = p.get("gender") === "Девушка" ? "💃" : "🤵"; avatar.style.backgroundImage = "none"; }
        }
        const dotsBtn = document.getElementById("dots-menu-btn"), cont = document.getElementById("view-actions-container"), sb = document.getElementById("swipe-buttons-container"), hint = document.getElementById("swipe-hint");
        if (cont) {
            cont.innerHTML = "";
            if (isOwnProfile) {
                if (dotsBtn) dotsBtn.classList.remove("hidden"); if (sb) sb.classList.add("hidden"); if (hint) hint.style.display = "block";
                cont.innerHTML = '<button onclick="shareLink()" class="btn-pink uppercase">Поделиться профилем 🍒</button><button onclick="sendMod()" class="btn-purple" style="background:#621244">Получить галочку 🛡️</button>';
            } else {
                if (dotsBtn) dotsBtn.classList.add("hidden"); if (hint) hint.style.display = "none";
                if (sb) sb.classList.remove("hidden");
            }
        }
        document.getElementById("screen-view").classList.remove("hidden");
    } catch (e) { alert("Ошибка профиля."); document.getElementById("screen-register").classList.remove("hidden"); }
}

function deleteOwnProfile() {
    if (confirm("Удалить анкету? Это сотрет все данные.")) {
        localStorage.removeItem("cherry_profile_data"); alert("Удалено!");
        document.getElementById("screen-view").classList.add("hidden"); document.getElementById("screen-auth").classList.remove("hidden");
    }
}
function back() { document.getElementById("screen-view").classList.add("hidden"); document.getElementById("screen-register").classList.remove("hidden"); }
function shareLink() {
    const l = "https://t.me" + BOT_USERNAME + "/app?startapp=" + currentGeneratedData;
    const url = "https://t.meshare/url?url=" + encodeURIComponent(l) + "&text=" + encodeURIComponent("🍒 Моя анкета в Cherry Club:");
    if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url, '_blank');
}
function sendMod() {
    const l = "https://t.me" + BOT_USERNAME + "/app?startapp=" + currentGeneratedData;
    const txt = "🍒 ЗАЯВКА НА ВЕРИФИКАЦИЮ:\n\n🔗 Проверить анкету: " + l + "\n\n⚠️ ВНИМАНИЕ: Запишите видео-кружочек СЛЕДУЮЩИМ сообщением в чат!";
    const url = "https://t.meshare/url?url=" + encodeURIComponent(l) + "&text=" + encodeURIComponent(txt);
    if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url, '_blank');
    alert("Отправьте текст в Чат Модерации, а затем запишите кружочек!");
}
init();
