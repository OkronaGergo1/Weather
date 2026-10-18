async function registration() {

    let name = document.querySelector('#name').value;
    let email = document.querySelector('#email').value;
    let passwd = document.querySelector('#password').value;
    let confirm = document.querySelector('#confirm').value;

    let user = {
        name,
        email,
        passwd,
        confirm
    };

    const response = await fetch('http://localhost:4444/users/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(user)
    });
    let res = await response.json();

    if (response.status != 201) {
        showMessage('danger', 'ERROR', res.error);
    } else {
        showMessage('success', 'OK', res.message);
        navigate('users/login');
    }

}

async function login() {

    let email = document.querySelector('#email').value;
    let passwd = document.querySelector('#password').value;
    let user = {
        email,
        passwd
    };

    const response = await fetch('http://localhost:4444/users/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(user)
    });

    let res = await response.json();
    if (response.status != 200) {
        showMessage('danger', 'ERROR', res.error);
    } 
    else {
        showMessage('success', 'OK', res.message);
        storeUser(res.loggedUser);
        loginCheck();
    }
}

function logout() {
    clearUser();
    loginCheck();
}

function storeUser(user) {
    sessionStorage.setItem('SCU', JSON.stringify(user));
}

function loadUser() {
    return JSON.parse(sessionStorage.getItem('SCU'));
}

function clearUser() {
    sessionStorage.removeItem('SCU');
}

function loginCheck() {

    if (user = loadUser()) {
        if (user.role == 'admin') {
            setMenuItems('admin');
            navigate('admin/dashboard');
        }
        else if (user.role == 'user') {
            setMenuItems('user');
            navigate('users/weather');
        }
        else {
            setMenuItems('');
            navigate('users/home');
        }
    }
    else {
        setMenuItems('');
        navigate('users/login');
    }
}

function setMenuItems(param) {

    let baseMenu = document.querySelector('#baseMenu');
    let userMenu = document.querySelector('#userMenu');
    let adminMenu = document.querySelector('#adminMenu');

    switch (param) {

        case 'admin': {
            baseMenu.classList.add('hide');
            userMenu.classList.add('hide');
            adminMenu.classList.remove('hide');
            break;
        }

        case 'user': {
            baseMenu.classList.add('hide');
            adminMenu.classList.add('hide');
            userMenu.classList.remove('hide');
            break;
        }

        case '': {
            baseMenu.classList.remove('hide');
            userMenu.classList.add('hide');
            adminMenu.classList.add('hide');
            break;
        }
    }
}

async function updateProfile() {

    let name = document.querySelector('#name');
    let email = document.querySelector('#email');
    let loggedUser = loadUser();

    let data = {
        username: name.value,
        email: email.value,
        luid: loggedUser.id
    };

    const response = await fetch( `http://localhost:4444/users/${loggedUser.id}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
    );

    let res = await response.json();
    if (response.status != 200) {

        showMessage( 'danger', 'ERROR', res.error);
    }
    else {

        showMessage( 'success', 'OK', res.message);
        let user = {
            id: loggedUser.id,
            name: name.value,
            email: email.value,
            role: loggedUser.role
        };
        storeUser(user);
    }
}

async function updatePassword() {

    let oldpass = document.querySelector('#oldpass');
    let newpass = document.querySelector('#newpass');
    let confirm = document.querySelector('#confirm');

    let data = {
        oldpass: oldpass.value,
        newpass: newpass.value,
        confirm: confirm.value
    };

    let uid = loadUser() ? loadUser().id : 0;

    const response = await fetch( `http://localhost:4444/users/${uid}/passmod`,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }
    );

    let res = await response.json();
    if (response.status != 200) {

        showMessage( 'danger', 'ERROR', res.error);
    }
    else {
        showMessage( 'success', 'OK', res.message);
        oldpass.value = '';
        newpass.value = '';
        confirm.value = '';
    }
}

async function getUserData() {

    let uid = loadUser().id;
    const response = await fetch(`http://localhost:4444/users/${uid}`);
    const res = await response.json();

    if (response.status != 200) {
        showMessage( 'danger', 'ERROR', res.error);
        return;
    }

    document.querySelector('#name').value = res.results.name;
    document.querySelector('#email').value = res.results.email;

    if (document.querySelector('#role')) {
        document.querySelector('#role').value = res.results.role;
    }

    if (document.querySelector('#status')) {
        document.querySelector('#status').value = res.results.status;
    }
}

async function deleteProfile() {

    let uid = loadUser().id;
    const response = await fetch( `http://localhost:4444/users/${uid}`,
        {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({luid: uid})
        }
    );

    let res = await response.json();

    if (response.status != 200) {
        showMessage( 'danger', 'ERROR', res.error);
    }
    else {
        showMessage( 'success', 'OK', res.message);
        clearUser();
        loginCheck();
    }
}