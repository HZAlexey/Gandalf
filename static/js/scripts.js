document.addEventListener("DOMContentLoaded", function () {
    const createVorwandButton = document.getElementById("create-vorwand-button");
    const changeTypeSelect = document.getElementById("change_type");
    const vorwandLink = document.getElementById("vorwand-link");
    const generatedIdInput = document.getElementById("generated-id");
    const linkToCardInput = document.getElementById("link_to_card");
    const changeBranch = document.getElementById("change_branch");

    // 🔹 Функция блокировки/разблокировки "Связь с карточкой"
    function updateLinkToCardState() {
        const selectedChangeType = changeTypeSelect.value;
        const changeTypeLabel = document.querySelector('label[for="link_to_card"]');

        if (selectedChangeType === 'Новая орг-ция') {
            linkToCardInput.disabled = true;
            linkToCardInput.value = "";
            changeTypeLabel.classList.add('disabled-style');
        } else {
            linkToCardInput.disabled = false;
            changeTypeLabel.classList.remove('disabled-style');
        }
    }

    // 🔹 Функция блокировки/разблокировки "Проект"
    function updateChangeBranch() {
        const selectedChangeType = changeTypeSelect.value;
        const changeTypeLabel = document.querySelector('label[for="change_branch"]');

        if (selectedChangeType === 'Обновить данные орг-ции') {
            changeBranch.disabled = true;
            changeBranch.value = "";
            changeTypeLabel.classList.add('disabled-style');
        } else {
            changeBranch.disabled = false;
            changeTypeLabel.classList.remove('disabled-style');
        }
    }

    // 🔹 Обновляем блокировки при изменении "Тип изменения"
    changeTypeSelect.addEventListener("change", function () {
        updateLinkToCardState();
        updateChangeBranch();
    });

    // 🔹 Вызываем функции при загрузке страницы, чтобы сразу применить блокировки
    updateLinkToCardState();
    updateChangeBranch();

    // 🔹 Логика создания зацепки
    createVorwandButton.addEventListener("click", async function () {
        createVorwandButton.disabled = true;
        createVorwandButton.textContent = "Ожидание...";

        const selectedCityCode = changeBranch.value;
        const cardSyncode = linkToCardInput.value;
        const changeType = changeTypeSelect.value;

        if (changeType === "Новая орг-ция" && !selectedCityCode) {
            alert("Проект не выбран!");
            resetButton();
            return;
        }

        if (changeType === "Обновить данные орг-ции" && !cardSyncode) {
            alert("Введите syncode карточки!");
            resetButton();
            return;
        }

        let apiUrl;
        let requestData = {};

        if (changeType === "Новая орг-ция") {
            apiUrl = "/api/create-vorwand";
            requestData.city_code = selectedCityCode;
        } else if (changeType === "Обновить данные орг-ции") {
            apiUrl = "/api/update-vorwand";
            requestData.card_syncode = cardSyncode;
        } else {
            alert("Не выбран тип изменения!");
            resetButton();
            return;
        }

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Неизвестная ошибка");
            }

            generatedIdInput.value = data.vorwand_id || "Ошибка!";

            if (data.vorwand_id) {
                vorwandLink.href = `https://${sessionHostname}/vorwand#/id=${data.vorwand_id}`;
                vorwandLink.style.display = "inline";
            } else {
                vorwandLink.style.display = "none";
            }
        } catch (error) {
            console.error("Ошибка при запросе:", error);
            showError(error.message);
        } finally {
            resetButton();
        }
    });

    function resetButton() {
        createVorwandButton.disabled = false;
        createVorwandButton.textContent = "Создать зацепку";
    }

    function showError(message) {
    let errorLabel = document.getElementById("error-message");

    if (!errorLabel) {
        errorLabel = document.createElement("div");
        errorLabel.id = "error-message";
        errorLabel.style.color = "red";
        errorLabel.style.position = "absolute";  // ✅ Размещаем справа
        errorLabel.style.left = "100%";  // ✅ Смещаем вправо от input
        errorLabel.style.top = "50%";  // Центрируем по высоте
        errorLabel.style.transform = "translateY(-50%)";  // Корректируем позицию
        errorLabel.style.whiteSpace = "nowrap";  // Не переносить текст
        errorLabel.style.paddingLeft = "10px";

        // Контейнер для позиционирования
        const container = document.createElement("div");
        container.style.position = "relative";  // ✅ Делаем контейнер относительным
        container.style.display = "inline-block";  // Оставляем input в потоке

        // Вставляем input внутрь контейнера
        linkToCardInput.parentNode.insertBefore(container, linkToCardInput);
        container.appendChild(linkToCardInput);
        container.appendChild(errorLabel);
    }

    errorLabel.textContent = message;
    errorLabel.style.display = "inline";  // Показываем ошибку

    // ✅ При клике в любое место скрываем ошибку
    document.addEventListener("click", function hideError(event) {
        if (!linkToCardInput.contains(event.target) && event.target !== errorLabel) {
            errorLabel.style.display = "none";
            document.removeEventListener("click", hideError);
        }
    });
}
});