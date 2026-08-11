const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const BOT_USERNAME = "sweet_cherry_club_bot";
const MODERATION_CHAT = "https://t.me";
let currentGeneratedData = "", isOwnProfile = true;

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    let encodedData = urlParams.get("tgWebAppStartParam") || urlParams.get("startapp");
    if (encodedData) { isOwnProfile = false; showViewScreen(encodedData); }
}

function selectGender(val) {
    document.getElementById("reg-gender").value = val;
    document.getElementById("gender-male").classList.toggle("active", val === "Парень");
    document.getElementById("gender-female").classList.toggle("active", val === "Девушка");
}

function selectTarget(val) {
    document.getElementById("reg-target").value = val;
    document.getElementById("target-long").classList.toggle("active", val === "Длительное общение");
    document.getElementById("target-short").classList.toggle("active", val === "На одну ночь");
}

function handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement("canvas");
                canvas.width = 150; canvas.height = img.height * (150 / img.width);
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                const b64 = canvas.toDataURL("image/jpeg", 0.5);
                document.getElementById("reg-photo-base64").value = b64;
                document.getElementById("photo-preview").innerText = "";
                document.getElementById("photo-preview").style.backgroundImage = "url('" + b64 + "')";
            };
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveAndShowProfile() {
    const name = document.getElementById("reg-name").value.trim();
    const age = document.getElementById("reg-age").value.trim();
    const gender = document.getElementById("reg-gender").value;
    const city = document.getElementById("city-search").value.trim(); 
    const target = document.getElementById("reg-target").value;
    const bio = document.getElementById("reg-bio").value.trim();
    const photo = document.getElementById("reg-photo-base64").value;
    const username = tg?.initDataUnsafe?.user?.username || "test_user";

    if (!name || !age || !city || !bio) { return alert("Заполните все поля!"); }

    let str = "name=" + encodeURIComponent(name) + "&age=" + encodeURIComponent(age) + "&gender=" + encodeURIComponent(gender) + "&city=" + encodeURIComponent(city) + "&target=" + encodeURIComponent(target) + "&bio=" + encodeURIComponent(bio) + "&user=" + username;
    if (photo) str += "&photo=" + encodeURIComponent(photo);

    currentGeneratedData = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (m, p) => String.fromCharCode("0x" + p)));
    document.getElementById("screen-register").classList.add("hidden");
    showViewScreen(currentGeneratedData);
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
        
        const photo = p.get("photo");
        const avatar = document.getElementById("view-avatar-circle");
        if (avatar) {
            if (photo && photo.startsWith("data:image")) { avatar.innerText = ""; avatar.style.backgroundImage = "url('" + photo + "')"; }
            else { avatar.innerText = p.get("gender") === "Девушка" ? "💃" : "🤵"; avatar.style.backgroundImage = "none"; }
        }
        
        const cont = document.getElementById("view-actions-container");
        if (cont) {
            if (isOwnProfile) {
                cont.innerHTML = '<button onclick="shareLink()" class="btn-pink uppercase">Поделиться профилем 🍒</button><button onclick="sendMod()" class="btn-purple" style="background:#621244">Получить галочку 🛡️</button><button onclick="back()" class="btn-purple" style="background:#8e8e8e">Редактировать</button>';
            } else {
                cont.innerHTML = '<a href="https://t.me' + p.get("user") + '" target="_blank" class="btn-pink uppercase" style="text-decoration:none; text-align:center; display:block; line-height:24px;">Написать в ЛС</a>';
            }
        }
        document.getElementById("screen-view").classList.remove("hidden");
    } catch (e) { alert("Ошибка профиля."); document.getElementById("screen-register").classList.remove("hidden"); }
}

function back() { document.getElementById("screen-view").classList.add("hidden"); document.getElementById("screen-register").classList.remove("hidden"); }

function shareLink() {
    const link = "https://t.me" + BOT_USERNAME + "/app?startapp=" + currentGeneratedData;
    const url = "https://t.meshare/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent("🍒 Моя анкета в Cherry Club:");
    if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url, "_blank");
}

function sendMod() {
    const link = "https://t.me" + BOT_USERNAME + "/app?startapp=" + currentGeneratedData;
    const txt = "🍒 ЗАЯВКА НА ВЕРИФИКАЦИЮ:\n\n🔗 Проверить анкету: " + link + "\n\n⚠️ ВНИМАНИЕ: Запишите видео-кружочек СЛЕДУЮЩИМ сообщением в чат!";
    const url = "https://t.meshare/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent(txt);
    if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url, "_blank");
    alert("Отправьте текст в Чат Модерации (" + MODERATION_CHAT + "), а СЛЕДУЮЩИМ сообщением запишите кружочек!");
}

init();
