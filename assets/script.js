const form = document.querySelector('#user-form');
const table = document.querySelector('#table-users');
const users = document.querySelector('#users-tab');
const create = document.querySelector('#create-tab');
const formErrors = document.querySelectorAll('.form-error');

renderUsers();

form.addEventListener('submit', e => {
    e.preventDefault();
    const newUser = {
        name : form.name.value,
        mail : form.mail.value,
        pass : form.pass.value
    };
    createRequest(newUser);
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

function createRequest(object){
    $.ajax({
        url: '/setUser',
        method: 'POST',
        data: JSON.stringify(object),
        contentType:'application/json'
        }).done(res => {
            if(res == ''){
                renderUsers();
                users.click();
                form.reset();
                formError();
            }
            else{
                formError(JSON.parse(res));
            }
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
                <td><button class="btn btn-info edit-btn" data-userid="${user[0]}">Edit</button></td>
                <td><button class="btn btn-danger delete-btn" data-userid="${user[0]}">Delete</button></td>
            </tr>
            `;
            table.innerHTML += userHtml;
        })
    });
};

function formError(msgArray){
    if(msgArray == undefined) msgArray = ['','',''];
    for(let i = 0; msgArray.length > i; i++){
        formErrors[i].innerText = msgArray[i];
    };
};

create.addEventListener('click', e => {
    formError();
});