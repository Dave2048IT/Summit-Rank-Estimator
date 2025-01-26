// Funktion zur Bestimmung, ob Sommerzeit aktiv ist
Date.prototype.dst = function() {
	const jan = new Date(this.getFullYear(), 0, 1);  
	const jul = new Date(this.getFullYear(), 6, 1);  
	return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset()) !== this.getTimezoneOffset();
};

// Berechnung des geschätzten Rangs
function getEstimatedRank() {
	const now = new Date();  
	const currentDay = now.getUTCDay(); // Aktueller Wochentag in UTC (0 = Sonntag, 1 = Montag, ... 6 = Samstag)
	
	// Nächsten Mittwoch um 3:00 Uhr UTC berechnen
	const nextWednesday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 3, 0, 0, 0));
	nextWednesday.setDate(nextWednesday.getDate() + ((3 - currentDay + 7) % 7));
	
	let remainingTime = nextWednesday.getTime() - now.getTime();
	
	// Falls remainingTime negativ ist (Summit bereits beendet), eine Woche hinzufügen
	if (remainingTime < 0) {
		remainingTime += 604800000; // ms = 1 Woche
	}

	// Verbleibende Zeit berechnen
	const days = Math.floor(remainingTime / (86400000)); 
	const hours = Math.floor((remainingTime % 86400000) / 3600000); 
	const minutes = Math.floor((remainingTime % 3600000) / 60000); 
	const seconds = Math.floor((remainingTime % 60000) / 1000); 

	const locale = document.documentElement.lang; // Aktuelle Sprache (z. B. "en" oder "de")
	const daysText = locale === "de" ? "Tage" : "days";
	if (days === 1) {
		daysText = daysText.slice(0, -1); // Entfernt das letzte Zeichen von "Tage" oder "days"
	}

	const TimeToText = `${days} ${daysText}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}'${String(seconds).padStart(2, '0')}"`;
	document.getElementById("RemainingTimeText").textContent = TimeToText;  

	// Geschätzten Rang berechnen
	const rank = Math.round(9000 / Math.pow(1.4, remainingTime / 86400000));
	return rank;
}

// Funktion zur Formatierung von Zahlen mit Tausendertrennung
function formatWith1000sep(number) {
	const locale = document.documentElement.lang; // Aktuelle Sprache (z. B. "en" oder "de")
	return new Intl.NumberFormat(locale).format(number);
}

// Ränge berechnen und anzeigen
let estimatedRank = getEstimatedRank();
const ranks = {
	"platin": estimatedRank,
	"gold": estimatedRank * 2,
	"silber": estimatedRank * 4
};

for (let rank in ranks) {
	document.getElementById(rank).textContent = formatWith1000sep(ranks[rank]);
}
