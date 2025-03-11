let previousResults = [];
let latestResult = null;
let latestPeriod = null;
let storedHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];

// ✅ Fetch Current Game Issue
async function fetchCurrentGameIssue() {
    const apiUrl = 'https://api.bdg88zf.com/api/webapi/GetGameIssue';
    const requestData = {
        typeId: 1,
        language: 0,
        random: "40079dcba93a48769c6ee9d4d4fae23f",
        signature: "D12108C4F57C549D82B23A91E0FA20AE",
        timestamp: 1727792520,
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.code === 0) {
                latestPeriod = data.data.issueNumber;
                document.getElementById('period-number').textContent = latestPeriod;
                fetchPreviousResults();
            }
        }
    } catch (error) {
        console.error("❌ Fetch error:", error);
    }
}

// ✅ Fetch Previous Results
async function fetchPreviousResults() {
    const apiUrl = 'https://api.bdg88zf.com/api/webapi/GetNoaverageEmerdList';
    const requestData = {
        pageSize: 10,
        pageNo: 1,
        typeId: 1,
        language: 0,
        random: "c2505d9138da4e3780b2c2b34f2fb789",
        signature: "7D637E060DA35C0C6E28DC6D23D71BED",
        timestamp: 1727792520,
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.code === 0 && data.data.list.length > 0) {
                previousResults = data.data.list;
                updateResults();
            }
        }
    } catch (error) {
        console.error("❌ Fetch error:", error);
    }
}

// ✅ Update Results
function updateResults() {
    if (previousResults.length > 0) {
        latestResult = previousResults[0].number <= 4 ? 'SMALL' : 'BIG';
        document.getElementById('predicted-result').textContent = latestResult;
        updateHistory();
    }
}

// ✅ Update History
function updateHistory() {
    const historyContainer = document.getElementById('history-list');
    historyContainer.innerHTML = '';

    const newHistoryEntry = {
        period: latestPeriod.toString().slice(-4),
        prediction: latestResult,
        status: "PENDING"
    };

    if (!storedHistory.some(entry => entry.period === newHistoryEntry.period)) {
        storedHistory.unshift(newHistoryEntry);
    }

    const prevPeriod = storedHistory[1];
    if (prevPeriod) {
        prevPeriod.status = prevPeriod.prediction === latestResult ? "WON" : "LOST";
    }

    let winCount = 0, lossCount = 0;
    storedHistory.slice(0, 10).forEach((entry) => {
        const box = document.createElement('div');
        box.className = "history-box text-center p-3 bg-green-50 rounded";

        box.innerHTML = `
            <p class="text-gray-600">Period: <span class="font-bold text-black">${entry.period}</span></p>
            <p class="text-gray-600">Prediction: <span class="font-bold text-black">${entry.prediction}</span></p>
            <p class="${entry.status === 'WON' ? 'text-green-500' : entry.status === 'LOST' ? 'text-red-500' : 'text-yellow-500'} font-bold">
                ${entry.status}
            </p>
        `;

        historyContainer.appendChild(box);

        if (entry.status === "WON") winCount++;
        else if (entry.status === "LOST") lossCount++;
    });

    localStorage.setItem("gameHistory", JSON.stringify(storedHistory.slice(0, 10)));

    document.getElementById('won-count').textContent = winCount;
    document.getElementById('lost-count').textContent = lossCount;
    document.getElementById('won-percentage').textContent = 
        (winCount + lossCount > 0) ? ((winCount / (winCount + lossCount)) * 100).toFixed(2) + "%" : "0%";
}

// ✅ Auto-Fetch Every 5 Seconds
setInterval(fetchCurrentGameIssue, 5000);
fetchCurrentGameIssue();