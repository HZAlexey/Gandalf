export async function createVorwand(requestData, changeType) {
    let apiUrl;

    if (changeType === "Новая орг-ция") {
        apiUrl = "/api/create-vorwand";
    } else if (changeType === "Обновить данные орг-ции") {
        apiUrl = "/api/update-vorwand";
    } else {
        throw new Error("Не выбран тип изменения!");
    }

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Неизвестная ошибка");
    }

    return data;
}