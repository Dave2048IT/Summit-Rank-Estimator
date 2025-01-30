// Berechnung des geschätzten Rangs
function getEstimatedRank() {
    const now = new Date();

    // Falls es Mittwoch zwischen 3:00 und 4:00 UTC ist, die Berechnung abbrechen
    if (now.getUTCDay() === 3 && now.getUTCHours() >= 3 && now.getUTCHours() < 4) {
        document.querySelector("#summit-info").style.display = "block"; // Zeige Summit-Info
        return 0; // Funktion beenden
    }

    // Nächsten Mittwoch um 3:00 Uhr UTC berechnen
    const nextWednesday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 3, 0, 0, 0));
    nextWednesday.setDate(nextWednesday.getDate() + ((3 - now.getUTCDay() + 7) % 7));

    let remainingTime = nextWednesday.getTime() - now.getTime();
    if (remainingTime < 0) remainingTime += 604800000; // Eine Woche hinzufügen, falls das Summit bereits vorbei ist

    // Verbleibende Zeit berechnen
    const days = Math.floor(remainingTime / 86400000);
    const hours = Math.floor((remainingTime % 86400000) / 3600000);
    const minutes = Math.floor((remainingTime % 3600000) / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);

    const locale = document.documentElement.lang; // Aktuelle Sprache
    let daysText = locale === "de" ? "Tage" : "days";
	if (days === 1) {
		daysText = daysText.slice(0, -1); // Entfernt das letzte Zeichen von "Tage" oder "days"
	}

    document.getElementById("RemainingTimeText").textContent = `${days} ${daysText}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}'${String(seconds).padStart(2, '0')}"`;

    return safeRank(remainingTime);
}

// Für 6d 23h
function safeRank(remainingTimeMs, totalDurationMs = 601200000, maxRank = 10000) {
    return maxRank * 0.99 * Math.pow((totalDurationMs - remainingTimeMs) / totalDurationMs, 1.5);
}

// Funktion zur Formatierung von Zahlen mit Tausendertrennung
function formatWith1000sep(number) {
    const locale = document.documentElement.lang; // Aktuelle Sprache (z. B. "en" oder "de")
    return new Intl.NumberFormat(locale).format(number);
}

// Ränge berechnen und anzeigen
let estimatedRank = getEstimatedRank();
if (estimatedRank) { // Nur, wenn getEstimatedRank() eine Zahl zurückgibt (nicht NaN) und nicht abgebrochen wurde.
    const ranks = {
        "platin": estimatedRank,
        "gold": estimatedRank * 2,
        "silber": estimatedRank * 4
    };

    for (let rank in ranks) {
        document.getElementById(rank).textContent = formatWith1000sep(Math.ceil(ranks[rank]));
    }
}
