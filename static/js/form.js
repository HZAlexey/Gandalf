export function collectFormData() {
    const selectedCityCode = document.getElementById("change_branch").value;
    const cardSyncode = document.getElementById("link_to_card").value;
    const changeType = document.getElementById("change_type").value;

    if (changeType === "Новая орг-ция" && !selectedCityCode) {
        throw new Error("Пожалуйста, выберите город!");
    }

    if (changeType === "Обновить данные орг-ции" && !cardSyncode) {
        throw new Error("Введите syncode карточки!");
    }

    let selectedRubrics = [];
    document.querySelectorAll(".rubric-group").forEach(group => {
        let rubricId = group.querySelector(".rubric-select").value;
        let action = group.querySelector(".rubric-action").value;
        if (rubricId) {
            selectedRubrics.push({ id: rubricId, action: action });
        }
    });


    let requestData = { city_code: selectedCityCode, rubrics: selectedRubrics };
    if (changeType === "Обновить данные орг-ции") {
        requestData.card_syncode = cardSyncode;
    }

    return { requestData, changeType };
}