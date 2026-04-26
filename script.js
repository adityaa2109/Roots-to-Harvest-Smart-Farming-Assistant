const MOCK_FORECAST = [
    { day: 'Mon', icon: '☀️', temp: '32°C', condition: 'Clear', humidity: '45%' },
    { day: 'Tue', icon: '☁️', temp: '30°C', condition: 'Partly Cloudy', humidity: '60%' },
    { day: 'Wed', icon: '🌧️', temp: '25°C', condition: 'Heavy Rain', humidity: '90%' },
    { day: 'Thu', icon: '🌤️', temp: '28°C', condition: 'Scattered Showers', humidity: '75%' },
    { day: 'Fri', icon: '☀️', temp: '34°C', condition: 'Clear', humidity: '40%' },
];

const MOCK_PRICES = [
    { crop: 'Tomato', location: 'Nashik APMC', price: 1800, trend: 'up' },
    { crop: 'Tomato', location: 'Ahmednagar APMC', price: 1650, trend: 'down' },
    { crop: 'Onion', location: 'Jalgaon APMC', price: 2350, trend: 'stable' },
    { crop: 'Grapes (Black)', location: 'Niphad APMC', price: 4100, trend: 'up' },
    { crop: 'Grapes (Green)', location: 'Nashik APMC', price: 3850, trend: 'down' },
];

