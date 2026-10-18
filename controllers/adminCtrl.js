async function getAllUsers() {
    let luid = loadUser() ? loadUser().id : 0;

    const response = await fetch('http://localhost:4444/admin/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ luid })
    });

    if (response.status != 200) {
        const res = await response.json();
        showMessage('danger', 'ERROR', res.error);
    }
    else {
        const users = await response.json();
        drawTable(users);
    }
}

function drawTable(users) {

    let usersList = document.querySelector('#usersList');
    let usersCount = document.querySelector('#usersCount');
    usersList.innerHTML = '';
    usersCount.innerHTML = users.length;

    users.forEach((user, index) => {
        addTableRow(user, index);

    });

}

function addTableRow(user, index) {

    let usersList = document.querySelector('#usersList');
    let tr = document.createElement('tr');
    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    let td3 = document.createElement('td');
    let td4 = document.createElement('td');
    let td5 = document.createElement('td');
    let td6 = document.createElement('td');
    let td7 = document.createElement('td');
    let td8 = document.createElement('td');

    td1.innerHTML = (index + 1) + '.';
    td2.innerHTML = user.name;
    td3.innerHTML = user.email;
    td4.innerHTML = user.role;
    td5.innerHTML = user.status;
    td6.innerHTML = moment(user.reg).format('YYYY-MM-DD HH:mm:ss');
    td7.innerHTML = user.last ? moment(user.last).fromNow() : 'never';
    td8.innerHTML = user.loginCount;
    let td9 = document.createElement('td');

    let isActive = user.status == 'active' ? 'checked' : '';
    let isDisabled = user.id == loadUser().id ? 'disabled' : '';

    td9.innerHTML =
        '<div class="form-check form-switch">' +
        '<input class="form-check-input" ' + 'type="checkbox" ' + isActive + ' ' + isDisabled + ' onclick="changeUserStatus(' + user.id + ')">' +
        '</div>';

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tr.appendChild(td6);
    tr.appendChild(td7);
    tr.appendChild(td8);
    tr.appendChild(td9);

    td9.classList.add('text-end');
    usersList.appendChild(tr);
}

async function getStatistics() {

    let luid = loadUser() ? loadUser().id : 0;
    const response = await fetch('http://localhost:4444/admin/statistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ luid })
    });

    if (response.status != 200) {
        const res = await response.json();
        showMessage('danger', 'ERROR', res.error);
    }
    else {
        const data = await response.json();
        drawDashboard(data);
    }
}

function drawDashboard(data) {
    document.querySelector('#totalUsers').innerHTML = data.totalUsers;
    document.querySelector('#activeUsers').innerHTML = data.activeUsers;
    document.querySelector('#totalForecasts').innerHTML = data.totalForecasts;
}

async function changeUserStatus(uid) {

    let luid = loadUser() ? loadUser().id : 0;
    const response = await fetch('http://localhost:4444/admin/status',
        {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({uid, luid})
        }
    );

    const res = await response.json();
    if (response.status != 200) {
        showMessage( 'danger', 'ERROR', res.error);
    }
    else {
        showMessage( 'success', 'OK', res.message);
        getAllUsers();
    }
}