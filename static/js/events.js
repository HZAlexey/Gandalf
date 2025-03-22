import { createVorwand } from "./api.js";
import { collectFormData } from "./form.js";
import { resetButton, updateUIAfterCreation } from "./ui.js";

export function setupCreateVorwand() {
    const createVorwandButton = document.getElementById("create-vorwand-button");
    const changeTypeSelect = document.getElementById("change_type");
    const changeBranch = document.getElementById("change_branch");
    const linkToCardInput = document.getElementById("link_to_card");

    if (!createVorwandButton || !changeTypeSelect || !changeBranch || !linkToCardInput) {
        console.error("❌ Ошибка: Один из элементов формы не найден.");
        return;
    }

    function validateFields() {
        const selectedChangeType = changeTypeSelect.value;

        if (!selectedChangeType) {
            alert("Пожалуйста, выберите 'Тип изменения'!");
            return false;
        }

        if (selectedChangeType === "Новая орг-ция" && !changeBranch.value) {
            alert("Пожалуйста, выберите 'Проект'!");
            return false;
        }

        if (selectedChangeType === "Обновить данные орг-ции" && !linkToCardInput.value) {
            alert("Пожалуйста, введите 'Карточку'!");
            return false;
        }

        return true;
    }

    createVorwandButton.addEventListener("click", async function () {
        if (!validateFields()) return;

        createVorwandButton.disabled = true;
        createVorwandButton.textContent = "Ожидание...";

        try {
            const { requestData, changeType } = collectFormData();
            const response = await fetch(`/api/${changeType === "Новая орг-ция" ? "create-vorwand" : "update-vorwand"}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (response.status === 404) {
                alert("Ошибка: Фирма не найдена!");
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || "Неизвестная ошибка");
            }

            updateUIAfterCreation(data);
        } catch (error) {
            if (error.message.includes("Фирма не найдена")) {
                alert(error.message);
            } else {
                console.error("Ошибка при запросе:", error);
                alert("Ошибка: " + error.message);
            }
        } finally {
            resetButton(createVorwandButton);
        }
    });
}


// Логика блокировки полей
export function setupFieldStateManagement() {
    const changeTypeSelect = document.getElementById("change_type");
    const linkToCardInput = document.getElementById("link_to_card");
    const changeBranch = document.getElementById("change_branch");

// 🔹 Функция блокировки/разблокировки "Связь с карточкой"

    function updateLinkToCardState() {
        const selectedChangeType = changeTypeSelect.value;
        const changeTypeLabel = document.querySelector('label[for="link_to_card"]');

        if (selectedChangeType === "Новая орг-ция") {
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

        if (selectedChangeType === "Обновить данные орг-ции") {
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

// Вызываем функции сразу после загрузки страницы
    updateLinkToCardState();
    updateChangeBranch();
};


// Собираем рубрики и события по ним, что бы указать это в запросе

export function setupFormSubmission() {
    $(document).ready(function() {
        $('#submit-form').click(function() {
            let selectedRubrics = [];

            // Собираем выбранные рубрики и их действия
            $('.rubric-group').each(function() {
                let rubricId = $(this).find('.rubric-select').val();  // Получаем ID рубрики
                let action = $(this).find('.rubric-action').val();  // "Create" или "Delete"

                if (rubricId) {
                    selectedRubrics.push({ "id": rubricId, "action": action });  // ✅ Теперь отправляется объект
                }
            });

            let selectedCityCode = $('#change_branch').val();

            if (!selectedCityCode) {
                alert("Пожалуйста, выберите город!");
                return;
            }

            console.log("📌 Перед отправкой rubrics:", selectedRubrics);  // ✅ Логируем перед отправкой

            // Отправляем данные на сервер
            $.ajax({
                url: "/api/create-vorwand",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    city_code: selectedCityCode,
                    rubrics: selectedRubrics
                }),
                success: function(response) {
                    console.log("✅ Ответ сервера:", response);
                    $('#result').val(response.vorwand_id);
                },
                error: function(xhr) {
                    console.error("❌ Ошибка:", xhr.responseText);
                }
            });
        });
    });
};

// Логика скрытия пункта меню действия "Создать" / "Удалить" если выбран тип Новая орг-ция
import { changeTypeSelect } from "./domElements.js";

export function setupRubricVisibility() {
    function updateRubricVisibility() {
        const selectedChangeType = changeTypeSelect.value;
        const rubricActions = document.querySelectorAll(".rubric-action");

        if (selectedChangeType === "Новая орг-ция") {
            rubricActions.forEach(action => {
                action.style.display = "none";
            });
        } else {
            rubricActions.forEach(action => {
                action.style.display = "inline-block";
            });
        }
    }

    changeTypeSelect.addEventListener("change", updateRubricVisibility);

    // Вызываем при загрузке страницы
    updateRubricVisibility();
}