const MOCK_PRICE_HISTORY = {
    labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
    datasets: [
        {
            label: 'Tomato (₹/Quintal)',
            data: [1500, 1650, 1800, 1750, 1900, 1850, 1800],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
            label: 'Onion (₹/Quintal)',
            data: [2200, 2250, 2300, 2350, 2400, 2380, 2350],
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
        {
            label: 'Grapes (₹/Quintal)',
            data: [3800, 3900, 4000, 3950, 4100, 4150, 4100],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
    ]
};

const MOCK_FORUM_POSTS = [
    {
        id: 1,
        author: 'Ramesh Patil',
        avatar: 'RP',
        time: '2 hours ago',
        content: 'Has anyone tried the new drip irrigation techniques for grapes? Looking for feedback on water savings.',
        likes: 12,
        comments: 5,
        liked: false
    },
    {
        id: 2,
        author: 'Sunita Jadhav',
        avatar: 'SJ',
        time: '1 day ago',
        content: 'Found a great solution for labor shortage! Using a mobile app to connect with local workers. DM for details.',
        likes: 24,
        comments: 8,
        liked: false
    }
];

let currentTab = 'weather';
let tabContents;
let loadingIndicator;
let priceChart;
let forumPosts = [...MOCK_FORUM_POSTS];

const initializeDOMReferences = () => {
    tabContents = {
        weather: document.getElementById('weather'),
        disease: document.getElementById('disease'),
        market: document.getElementById('market'),
        community: document.getElementById('community'),
        tools: document.getElementById('tools')
    };
    loadingIndicator = document.getElementById('loading');
};

const simulateDataFetch = (callback) => {
    loadingIndicator.classList.remove('hidden');
    setTimeout(() => {
        callback();
        loadingIndicator.classList.add('hidden');
    }, 800);
};

const showNotification = (message, type = 'success') => {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    let bgColor, textColor, icon;
    if (type === 'success') {
        bgColor = 'bg-green-500';
        textColor = 'text-white';
        icon = 'fa-check-circle';
    } else if (type === 'error') {
        bgColor = 'bg-red-500';
        textColor = 'text-white';
        icon = 'fa-exclamation-circle';
    } else if (type === 'warning') {
        bgColor = 'bg-yellow-500';
        textColor = 'text-white';
        icon = 'fa-exclamation-triangle';
    } else {
        bgColor = 'bg-blue-500';
        textColor = 'text-white';
        icon = 'fa-info-circle';
    }
    
    notification.className = `notification ${bgColor} ${textColor} p-4 rounded-lg shadow-lg flex items-center`;
    notification.innerHTML = `
        <i class="fas ${icon} mr-3"></i>
        <span>${message}</span>
        <button class="ml-4 hover:opacity-75" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

const renderWeather = () => {
    const container = document.getElementById('forecast-container');
    if (!container) return;
    container.innerHTML = MOCK_FORECAST.map(day => `
        <div class="bg-white p-4 rounded-xl text-center border-t-4 border-green-500 card-shadow">
            <p class="text-xl font-bold text-gray-700 mb-2">${day.day}</p>
            <p class="text-4xl mb-2">${day.icon}</p>
            <p class="text-3xl font-extrabold text-green-600">${day.temp}</p>
            <p class="text-sm text-gray-500">${day.condition}</p>
            <p class="text-xs text-gray-400">Humidity: ${day.humidity}</p>
        </div>
    `).join('');
};

const renderMarketPrices = () => {
    const tbody = document.getElementById('price-table-body');
    if (!tbody) return;
    tbody.innerHTML = MOCK_PRICES.map(item => {
        let trendIcon, trendColor, recommendation;
        if (item.trend === 'up') {
            trendIcon = '▲'; trendColor = 'text-green-500';
            recommendation = 'Good time to sell';
        } else if (item.trend === 'down') {
            trendIcon = '▼'; trendColor = 'text-red-500';
            recommendation = 'Consider storage';
        } else {
            trendIcon = '—'; trendColor = 'text-gray-500';
            recommendation = 'Hold or sell as needed';
        }

        return `
            <tr class="hover:bg-gray-100 transition duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.crop}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.location}</td>
                <td class="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-800">₹${item.price.toLocaleString('en-IN')}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold ${trendColor}">
                    ${trendIcon} ${item.trend.charAt(0).toUpperCase() + item.trend.slice(1)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.trend === 'up' ? 'bg-green-100 text-green-800' : item.trend === 'down' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}">
                        ${recommendation}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button onclick="setPriceAlert('${item.crop}', '${item.location}')" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-bell"></i> Set Alert
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    renderPriceChart();
};

const renderPriceChart = () => {
    const ctx = document.getElementById('priceChart');
    if (!ctx) return;
    
    if (priceChart) {
        priceChart.destroy();
    }
    
    // Chart is initialized here. Chart.js must be loaded before this function runs.
    priceChart = new Chart(ctx, {
        type: 'line',
        data: MOCK_PRICE_HISTORY,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
};

window.updatePriceChart = (crop) => {
    if (!priceChart) return;
    
    let filteredDatasets = [];
    if (crop === 'tomato') {
        filteredDatasets = [MOCK_PRICE_HISTORY.datasets[0]];
    } else if (crop === 'onion') {
        filteredDatasets = [MOCK_PRICE_HISTORY.datasets[1]];
    } else if (crop === 'grapes') {
        filteredDatasets = [MOCK_PRICE_HISTORY.datasets[2]];
    } else {
        filteredDatasets = MOCK_PRICE_HISTORY.datasets;
    }
    
    priceChart.data.datasets = filteredDatasets;
    priceChart.update();
};

window.setPriceAlert = (crop, location) => {
    showNotification(`Price alert set for ${crop} at ${location}`, 'success');
};

window.handleDiseaseImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('disease-preview').src = e.target.result;
            
            setTimeout(() => {
                document.getElementById('disease-result').classList.remove('hidden');
                showNotification('Disease detection completed!', 'success');
            }, 1500);
        };
        reader.readAsDataURL(file);
    }
};

window.simulateCameraCapture = () => {
    showNotification('Camera feature would open here', 'info');
    
    setTimeout(() => {
        // Mock image result
        document.getElementById('disease-preview').src = 'https://picsum.photos/seed/grape-disease/300/200.jpg';
        document.getElementById('disease-result').classList.remove('hidden');
        showNotification('Disease detection completed!', 'success');
    }, 1500);
};

window.showDiseaseDetails = (diseaseName) => {
    showNotification(`Showing details for ${diseaseName}`, 'info');
};

window.postJob = (event) => { 
    event.preventDefault();
    const crop = document.getElementById('job-crop').value;
    const location = document.getElementById('job-location').value;
    const workers = document.getElementById('job-workers').value;
    const duration = document.getElementById('job-duration').value;
    const wage = document.getElementById('job-wage').value;
    const description = document.getElementById('job-description').value;

    const newJob = { crop, location, workers, duration, wage, description };

    const container = document.getElementById('job-listings');
    if (!container) return;
    const newJobElement = document.createElement('div');
    newJobElement.className = 'job-card bg-green-100 p-4 rounded-xl border border-green-300 flex flex-col md:flex-row justify-between items-start md:items-center';
    newJobElement.setAttribute('data-job-type', 'general');
    newJobElement.innerHTML = `
        <div class="mb-3 md:mb-0">
            <p class="font-bold text-lg">${newJob.crop} Labor Requirement (${newJob.location})</p>
            <p class="text-sm text-gray-600">Need ${newJob.workers} workers for ${newJob.duration} days. ${newJob.description || ''}</p>
            <div class="flex items-center mt-2">
                <span class="bg-green-200 text-green-800 text-xs px-2 py-1 rounded">₹${newJob.wage}/day</span>
                <span class="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded ml-2">New Post</span>
            </div>
        </div>
        <div class="flex space-x-2">
            <button class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition">
                Contact
            </button>
            <button class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition" onclick="this.closest('div').remove()">
                Remove
            </button>
        </div>
    `;
    container.prepend(newJobElement);

    showNotification(`Job for ${crop} successfully posted!`);
    event.target.reset();
};

window.filterJobs = () => {
    const filterValue = document.getElementById('job-filter').value;
    const jobCards = document.querySelectorAll('.job-card');
    
    jobCards.forEach(card => {
        if (filterValue === 'all') {
            card.style.display = 'flex';
        } else {
            const jobType = card.getAttribute('data-job-type');
            if (jobType === filterValue) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        }
    });
};

window.contactEmployer = (jobTitle) => {
    showNotification(`Contact information for ${jobTitle} would be displayed here`, 'info');
};

window.applyForJob = (jobTitle) => {
    showNotification(`Application submitted for ${jobTitle}!`, 'success');
};

window.postToForum = () => {
    const input = document.getElementById('forum-post-input');
    const content = input.value.trim();
    
    if (!content) {
        showNotification('Please enter a post content', 'warning');
        return;
    }
    
    const newPost = {
        id: forumPosts.length + 1,
        author: 'Farmer User',
        avatar: 'FU',
        time: 'Just now',
        content: content,
        likes: 0,
        comments: 0,
        liked: false
    };
    
    forumPosts.unshift(newPost);
    renderForumPosts();
    input.value = '';
    showNotification('Your post has been published!', 'success');
};

const renderForumPosts = () => {
    const container = document.getElementById('forum-posts');
    if (!container) return;
    
    container.innerHTML = forumPosts.map(post => `
        <div class="border-b border-gray-200 pb-4">
            <div class="flex items-start">
                <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mr-3">
                    ${post.avatar}
                </div>
                <div class="flex-grow">
                    <div class="flex justify-between">
                        <h4 class="font-bold">${post.author}</h4>
                        <span class="text-sm text-gray-500">${post.time}</span>
                    </div>
                    <p class="text-gray-700 mt-1">${post.content}</p>
                    <div class="flex mt-2 space-x-4">
                        <button onclick="toggleLike(${post.id})" class="text-gray-500 hover:text-green-600 text-sm ${post.liked ? 'text-green-600' : ''}">
                            <i class="${post.liked ? 'fas' : 'far'} fa-thumbs-up mr-1"></i> Like (${post.likes})
                        </button>
                        <button class="text-gray-500 hover:text-green-600 text-sm">
                            <i class="far fa-comment mr-1"></i> Comment (${post.comments})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
};

window.toggleLike = (postId) => {
    const post = forumPosts.find(p => p.id === postId);
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        renderForumPosts();
    }
};

window.showTab = (tabName) => { 
    if (currentTab === tabName) return;
    
    if (!tabContents || !tabContents.weather) initializeDOMReferences(); 
    
    const currentTabButton = document.getElementById(`tab-${currentTab}`);
    const newTabButton = document.getElementById(`tab-${tabName}`);

    if (currentTabButton) {
        currentTabButton.classList.remove('active', 'bg-green-600');
        currentTabButton.classList.add('bg-gray-800');
    }
    
    if (newTabButton) {
        newTabButton.classList.add('active', 'bg-green-600');
        newTabButton.classList.remove('bg-gray-800');
    }

    Object.values(tabContents).forEach(section => {
        if (section) section.classList.add('hidden');
    });

    const selectedSection = tabContents[tabName];
    
    if (selectedSection) {
        simulateDataFetch(() => {
            selectedSection.classList.remove('hidden');
            currentTab = tabName;
            
            if (tabName === 'weather') renderWeather();
            if (tabName === 'market') renderMarketPrices();
            if (tabName === 'community') renderForumPosts();
        });
    }
};

const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    const toggleButton = document.getElementById('dark-mode-toggle');
    const toggleButtonDesktop = document.getElementById('dark-mode-toggle-desktop');
    
    if (toggleButton) {
        toggleButton.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    
    if (toggleButtonDesktop) {
        const toggleSpan = toggleButtonDesktop.querySelector('span');
        if (isDarkMode) {
            toggleSpan.classList.add('translate-x-5');
            toggleSpan.classList.remove('translate-x-1');
        } else {
            toggleSpan.classList.add('translate-x-1');
            toggleSpan.classList.remove('translate-x-5');
        }
    }
    
    localStorage.setItem('darkMode', isDarkMode);
};

const initializeDarkMode = () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        
        const toggleButton = document.getElementById('dark-mode-toggle');
        const toggleButtonDesktop = document.getElementById('dark-mode-toggle-desktop');
        
        if (toggleButton) {
            toggleButton.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        if (toggleButtonDesktop) {
            const toggleSpan = toggleButtonDesktop.querySelector('span');
            toggleSpan.classList.add('translate-x-5');
            toggleSpan.classList.remove('translate-x-1');
        }
    }
};

window.refreshWeatherData = () => {
    showNotification('Weather data refreshed successfully!', 'success');
    renderWeather();
};

window.openFertilizerCalculator = () => {
    document.getElementById('fertilizer-calculator-modal').classList.remove('hidden');
};

window.openIrrigationPlanner = () => {
    document.getElementById('irrigation-planner-modal').classList.remove('hidden');
};

window.openCropCalendar = () => {
    showNotification('Crop Calendar coming soon!', 'info');
};

window.openProfitCalculator = () => {
    document.getElementById('profit-calculator-modal').classList.remove('hidden');
};

window.openLoanCalculator = () => {
    showNotification('Loan Calculator coming soon!', 'info');
};

window.openStorageGuide = () => {
    showNotification('Storage Guide coming soon!', 'info');
};

window.closeModal = (modalId) => {
    document.getElementById(modalId).classList.add('hidden');
};

window.calculateFertilizer = (event) => {
    event.preventDefault();
    
    const crop = document.getElementById('fertilizer-crop').value;
    const soil = document.getElementById('fertilizer-soil').value;
    const stage = document.getElementById('fertilizer-stage').value;
    const size = parseFloat(document.getElementById('fertilizer-size').value);
    
    let n, p, k, instructions;
    
    if (crop === 'grapes') {
        if (stage === 'flowering') {
            n = 150 * size;
            p = 80 * size;
            k = 100 * size;
            instructions = 'Apply in split doses: 50% at planting, 30% at flowering, and 20% at fruit development stage.';
        } else {
            n = 120 * size;
            p = 60 * size;
            k = 90 * size;
            instructions = 'Apply in split doses based on growth stage requirements.';
        }
    } else if (crop === 'tomato') {
        n = 180 * size;
        p = 70 * size;
        k = 120 * size;
        instructions = 'Apply nitrogen in split doses. Ensure adequate potassium during fruit development.';
    } else {
        n = 100 * size;
        p = 50 * size;
        k = 80 * size;
        instructions = 'Apply based on soil test recommendations and crop requirements.';
    }
    
    if (soil === 'sandy') {
        n *= 1.2;
        instructions += ' Sandy soils require more frequent fertilizer applications.';
    } else if (soil === 'clay') {
        instructions += ' Clay soils retain nutrients better, reduce frequency but maintain total amount.';
    }
    
    document.getElementById('nitrogen-amount').textContent = `${Math.round(n)} kg`;
    document.getElementById('phosphorus-amount').textContent = `${Math.round(p)} kg`;
    document.getElementById('potassium-amount').textContent = `${Math.round(k)} kg`;
    document.getElementById('fertilizer-instructions').textContent = instructions;
    
    document.getElementById('fertilizer-results').classList.remove('hidden');
    showNotification('Fertilizer calculation completed!', 'success');
};

window.planIrrigation = (event) => {
    event.preventDefault();
    
    const crop = document.getElementById('irrigation-crop').value;
    const soil = document.getElementById('irrigation-soil').value;
    const method = document.getElementById('irrigation-method').value;
    const size = parseFloat(document.getElementById('irrigation-size').value);
    
    let waterRequirement, frequency, instructions;
    
    if (crop === 'grapes') {
        waterRequirement = 4500 * size;
        frequency = 'Every 3 days';
        instructions = 'Based on current weather conditions and soil moisture levels, we recommend increasing irrigation by 15% this week.';
    } else if (crop === 'tomato') {
        waterRequirement = 5200 * size;
        frequency = 'Every 2 days';
        instructions = 'Tomatoes require consistent moisture, especially during fruit development. Avoid water stress.';
    } else {
        waterRequirement = 4000 * size;
        frequency = 'Every 4 days';
        instructions = 'Monitor soil moisture regularly and adjust irrigation based on weather conditions.';
    }
    
    if (soil === 'sandy') {
        waterRequirement *= 1.3;
        frequency = 'Every 2 days';
        instructions += ' Sandy soils drain quickly and require more frequent irrigation.';
    } else if (soil === 'clay') {
        waterRequirement *= 0.8;
        frequency = 'Every 5 days';
        instructions += ' Clay soils retain water longer, reduce frequency to prevent waterlogging.';
    }
    
    if (method === 'drip') {
        waterRequirement *= 0.7;
        instructions += ' Drip irrigation is highly efficient and reduces water wastage.';
    } else if (method === 'flood') {
        waterRequirement *= 1.5;
        instructions += ' Flood irrigation is less efficient, consider upgrading to drip or sprinkler.';
    }
    
    document.getElementById('water-requirement').textContent = `${Math.round(waterRequirement)} L/day`;
    document.getElementById('irrigation-frequency').textContent = frequency;
    document.getElementById('irrigation-instructions').textContent = instructions;
    
    document.getElementById('irrigation-results').classList.remove('hidden');
    showNotification('Irrigation plan created successfully!', 'success');
};

window.calculateProfit = (event) => {
    event.preventDefault();
    
    const crop = document.getElementById('profit-crop').value;
    const size = parseFloat(document.getElementById('profit-size').value);
    const yieldPerHectare = parseFloat(document.getElementById('profit-yield').value);
    const pricePerTon = parseFloat(document.getElementById('profit-price').value);
    const costPerHectare = parseFloat(document.getElementById('profit-cost').value);
    
    const totalYield = size * yieldPerHectare;
    const totalRevenue = totalYield * pricePerTon;
    const totalCost = size * costPerHectare;
    const netProfit = totalRevenue - totalCost;
    const profitMargin = (netProfit / totalRevenue) * 100;
    
    document.getElementById('total-revenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
    document.getElementById('total-cost').textContent = `₹${totalCost.toLocaleString('en-IN')}`;
    document.getElementById('net-profit').textContent = `₹${netProfit.toLocaleString('en-IN')}`;
    document.getElementById('net-profit').className = netProfit >= 0 ? 'text-2xl font-bold text-green-600' : 'text-2xl font-bold text-red-600';
    document.getElementById('profit-margin').textContent = `Profit Margin: ${profitMargin.toFixed(1)}%`;
    
    document.getElementById('profit-results').classList.remove('hidden');
    showNotification('Profit calculation completed!', 'success');
};

window.onload = () => {
    initializeDOMReferences();
    initializeDarkMode();
    
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
    document.getElementById('dark-mode-toggle-desktop').addEventListener('click', toggleDarkMode);
    
    // Initial load should show the weather tab
    showTab('weather');
};