async function getAllWeather() {

    const response = await fetch('http://localhost:4444/weather');
    const res = await response.json();

    if (response.status != 200) {
        showMessage( 'danger', 'ERROR', res.error);
    } else {
        drawWeatherTable(res);
    }

}

function drawWeatherTable(weatherList) {

    let weatherTable = document.querySelector('#weatherList');
    if (!weatherTable) return;

    weatherTable.innerHTML = '';

    let forecastCount = document.querySelector('#forecastCount');

    if (forecastCount) {
        forecastCount.innerHTML = weatherList.length;
    }

    weatherList.forEach((weather, index) => {
        addWeatherRow(weather, index);
    });
}

function addWeatherRow(weather, index) {

    const tr = document.createElement('tr');
    const values = [
        (index + 1) + '.',
        weather.location,
        weather.temp_min + ' °C',
        weather.temp_max + ' °C',
        weather.weather_type

    ];

    values.forEach(x => {
        const td = document.createElement('td');
        td.textContent = x;
        tr.appendChild(td);
    });

    const tdActions = document.createElement('td');
    tdActions.classList.add('text-end');

    let loggedUser = loadUser();
    let disabled = loggedUser ? '' : 'disabled';

    tdActions.innerHTML = `
        <button class="btn btn-sm btn-primary" ${disabled} onclick="getWeatherDetails(${weather.id})">Details</button>
    `;
    let adminButtons = '';
    if (loggedUser && loggedUser.role == 'admin') {

    adminButtons = `
        <button class="btn btn-sm btn-warning me-2" onclick="editWeather(${weather.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteWeather(${weather.id})">Delete</button>
    `;
}

tdActions.innerHTML = `
    <button class="btn btn-sm btn-primary me-2" ${disabled} onclick="getWeatherDetails(${weather.id})">Details</button>
    ${adminButtons}
`;

    tr.appendChild(tdActions);
    document.querySelector('#weatherList').appendChild(tr);
}

async function getWeatherDetails(id) {

    const response = await fetch(`http://localhost:4444/weather/${id}`);
    const res = await response.json();

    if (response.status != 200) {
        showMessage('danger','ERROR',res.error);
        return;
    }
    navigate('users/weather-details');

    setTimeout(() => {
        document.querySelector('#location').innerHTML = res.location;
        document.querySelector('#date').innerHTML = res.date ? String(res.date).slice(0, 10) : '';
        document.querySelector('#temp_min').innerHTML = res.temp_min;
        document.querySelector('#temp_max').innerHTML = res.temp_max;
        document.querySelector('#weather_type').innerHTML = res.weather_type;
        document.querySelector('#humidity').innerHTML = res.humidity;
        document.querySelector('#pressure').innerHTML = res.pressure;
        document.querySelector('#wind_speed').innerHTML = res.wind_speed;
        document.querySelector('#wind_direction').innerHTML = res.wind_direction;
        document.querySelector('#precipitation').innerHTML = res.precipitation;
        document.querySelector('#precipitation_probability').innerHTML = res.precipitation_probability;
        document.querySelector('#uv_index').innerHTML = res.uv_index;
    }, 200);
}

async function createWeather(data) {

    data.luid = loadUser().id;
    const response = await fetch('http://localhost:4444/weather',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }
    );

    const res = await response.json();
    if (response.status != 201) {
        showMessage('danger','ERROR',res.error);
        return false;
    } 
    else {
        showMessage('success','OK',res.message);
        getAllWeather();
        return true;
    }
}

async function updateWeather(id, data) {

    data.luid = loadUser().id;
    const response = await fetch(`http://localhost:4444/weather/${id}`,
        {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }
    );

    const res = await response.json();
    if (response.status != 200) {
        showMessage( 'danger', 'ERROR', res.error);
        return false;
    } 
    else {
        showMessage('success','OK',res.message);
        return true;
    }
}

async function deleteWeather(id) {

    if (!confirm('Delete forecast?')) {
        return;
    }

    let luid = loadUser() ? loadUser().id : 0;
    const response = await fetch(`http://localhost:4444/weather/${id}`,
        {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({luid})
        }
    );

    const res = await response.json();

    if (response.status != 200) {
        showMessage( 'danger', 'ERROR', res.error);
    }
     else {
        showMessage( 'success', 'OK', res.message);
        getAllWeather();
    }
}

async function createNewForecastForm() {

    let data = {
        date: document.querySelector('#date').value,
        location: document.querySelector('#location').value,
        temp_min: Number(document.querySelector('#temp_min').value),
        temp_max: Number(document.querySelector('#temp_max').value),
        weather_type: document.querySelector('#weather_type').value,
        precipitation: Number(document.querySelector('#precipitation').value),
        precipitation_probability: Number(document.querySelector('#precipitation_probability').value),
        wind_speed: Number(document.querySelector('#wind_speed').value),
        wind_direction: (document.querySelector('#wind_direction').value),
        humidity: Number(document.querySelector('#Humidity').value),
        pressure: Number(document.querySelector('#Pressure').value),
        uv_index: Number(document.querySelector('#uv_index').value)
    };

    const created = await createWeather(data);

    if (created) { 
        document.querySelector('#forecastForm').reset();
        bootstrap.Modal.getInstance(document.querySelector('#createForecastModal')).hide();
    }
}
async function editWeather(id) {

    const response = await fetch(`http://localhost:4444/weather/${id}`);
    const weather = await response.json();

    if (response.status != 200) {
        showMessage('danger','ERROR',weather.error );
        return;
    }

    await navigate('admin/weather-edit');
    const form = document.querySelector('#editWeatherForm');
    form.dataset.weatherId = id;

    const values = {
        edit_date: weather.date ? String(weather.date).slice(0, 10) : '',
        edit_location: weather.location,
        edit_temp_min: weather.temp_min,
        edit_temp_max: weather.temp_max,
        edit_weather_type: weather.weather_type,
        edit_precipitation: weather.precipitation,
        edit_precipitation_probability: weather.precipitation_probability,
        edit_wind_speed: weather.wind_speed,
        edit_wind_direction: weather.wind_direction,
        edit_humidity: weather.humidity,
        edit_pressure: weather.pressure,
        edit_uv_index: weather.uv_index
    };

    Object.entries(values).forEach(([fieldId, value]) => {
        document.querySelector(`#${fieldId}`).value = value ?? '';
    });

}

async function saveWeatherEdits() {

    const form = document.querySelector('#editWeatherForm');
    const data = {
        date: document.querySelector('#edit_date').value,
        location: document.querySelector('#edit_location').value,
        temp_min: Number(document.querySelector('#edit_temp_min').value),
        temp_max: Number(document.querySelector('#edit_temp_max').value),
        weather_type: document.querySelector('#edit_weather_type').value,
        precipitation: Number(document.querySelector('#edit_precipitation').value),
        precipitation_probability: Number(document.querySelector('#edit_precipitation_probability').value),
        wind_speed: Number(document.querySelector('#edit_wind_speed').value),
        wind_direction: document.querySelector('#edit_wind_direction').value,
        humidity: Number(document.querySelector('#edit_humidity').value),
        pressure: Number(document.querySelector('#edit_pressure').value),
        uv_index: Number(document.querySelector('#edit_uv_index').value)
    };

    if (data.temp_min > data.temp_max) {
        showMessage( 'danger', 'Check temperatures', 'Minimum temperature cannot be greater than maximum temperature.');
        return;
    }
    const updated = await updateWeather( form.dataset.weatherId, data);
    if (updated) {await navigate('admin/forecasts');}
}