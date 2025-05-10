function initializeTradeHistory() {
    function generateTradeHistory() {
        const tradeTypes = ['BUY', 'SELL', 'SHORT', 'COVER'];
        const tradeTypeClasses = {
            'BUY': 'text-green-600',
            'SELL': 'text-red-600',
            'SHORT': 'text-blue-600',
            'COVER': 'text-purple-600'
        };

        const trades = [];
        const now = new Date();
        let currentDate = new Date(now);

        for (let i = 0; i < 20; i++) {
            currentDate.setDate(currentDate.getDate() - Math.floor(Math.random() * 5) - 1);
            const type = tradeTypes[Math.floor(Math.random() * tradeTypes.length)];
            const price = (100 + Math.random() * 50).toFixed(2);
            const quantity = Math.floor(Math.random() * 15) + 1;
            const isProfitable = Math.random() > 0.4;
            const profitLoss = (Math.random() * 500 + 50).toFixed(0);

            trades.push({
                date: currentDate.toISOString().split('T')[0],
                type: type,
                typeClass: tradeTypeClasses[type],
                price: `$${price}`,
                quantity: quantity,
                profitLoss: isProfitable ? `+$${profitLoss}` : `-$${profitLoss}`,
                profitLossClass: isProfitable ? 'text-green-600' : 'text-red-600'
            });
        }

        trades.sort((a, b) => new Date(b.date) - new Date(a.date));
        return trades;
    }

    function updateTradeHistory(trades) {
        const tableBody = document.getElementById('trade-history-body');
        tableBody.innerHTML = '';

        trades.forEach(trade => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${trade.date}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm ${trade.typeClass} font-medium">${trade.type}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${trade.price}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${trade.quantity}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm ${trade.profitLossClass}">${trade.profitLoss}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    const initialTrades = generateTradeHistory();
    updateTradeHistory(initialTrades);
}