document.addEventListener("DOMContentLoaded", function () {
    const createVorwandButton = document.getElementById("create-vorwand-button");
    const changeTypeSelect = document.getElementById("change_type");
    const vorwandLink = document.getElementById("vorwand-link");
    const generatedIdInput = document.getElementById("generated-id");
    const linkToCardInput = document.getElementById("link_to_card");
    const changeBranch = document.getElementById("change_branch");

    // 🔹 Логика переключения вкладок
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(tab.dataset.tab).classList.add("active");
        });
    });

    // 🔹 Логика вложенных вкладок
    const nestedTabs = document.querySelectorAll(".nested-tab");
    const nestedContents = document.querySelectorAll(".nested-tab-content");

    nestedTabs.forEach(tab => {
        tab.addEventListener("click", function () {
            nestedTabs.forEach(t => t.classList.remove("active"));
            nestedContents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(tab.dataset.nestedTab).classList.add("active");
        });
    });

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

    // 🔹 Вызываем функции при загрузке страницы, чтобы сразу применить блокировки
    updateLinkToCardState();
    updateChangeBranch();

    // 🔹 Логика обработки ошибок справа от поля
    function showError(message) {
        let errorLabel = document.getElementById("error-message");

        if (!errorLabel) {
            errorLabel = document.createElement("div");
            errorLabel.id = "error-message";
            errorLabel.style.color = "red";
            errorLabel.style.position = "absolute";
            errorLabel.style.left = "110%";
            errorLabel.style.top = "50%";
            errorLabel.style.transform = "translateY(-50%)";
            errorLabel.style.whiteSpace = "nowrap";
            errorLabel.style.paddingLeft = "10px";

            const container = document.createElement("div");
            container.style.position = "relative";
            container.style.display = "inline-block";

            linkToCardInput.parentNode.insertBefore(container, linkToCardInput);
            container.appendChild(linkToCardInput);
            container.appendChild(errorLabel);
        }

        errorLabel.textContent = message;
        errorLabel.style.display = "inline";

        document.addEventListener("click", function hideError(event) {
            if (!linkToCardInput.contains(event.target) && event.target !== errorLabel) {
                errorLabel.style.display = "none";
                document.removeEventListener("click", hideError);
            }
        });
    }

    // 🔹 Логика создания зацепки - какой апи запрос использовать
    createVorwandButton.addEventListener("click", async function () {
        createVorwandButton.disabled = true;
        createVorwandButton.textContent = "Ожидание...";

        const selectedCityCode = changeBranch.value;
        const cardSyncode = linkToCardInput.value;
        const changeType = changeTypeSelect.value;

        if (changeType === "Новая орг-ция" && !selectedCityCode) {
            alert("Пожалуйста, выберите город!");
            resetButton();
            return;
        }

        if (changeType === "Обновить данные орг-ции" && !cardSyncode) {
            alert("Введите syncode карточки!");
            resetButton();
            return;
        }

        // 🔹 Собираем выбранные рубрики и
        let selectedRubrics = [];
        $('.rubric-group').each(function() {
            let rubricId = $(this).find('.rubric-select').val();
            let action = $(this).find('.rubric-action').val();  // "Create" или "Delete"

            if (rubricId) {
                selectedRubrics.push({ "id": rubricId, "action": action });
            }
        });

        console.log("📌 Перед отправкой rubrics:", selectedRubrics);  // ✅ Логируем перед отправкой


        let apiUrl;
        let requestData = {
        city_code: selectedCityCode,
        rubrics: selectedRubrics
        };

        // 🔹 Добавляем рубрики в запрос, только если они есть
        if (selectedRubrics.length > 0) {
            requestData.rubrics = selectedRubrics;
        }

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
});

// Выбрать рубрику

$(document).ready(function() {
    $('#rubric').select2({
        placeholder: "Выберите рубрику",
        allowClear: true,  // ✅ Добавляем крестик для очистки
        minimumInputLength: 2,  // Начнем поиск после ввода 2 символов
        ajax: {
            url: "/api/rubrics",
            dataType: 'json',
            delay: 270,
            data: function (params) {
                return { term: params.term };  // 🔹 Передаем введенный текст в API
            },
            processResults: function (data) {
                console.log("Полученные данные:", data);  // Лог в консоль
                return { results: data };
            },
            error: function(xhr, status, error) {
                console.log("Ошибка запроса:", error);  // Лог ошибок
            }
        }
    });
});

// добавить еще рубрику
$(document).ready(function() {
    function initSelect2(selector) {
        $(selector).select2({
            placeholder: "Выберите рубрику",
            allowClear: true,
            minimumInputLength: 2,
            ajax: {
                url: "/api/rubrics",
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return { term: params.term };
                },
                processResults: function (data) {
                    return { results: data };
                }
            }
        });
    }

    // Инициализируем Select2 для первого поля
    initSelect2('.rubric-select');

    // Добавление нового поля рубрики
    $('#add-rubric').click(function() {
        let rubricCount = $('.rubric-group').length + 1;  // Делаем уникальное имя для radio

        let newRubric = $('<div class="rubric-group">' +
            '<select class="rubric-action" style="width: 80px; margin-right: 10px;">' +
                    '<option value="Create" selected>Создать</option>' +
                    '<option value="Delete">Удалить</option>' +
            '</select>' +
            '<select class="rubric-select" name="rubrics[]" style="width: 300px;"></select>' +
            '<span class="remove-rubric">✖</span>' +
            '</div>');

        $('#rubrics-container').append(newRubric);
        initSelect2(newRubric.find('.rubric-select'));

    // Показываем кнопку удаления у новых элементов
        newRubric.find('.remove-rubric').show();
    });

    // Удаление рубрики
    $(document).on('click', '.remove-rubric', function() {
        $(this).parent().remove();
    });

    // 🔹 Собираем ID рубрик перед отправкой формы
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