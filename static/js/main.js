import { initRubricSelect, initRubricManagement, initializeTabs, initializeNestedTabs, setupModal, updateRubricVisibility } from "./ui.js";
import { setupFormSubmission, setupFieldStateManagement, setupCreateVorwand } from "./events.js";

document.addEventListener("DOMContentLoaded", function () {
    initRubricSelect();  // Инициализация выбора рубрики
    initRubricManagement(); // Логика добавления/удаления рубрик
    initializeTabs(); // Переключение вкладок
    initializeNestedTabs(); // Переключение вложенных вкладок
    setupFormSubmission(); // Обработчик отправки формы
    setupFieldStateManagement(); // Блокировка/разблокировка полей
    setupCreateVorwand();  // Логика создания зацепки
    setupModal(); // появление модального окна с запросом OriginValue
    updateRubricVisibility(); // логика скрывания действия с рубриками, если выбран тип "Новая орг-ция"
});