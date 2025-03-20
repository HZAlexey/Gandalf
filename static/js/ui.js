export function resetButton(button) {
    button.disabled = false;
    button.textContent = "Создать зацепку";
}

// Создаем ссылку на созданную зацепку
export function updateUIAfterCreation(data) {
    const generatedIdInput = document.getElementById("generated-id");
    const vorwandLink = document.getElementById("vorwand-link");

    generatedIdInput.value = data.vorwand_id || "Ошибка!";

    if (data.vorwand_id) {
        vorwandLink.href = `https://${sessionHostname}/vorwand#/id=${data.vorwand_id}`;
        vorwandLink.style.display = "inline";
    } else {
        vorwandLink.style.display = "none";
    }
}


// Логика отображения на вкладках
export function initializeTabs() {
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
}

export function initializeNestedTabs() {
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
}

// Отображаем рубрики с возможностью поиска

export function initRubricSelect() {
    $(document).ready(function() {
        $('#rubric').select2({
            placeholder: "Выберите рубрику",
            allowClear: true,
            minimumInputLength: 2,
            ajax: {
                url: "/api/rubrics",
                dataType: 'json',
                delay: 270,
                data: function (params) {
                    return { term: params.term };
                },
                processResults: function (data) {
                    console.log("Полученные данные:", data);
                    return { results: data };
                },
                error: function(xhr, status, error) {
                    console.log("Ошибка запроса:", error);
                }
            }
        });
    });
}

export function initRubricManagement() {
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
            let rubricCount = $('.rubric-group').length + 1;

            let newRubric = $('<div class="rubric-group">' +
                '<select class="rubric-action" style="width: 100px;">' +
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
    });
}

// Показывать ошибку справа от поля (если например не нашлась карточка и тд)

export function showError(message, inputElement) {
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

        inputElement.parentNode.insertBefore(container, inputElement);
        container.appendChild(inputElement);
        container.appendChild(errorLabel);
    }

    errorLabel.textContent = message;
    errorLabel.style.display = "inline";

    document.addEventListener("click", function hideError(event) {
        if (!inputElement.contains(event.target) && event.target !== errorLabel) {
            errorLabel.style.display = "none";
            document.removeEventListener("click", hideError);
        }
    });
}