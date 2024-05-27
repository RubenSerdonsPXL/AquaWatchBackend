document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('date_tomorrow').textContent = "Tomorrow (" + formatDates("tomorrow") + ")";
    document.getElementById('date_in_two_days').textContent = "In two days (" + formatDates("day_after_tomorrow") + ")";
    predict_next_days();
    displayCurrentUserNameFromLocalStorage();
});

async function predictMovement() {
    const windSpeed = document.getElementById('wind-speed').value;
    const windDirection = document.getElementById('wind-direction').value;
    
    if (windSpeed && windDirection && 360 >= parseFloat(windDirection) && parseFloat(windDirection) >= 0) {
        try {
            const pred = await fetchHyacinth(windSpeed, windDirection);
            if (pred) {
                if (parseInt(pred) === 1) {
                    document.getElementById('prediction').textContent = "High probability of waterhyacinth being present.";
                } else if (parseInt(pred) === 0){
                    document.getElementById('prediction').textContent = "Low probability of waterhyacinth being present.";
                } else {
                    document.getElementById('prediction').textContent = "Error in prediction.";
                }
            }
        } catch (error) {
            console.error('Error in predictMovement:', error);
        }
    } else {
        alert('Please enter both wind speed and wind direction (0-360) correctly.');
    }
}

async function fetchHyacinth(windSpeed, windDir) {
    const url = 'http://localhost:8000/predict_hyacinth';
    const data = {
        winddir: windDir,
        windspeed: windSpeed
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error. Status: ${response.status}`);
        }

        const result = await response.json();
        const prediction = result.prediction;  // Adjust based on your backend response structure

        console.log('Prediction:', prediction);

        return prediction;  // Adjust based on your backend response structure
    } catch (error) {
        console.error('Error fetching prediction:', error);
    }
}

async function predict_next_days() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=-25.7287&longitude=27.87&daily=wind_speed_10m_max,wind_direction_10m_dominant&timezone=GMT&forecast_days=3";

    fetch(url)
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        console.log(data.daily.wind_direction_10m_dominant);
        let windspeeds = data.daily.wind_speed_10m_max;
        let winddirs = data.daily.wind_direction_10m_dominant;
        let today_p = document.getElementById('today_p');
        let tomorrow_p = document.getElementById('tomorrow_p');
        let in_two_days_p = document.getElementById('in_two_days_p');

        fetchHyacinth(windspeeds[0], winddirs[0]).then(pred => {
            if (parseInt(pred) === 1) {
                today_p.textContent = "High probability of waterhyacinth being present.";
            } else if (parseInt(pred) === 0){
                today_p.textContent = "Low probability of waterhyacinth being present.";
            } else {
                today_p.textContent = "Error in prediction.";
            }
        });
        fetchHyacinth(windspeeds[1], winddirs[1]).then(pred => {
            if (parseInt(pred) === 1) {
                tomorrow_p.textContent = "High probability of waterhyacinth being present.";
            } else if (parseInt(pred) === 0){
                tomorrow_p.textContent = "Low probability of waterhyacinth being present.";
            } else {
                tomorrow_p.textContent = "Error in prediction.";
            }
        });
        fetchHyacinth(windspeeds[2], winddirs[2]).then(pred => {
            if (parseInt(pred) === 1) {
                in_two_days_p.textContent = "High probability of waterhyacinth being present.";
            } else if (parseInt(pred) === 0){
                in_two_days_p.textContent = "Low probability of waterhyacinth being present.";
            } else {
                in_two_days_p.textContent = "Error in prediction.";
            }
        });
    })
    .catch(error => {
        console.error("Fetch error:", error);
    });
}

function toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

function formatDates(day) {
    let dateToFormat = new Date();

    if (day === 'tomorrow') {
        let tomorrow = new Date();
        dateToFormat.setDate(tomorrow.getDate() + 1);
    } else {
        let dayAfterTomorrow = new Date();
        dateToFormat.setDate(dayAfterTomorrow.getDate() + 2);
    }

    return dateToFormat.getDate().toString().padStart(2, '0') + '/' +
                        (dateToFormat.getMonth() + 1).toString().padStart(2, '0') + '/' +
                        dateToFormat.getFullYear();
}

document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting and reloading the page
    const username = document.getElementById('username').value;
    const email = document.getElementById('signupEmail').value;
    const password1 = document.getElementById('signupPassword1').value;
    const password2 = document.getElementById('signupPassword2').value;

    if (password1 !== password2) {
        displayMessage('error', 'Passwords do not match!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.some(user => user.email === email);

    if (userExists) {
        displayMessage('error', 'Email already exists!');
    } else {
        users.push({ username, email, password: password1 });
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Users after signup:', users); // Debugging line
        displayMessage('success', 'Sign up successful! You can now sign in.');
        window.location.href = 'signin.html';
    }
});

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting and reloading the page
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Users at login:', users); // Debugging line
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        alert('success', 'Sign in successful!');
        window.location.href = 'Index.html';
    } else {
        displayMessage('error', 'Invalid email or password!');
    }
});

function displayMessage(type, message) {
    const modal = document.getElementById('messageModal');
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.textContent = message;
    modal.style.display = 'block';

    const span = document.getElementsByClassName('close')[0];
    span.onclick = function() {
        modal.style.display = 'none';
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

function displayCurrentUserNameFromLocalStorage() {
    const currentUser = sessionStorage.getItem('current_user');
    if (currentUser) {
        document.getElementById('username_display').textContent = `Welcome to AquaWatch, ${currentUser}`;
        console.log('Current user:', currentUser); // Debugging line
    } else {
        console.log('No current user found in local storage.'); // Debugging line
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(key + ": " + value);
          }
    }
}

