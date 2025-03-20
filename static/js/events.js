import { createVorwand } from "./api.js";
import { collectFormData } from "./form.js";
import { resetButton, updateUIAfterCreation } from "./ui.js";
import { showError } from "./ui.js";

export function setupCreateVorwand() {
    const createVorwandButton = document.getElementById("create-vorwand-button");

    createVorwandButton.addEventListener("click", async function () {
        createVorwandButton.disabled = true;
        createVorwandButton.textContent = "Ожидание...";

        try {
            const { requestData, changeType } = collectFormData();
            const data = await createVorwand(requestData, changeType);
            updateUIAfterCreation(data);
        } catch (error) {
            console.error("Ошибка при запросе:", error);
            showError(error.message);
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