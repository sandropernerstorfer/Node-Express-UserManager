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

        if(userToEdit.length > 0) return;
        const userID = parseInt(e.target.dataset.userid);
        const row = e.target.closest('tr');

        let user;
        getOne(userID).then( result => {

            userToEdit = result;

            for(let i = 0; i < 4; i++){
                if(i==0){
                    row.children[i].innerHTML = `<button id="user-cancel" class="btn btn-warning">X</button>`;
                }
                else{
                    row.children[i].innerHTML = `<input class="form-control" value="${userToEdit[i]}">`
                }
            };
            e.target.parentElement.innerHTML = `<button id="user-save" class="btn btn-info" data-userid="${userToEdit[0]}">Save</button>`;
        });
    }
    else if(e.target.matches('#user-cancel')){
        const row = e.target.closest('tr');
        for(let i = 0; i < 4; i++){
            row.children[i].innerHTML = userToEdit[i];
        };
        row.children[4].innerHTML = `<button class="btn btn-info edit-btn" data-userid="${userToEdit[0]}">Edit</button>`;
        userToEdit = [];
    }
    else if(e.target.matches('#user-save')){
        const row = e.target.closest('tr');
        let newData = [];
        for(let i = 1; i < 4; i++){
            newData.push(row.children[i].children[0].value);
        }
        const newUser = {
            name: newData[0],
            mail: newData[1],
            pass: newData[2]
        };
        editUser(userToEdit[0], newUser);
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

async function getOne(id) {
    let result;
    try{
        result = await $.ajax({
            url: '/singleUser',
            type: 'GET',
            data: {id : id},
            contentType: 'application/json'
        });
        return JSON.parse(result);
    }
    catch(error){
        console.error(error);
    };
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
            if(res == ''){
                getUsers();
                userToEdit = [];
                editError();
            }
            else{
                editError(JSON.parse(res));
            };
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

function editError(msgArray = ['','','']){
    console.log(msgArray);
};