function initializePerformanceChart() {
    const ctx = document.getElementById('performance-chart').getContext('2d');

    const generateData = (days, startValue, volatility) => {
        const data = [];
        let currentValue = startValue;
        const now = new Date();

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            const change = (Math.random() - 0.48) * volatility;
            currentValue = Math.max(currentValue * (1 + change), currentValue * 0.5);
            data.push({ x: date, y: currentValue });
        }

        return data;
    };

    const strategyData = generateData(180, 10000, 0.02);
    const benchmarkData = generateData(180, 10000, 0.015);

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Strategy Performance',
                    data: strategyData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.2
                },
                {
                    label: 'Benchmark (S&P 500)',
                    data: benchmarkData,
                    borderColor: '#6b7280',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: { mode: 'index', intersect: false },
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true, boxWidth: 6 }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'day', tooltipFormat: 'MMM d, yyyy' },
                    grid: { display: false }
                },
                y: {
                    title: { display: true, text: 'Portfolio Value ($)' },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                }
            }
        }
    });

    const timeButtons = document.querySelectorAll('.time-period-btn');
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            timeButtons.forEach(btn => btn.classList.remove('tab-active'));
            this.classList.add('tab-active');

            const period = this.getAttribute('data-period');
            let days = 7;
            switch(period) {
                case '7d': days = 7; break;
                case '1m': days = 30; break;
                case '3m': days = 90; break;
                case '6m': days = 180; break;
                case '1y': days = 365; break;
            }

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);

            chart.options.scales.x.min = startDate;
            chart.options.scales.x.max = endDate;
            chart.update();
        });
    });
}