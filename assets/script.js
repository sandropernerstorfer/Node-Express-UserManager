const form = document.querySelector('#user-form');
const table = document.querySelector('#table-users');
const users = document.querySelector('#users-tab');
const create = document.querySelector('#create-tab');
const formErrors = document.querySelectorAll('.form-error');
const countBadge = document.querySelector('#user-count');

getUsers();

// Create User Form
form.addEventListener('submit', e => {
    e.preventDefault();
    const newUser = {
        name : form.name.value,
        mail : form.mail.value,
        pass : form.pass.value
    };
    createUser(newUser);
});

// Edit User Handling
let userToEdit = [];
document.addEventListener('click', e => {
    if(e.target.matches('.edit-btn')){
        const userID = parseInt(e.target.dataset.userid);
        const newUser = {
        name : prompt('New Name'),
        mail : prompt('New Email'),
        pass : prompt('New Password')
        };
        editUser(userID, newUser);
    }
    else if(e.target.matches('.delete-btn')){

    }
    else if(e.target.matches('.ok-button')){

    }
    else return;
});

// Delete User Button
document.addEventListener('click', e => {
    if(!e.target.matches('.delete-btn')) return;

    const userID = parseInt(e.target.dataset.userid);
    deleteUser(userID);
});

// Clear Errors on Form Open
create.addEventListener('click', () => {
    formError();
});

// GET / render
function getUsers(){
    $.ajax({
        url: '/user',
        method: 'GET'
    }).done(res => {
        const users = JSON.parse(res);
        renderUsers(users);
    });
};

// POST / create
function createUser(object){
    $.ajax({
        url: '/user',
        method: 'POST',
        data: JSON.stringify(object),
        contentType:'application/json'
        }).done(res => {
            if(res == ''){
                getUsers();
                users.click();
                form.reset();
                formError();
            }
            else{
                formError(JSON.parse(res));
            }
    });
};

// PUT / edit
function editUser(id, object){
    $.ajax({
        url: '/user/'+id,
        method: 'PUT',
        data: JSON.stringify(object),
        contentType:'application/json'
        }).done(res => {
            getUsers();
    });
};

// DELETE / remove
function deleteUser(id){
    $.ajax({
        url: '/user/'+id,
        method: 'DELETE'
        }).done(res => {
            getUsers();
    });
};

// Render Users into list
function renderUsers(users){
    let userCount = 0;
        table.innerHTML = '';
        users.forEach(user => {
            userCount++;
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
        });
        countBadge.innerText = userCount;
};

// Form Error Messages
function formError(msgArray = ['','','']){
    for(let i = 0; msgArray.length > i; i++){
        formErrors[i].innerText = msgArray[i];
    };
};