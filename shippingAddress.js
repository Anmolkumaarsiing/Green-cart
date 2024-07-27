document.addEventListener('DOMContentLoaded', () => {
    fetchStates();
    document.getElementById('location-selector').addEventListener('click', useMyLocation);
});

function fetchStates() {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const targetUrl = 'https://cdn-api.co-vin.in/api/v2/admin/location/states';
    fetch(proxyUrl + targetUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("States data:", data); // Debugging log
            const stateSelect = document.getElementById('state');
            stateSelect.innerHTML = '<option value="">Select State</option>'; // Clear and add default option
            data.states.forEach(state => {
                const option = document.createElement('option');
                option.value = state.state_id;
                option.textContent = state.state_name;
                stateSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching states:', error);
        });
}

// Other functions remain the same
function fetchLocationData() {
    const pincode = document.getElementById('pincode').value;
    if (pincode.length === 6) {
        console.log("Fetching location data for pincode:", pincode); // Debugging log
        fetch(`https://api.postalpincode.in/pincode/${pincode}`)
            .then(response => response.json())
            .then(data => {
                console.log("Location data:", data); // Debugging log
                if (data[0].Status === 'Success') {
                    const location = data[0].PostOffice[0];
                    document.getElementById('area').value = location.Name;
                    const stateSelect = document.getElementById('state');
                    for (let option of stateSelect.options) {
                        if (option.textContent === location.State) {
                            option.selected = true;
                            break;
                        }
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching location data:', error);
            });
    }
}

function useMyLocation() {
    if (navigator.geolocation) {
        console.log("Getting user's location..."); // Debugging log
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            console.log("User's location:", latitude, longitude); // Debugging log
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Reverse geocoding data:", data); // Debugging log
                    document.getElementById('area').value = data.address.suburb || data.address.city_district || data.address.city;
                    document.getElementById('pincode').value = data.address.postcode;
                    const stateSelect = document.getElementById('state');
                    for (let option of stateSelect.options) {
                        if (option.textContent === data.address.state) {
                            option.selected = true;
                            break;
                        }
                    }
                })
                .catch(error => {
                    console.error('Error using my location:', error);
                });
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
