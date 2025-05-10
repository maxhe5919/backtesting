document.addEventListener('DOMContentLoaded', function() {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }


    const historicalBtn = document.getElementById('historical-btn');
    const realtimeBtn = document.getElementById('realtime-btn');
    const historicalOptions = document.getElementById('historical-options');
    const realtimeOptions = document.getElementById('realtime-options');
    const addSymbolBtn = document.getElementById('add-symbol');
    const symbolInput = document.getElementById('realtime-symbol');
    const selectedSymbols = document.getElementById('selected-symbols');
    const runTestBtn = document.getElementById('run-test');

    historicalBtn.addEventListener('click', function() {
        historicalBtn.classList.add('active');
        realtimeBtn.classList.remove('active');
        historicalOptions.classList.remove('hidden');
        realtimeOptions.classList.add('hidden');
        runTestBtn.textContent = 'Run Backtest';
    });

    realtimeBtn.addEventListener('click', function() {
        realtimeBtn.classList.add('active');
        historicalBtn.classList.remove('active');
        realtimeOptions.classList.remove('hidden');
        historicalOptions.classList.add('hidden');
        runTestBtn.textContent = 'Start Live Testing';
    });

    // Symbol management
    addSymbolBtn.addEventListener('click', function() {
        const symbol = symbolInput.value.trim().toUpperCase();
        if (symbol) {
            addSymbol(symbol);
            symbolInput.value = '';
        }
    });

    symbolInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const symbol = symbolInput.value.trim().toUpperCase();
            if (symbol) {
                addSymbol(symbol);
                symbolInput.value = '';
            }
        }
    });

    function addSymbol(symbol) {
        const existingSymbols = Array.from(selectedSymbols.querySelectorAll('div')).map(div => 
            div.textContent.trim().replace('×', '')
        );

        if (existingSymbols.includes(symbol)) {
            showNotification('Symbol already added', 'warning');
            return;
        }

        const symbolElement = document.createElement('div');
        symbolElement.className = 'bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center';
        symbolElement.innerHTML = `
            ${symbol}
            <button class="ml-1 text-blue-600 hover:text-blue-800">×</button>
        `;

        symbolElement.querySelector('button').addEventListener('click', function() {
            symbolElement.remove();
        });

        selectedSymbols.appendChild(symbolElement);
        showNotification(`Added ${symbol} to watchlist`, 'success');
    }


    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedSection = document.getElementById('advanced-section');
    const advancedIcon = document.getElementById('advanced-icon');

    if (advancedToggle && advancedSection && advancedIcon) {
        advancedToggle.addEventListener('click', function() {
            advancedSection.classList.toggle('open');
            advancedIcon.classList.toggle('rotate-180');
        });
    } else {
        console.error('Advanced parameters elements not found');
    }

    // File upload handling
    document.getElementById('dataset-upload').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            const formData = new FormData();
            formData.append('dataset', e.target.files[0]);
            formData.append('csrfmiddlewaretoken', csrftoken);

            fetch('/api/upload-dataset/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': csrftoken
                }
            })
            .then(response => response.json())
            .then(data => {
                showNotification(`Dataset "${fileName}" uploaded successfully`, 'success');
            })
            .catch(error => {
                showNotification('Error uploading dataset', 'error');
            });
        }
    });

    document.getElementById('model-upload').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            const formData = new FormData();
            formData.append('model', e.target.files[0]);
            formData.append('csrfmiddlewaretoken', csrftoken);

            fetch('/api/upload-model/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': csrftoken
                }
            })
            .then(response => response.json())
            .then(data => {
                showNotification(`Model "${fileName}" uploaded successfully`, 'success');
            })
            .catch(error => {
                showNotification('Error uploading model', 'error');
            });
        }
    });

    // Run backtest
    runTestBtn.addEventListener('click', function() {
        const isRealtime = realtimeBtn.classList.contains('active');
        const formData = new FormData();
        const params = {
            initialCapital: document.getElementById('initial-capital').value,
            positionSize: document.getElementById('position-size').value,
            stopLoss: document.getElementById('stop-loss').value,
            takeProfit: document.getElementById('take-profit').value,
            buyThreshold: document.getElementById('buy-threshold').value,
            sellThreshold: document.getElementById('sell-threshold').value,
            shortThreshold: document.getElementById('short-threshold').value,
            coverThreshold: document.getElementById('cover-threshold').value,
            volatilityFactor: document.getElementById('volatility-factor').value,
            slippage: document.getElementById('slippage').value,
            transactionFee: document.getElementById('transaction-fee').value,
            reinvestProfits: document.getElementById('reinvest-profits').checked,
            allowShorting: document.getElementById('allow-shorting').checked,
            useMargin: document.getElementById('use-margin').checked,
            isRealtime: isRealtime,
            dataset: document.getElementById('sample-dataset').value,
            model: document.getElementById('sample-model').value
        };
        formData.append('parameters', JSON.stringify(params));

        const datasetUpload = document.getElementById('dataset-upload');
        if (datasetUpload.files.length > 0) {
            formData.append('dataset', datasetUpload.files[0]);
        }

        fetch('/api/backtest/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrftoken
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Backtest failed');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Backtest completed successfully', 'success');
            updateKeyMetrics(data.results);
            updateTradeHistory(data.trades);

            // Update TradingView chart symbol based on dataset
            const dataset = params.dataset;
            let symbol = 'INDEX:SPX';  // Default S&P 500
            if (dataset === 'nasdaq') symbol = 'INDEX:NDX';
            else if (dataset === 'dow') symbol = 'INDEX:DJI';
            else if (dataset === 'aapl') symbol = 'AAPL';
            else if (dataset === 'msft') symbol = 'MSFT';

            // Reinitialize TradingView widget with new symbol
            const container = document.getElementById('tradingview_chart');
            container.innerHTML = '';  // Clear existing chart
            new TradingView.widget({
                "container_id": "tradingview_chart",
                "width": "100%",
                "height": "100%",
                "symbol": symbol,
                "interval": "D",
                "timezone": "America/New_York",
                "theme": "light",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "#f1f3f6",
                "enable_publishing": false,
                "allow_symbol_change": true,
                "studies": [
                    "MASimple@tv-basicstudies",
                    "RSI@tv-basicstudies"
                ],
                "show_popup_button": true,
                "popup_width": "1000",
                "popup_height": "650"
            });
        })
        .catch(error => {
            showNotification('Error running backtest: ' + error.message, 'error');
        });
    });

    function updateKeyMetrics(results) {
        document.querySelector('.metric-card:nth-child(1) .text-xl').textContent = `+${results.total_return}%`;
        document.querySelector('.metric-card:nth-child(2) .text-xl').textContent = results.sharpe_ratio;
        document.querySelector('.metric-card:nth-child(3) .text-xl').textContent = `-${results.max_drawdown}%`;
        document.querySelector('.metric-card:nth-child(4) .text-xl').textContent = `${results.success_rate}%`;
    }

    function updateTradeHistory(trades) {
        const tableBody = document.getElementById('trade-history-body');
        tableBody.innerHTML = '';
        trades.forEach(trade => {
            const row = document.createElement('tr');
            const typeClass = trade.type === 'BUY' ? 'text-green-600' :
                             trade.type === 'SELL' ? 'text-red-600' :
                             trade.type === 'SHORT' ? 'text-blue-600' : 'text-purple-600';
            const profitLossClass = trade.profit_loss >= 0 ? 'text-green-600' : 'text-red-600';
            row.innerHTML = `
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${trade.date}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm ${typeClass} font-medium">${trade.type}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">$${trade.price.toFixed(2)}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${trade.quantity}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm ${profitLossClass}">${trade.profit_loss >= 0 ? '+' : '-'}$${Math.abs(trade.profit_loss).toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function showNotification(message, type = 'success') {
        const colors = {
            'success': 'bg-green-100 border-green-500 text-green-700',
            'warning': 'bg-yellow-100 border-yellow-500 text-yellow-700',
            'error': 'bg-red-100 border-red-500 text-red-700',
            'info': 'bg-blue-100 border-blue-500 text-blue-700'
        };

        const icons = {
            'success': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />',
            'warning': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />',
            'error': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />',
            'info': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'
        };

        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 ${colors[type]} border-l-4 p-4 rounded shadow-md z-50 transition-opacity duration-500`;
        notification.innerHTML = `
            <div class="flex">
                <div class="py-1">
                    <svg class="h-6 w-6 text-${type === 'success' ? 'green' : type === 'warning' ? 'yellow' : type === 'error' ? 'red' : 'blue'}-500 mr-4" 
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        ${icons[type]}
                    </svg>
                </div>
                <div>
                    <p class="font-bold">${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                    <p class="text-sm">${message}</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
});