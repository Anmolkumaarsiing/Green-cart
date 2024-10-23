// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCrSBQoJDG9Cn5t2vsWNvDDkDQJm1UxTgk",
    authDomain: "green--cart.firebaseapp.com",
    databaseURL: "https://green--cart-default-rtdb.firebaseio.com",
    projectId: "green--cart",
    storageBucket: "green--cart.appspot.com",
    messagingSenderId: "997863065",
    appId: "1:997863065:web:1716dad07cdbe649e81208",
    measurementId: "G-56BY927ZLY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility function to get the last 7 days
function getLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString());
    }
    return dates;
}

async function fetchDailyRevenue() {
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const ordersData = ordersSnapshot.docs.map(doc => doc.data());

    const dailyRevenue = {};
    const last7Days = getLast7Days();

    // Initialize last 7 days with zero revenue
    last7Days.forEach(date => {
        dailyRevenue[date] = 0;
    });

    // Sum total amounts by date (only last 7 days)
    ordersData.forEach(order => {
        const orderDate = new Date(order.orderDate).toLocaleDateString();
        if (last7Days.includes(orderDate)) {
            dailyRevenue[orderDate] = (dailyRevenue[orderDate] || 0) + order.totalAmount;
        }
    });

    // Create datasets
    const labels = last7Days;
    const revenueData = labels.map(date => dailyRevenue[date]);

    // Create Revenue Chart
    const revenueChartCanvas = document.getElementById('revenueChart').getContext('2d');
    new Chart(revenueChartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Revenue',
                data: revenueData,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true
            }]
        }
    });
}

async function fetchUserDistributionByAge() {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersData = usersSnapshot.docs.map(doc => doc.data());

    const ageGroups = {
        '0-20': 0,
        '20-40': 0,
        '40-60': 0,
        '60-80': 0
    };

    // Count number of users per age group
    usersData.forEach(user => {
        const age = user.age;
        if (age >= 0 && age <= 20) {
            ageGroups['0-20'] += 1;
        } else if (age > 20 && age <= 40) {
            ageGroups['20-40'] += 1;
        } else if (age > 40 && age <= 60) {
            ageGroups['40-60'] += 1;
        } else if (age > 60 && age <= 80) {
            ageGroups['60-80'] += 1;
        }
    });

    // Create datasets
    const labels = Object.keys(ageGroups);
    const ageData = Object.values(ageGroups);

    // Create Age Distribution Chart
    const ageDistributionChartCanvas = document.getElementById('ageDistributionChart').getContext('2d');
    new Chart(ageDistributionChartCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'User Distribution by Age',
                data: ageData,
                backgroundColor: 'rgba(153, 102, 255, 0.8)'
            }]
        }
    });
}

// Call the functions to fetch data and create charts
fetchDailyRevenue();
fetchUserDistributionByAge();
