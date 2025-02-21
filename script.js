// Konstanten definieren
const MS_PER_DAY = 86400000;
const MS_PER_HOUR = 3600000;
const MS_PER_MINUTE = 60000;
const MS_PER_SECOND = 1000;
const PLATINUM_LIMIT = 10000;
const WEEK_MS = 604800000;
const SUMMIT_DURATION_MS = 601200000;

// Sprache und DOM-Elemente nur einmal abfragen
const locale = document.documentElement.lang || 'en';
const remainingTimeTextEl = document.getElementById("RemainingTimeText");
const summitInfoEl = document.querySelector("#summit-info");
const inputField = document.getElementById("userRankInput");
const outputField = document.getElementById("finalRankOutput");

const medalEls = {
	platin: document.getElementById("platin"),
	gold: document.getElementById("gold"),
	silber: document.getElementById("silber")
};

// Zahl mit Tausendertrennung formatieren
const formatWith1000sep = (number) => new Intl.NumberFormat(locale).format(number);

// Berechnung des sicheren Rangs basierend auf verbleibender Zeit
const safeRank = (remainingTimeMs, totalDurationMs = SUMMIT_DURATION_MS, maxRank = PLATINUM_LIMIT) => 
	maxRank * 0.99 * Math.pow((totalDurationMs - remainingTimeMs) / totalDurationMs, 0.8);

// Berechnet den nächsten Mittwoch um 3:00 UTC
function getNextSummitEndTime() {
	const now = new Date();
	let nextWednesday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 3, 0, 0));
	const daysUntilWednesday = (3 - now.getUTCDay() + 7) % 7;
	nextWednesday.setUTCDate(nextWednesday.getUTCDate() + daysUntilWednesday);
	
	let remainingTime = nextWednesday.getTime() - now.getTime();
	if (remainingTime < 0) remainingTime += WEEK_MS;
	
	return remainingTime;
}

// Berechnet den Countdown-Text und aktualisiert ihn
function updateCountdown() {
	const remainingTime = getNextSummitEndTime();
	const days = Math.floor(remainingTime / MS_PER_DAY);
	const hours = Math.floor((remainingTime % MS_PER_DAY) / MS_PER_HOUR);
	const minutes = Math.floor((remainingTime % MS_PER_HOUR) / MS_PER_MINUTE);
	const seconds = Math.floor((remainingTime % MS_PER_MINUTE) / MS_PER_SECOND);
	
	const daysText = locale === "de" ? (days === 1 ? "Tag" : "Tage") : (days === 1 ? "day" : "days");
	
	remainingTimeTextEl.textContent = 
		`${days} ${daysText}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}'${String(seconds).padStart(2, '0')}"`;

	return remainingTime;
}

// Berechnet die geschätzte Platin-Ranggrenze
function getEstimatedRank() {
	const now = new Date();

	// Falls es Mittwoch zwischen 3:00 und 4:00 UTC ist: Summit-Info anzeigen
	if (now.getUTCDay() === 3 && now.getUTCHours() >= 3 && now.getUTCHours() < 4) {
		summitInfoEl.style.display = "block";
		return 0;
	}
	summitInfoEl.style.display = "none";

	return safeRank(getNextSummitEndTime());
}

// Berechnet den erwarteten Endrang des Nutzers
function calculateFinalRank() {
	const userRank = Number(inputField.value);
	const estimatedRank = Number(medalEls.platin.textContent.replace(/\D/g, "")); // Zahlen aus Text extrahieren

	if (isNaN(userRank) || userRank <= 0) {
		outputField.textContent = locale === "de" ? "Bitte eine gültige Zahl eingeben." : "Please enter a valid number.";
		return;
	}

	if (isNaN(estimatedRank) || estimatedRank <= 0) {
		outputField.textContent = locale === "de" ? "Daten nicht verfügbar." : "Data unavailable.";
		return;
	}

	const finalRank = safeRank(0) * userRank / estimatedRank;
	outputField.textContent = Math.round(finalRank) + ".";
}

function getOrdinalSuperscript(number) {
    const j = number % 10,
          k = number % 100;

    if (j === 1 && k !== 11) return "ˢᵗ";
    if (j === 2 && k !== 12) return "ⁿᵈ";
    if (j === 3 && k !== 13) return "ʳᵈ";
    return "ᵗʰ";
}


// Aktualisiert die Anzeige der Medaillengrenzen
function updateDisplay() {
	const estimatedRank = getEstimatedRank();
	if (estimatedRank) {
		const ranks = {
			platin: Math.ceil(estimatedRank),
			gold: Math.ceil(estimatedRank * 2),
			silber: Math.ceil(estimatedRank * 4)
		};

		// DOM aktualisieren
		for (const medal in ranks) {
            medalEls[medal].textContent = locale === "de" 
			? "Dein Platz ≤ " + ranks[medal] + "." 
			: "Your Rank ≤ " + ranks[medal] + getOrdinalSuperscript(ranks[medal]);
		}
	}
}

// Initialer Aufruf für direkte Anzeige
updateDisplay();
updateCountdown();

// Aktualisierung jede Sekunde
setInterval(() => {
	updateDisplay();
	updateCountdown();
}, 1000);
