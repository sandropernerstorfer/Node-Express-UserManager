const form = document.querySelector('#user-form');
const table = document.querySelector('#table-users');
const users = document.querySelector('#users-tab');

renderUsers();

form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.name.value;
    const mail = form.mail.value;
    const pass = form.pass.value;
    createUser(name, mail, pass);
});

document.addEventListener('click', e => {

    if(!e.target.matches('.delete-btn')) return;

    const userID = parseInt(e.target.dataset.userid);
    deleteUser(userID);
});

document.addEventListener('click', e => {

    if(!e.target.matches('.edit-btn')) return;

    const userID = parseInt(e.target.dataset.userid);
    const newName = prompt('New Name');
    const newMail = prompt('New Email');
    const newPass = prompt('New Password');
    editUser(userID, newName, newMail, newPass);
});

function editUser(id, name, mail, pass){
    $.ajax({
        url: '/editUser',
        method: 'PUT',
        data: {
            id: id,
            name: name,
            mail: mail,
            pass: pass
        }
        }).done(res => {
            renderUsers();
    });
};

function deleteUser(id){
    $.ajax({
        url: '/deleteUser',
        method: 'DELETE',
        data: {
            id: id
        }
        }).done(res => {
            renderUsers();
    });
};

function createUser(name, mail, pass){
    $.ajax({
        url: '/setUser',
        method: 'POST',
        data: {
            name : name,
            mail: mail,
            pass : pass
        }
        }).done(res => {
            renderUsers();
            users.click();
            form.reset();
    })
};

function renderUsers(){
    $.getJSON('/getUsers', function(allUsers) {
        table.innerHTML = '';
        allUsers.forEach(user => {
            let userHtml = 
            `
            <tr>
                <td>${user[0]}</td>
                <td>${user[1]}</td>
                <td>${user[2]}</td>
                <td>${user[3]}</td>
                <td><button class="btn btn-warning edit-btn" data-userid="${user[0]}">Edit</button></td>
                <td><button class="btn btn-danger delete-btn" data-userid="${user[0]}">Delete</button></td>
            </tr>
            `
            table.innerHTML += userHtml
        })
    });
};