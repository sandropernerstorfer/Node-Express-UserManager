const form = document.querySelector('#user-form');
const table = document.querySelector('#table-users');
const users = document.querySelector('#users-tab');
const create = document.querySelector('#create-tab');
const formErrors = document.querySelectorAll('.form-error');
const editErrBox = document.querySelector('#edit-errors');
const countBadge = document.querySelector('#user-count');
const sortForm = document.querySelector('#user-sort');
const searchForm = document.querySelector('#user-search');
const clearSearch = searchForm.querySelector('#clear-search');

let userToEdit = [];        // array that holds the user getting updated
let row;                    // stores the different table-rows depending on btnclick
let btnsReady = true;
let searchReady = true;
let sortBy;                 // initial sort binding (id,name,mail)
let sortType;               // initial sort binding (ascending,descending)
getSortPref();              // check localStorage for sorting Preferences (if empty set to 'asc' by 'id');
setSortInputs();            // set sort inputs depending on localStorage preference
getUsers(sortBy,sortType);  // renders user-table on pageload + sorting

// 'Create-User' Form
form.addEventListener('submit', e => {
    e.preventDefault();
    const newUser = {
        name : form.name.value.toLowerCase(),
        mail : form.mail.value.toLowerCase(),
        pass : form.pass.value
    };
    createUser(newUser);
});

// 'User-Table' Functions
document.addEventListener('click', e => {
    if(!btnsReady) return;
    if(e.target.matches('.edit-btn')){

        if(userToEdit.length > 0) return;
        btnsReady = false;
        const userID = parseInt(e.target.dataset.userid);
        row = e.target.closest('tr');
        
        getOne(userID).then( result => {
            userToEdit = result;

            for(let i = 0; i < 4; i++){
                if(i==0){
                    row.children[i].innerHTML = `<button id="user-cancel" class="btn btn-info"><i class="fas fa-undo"></i></button>`;
                }
                else{
                    row.children[i].innerHTML = `<input class="form-control" value="${userToEdit[i]}">`
                }
            };
            e.target.parentElement.innerHTML = `<button id="user-save" class="btn btn-success" data-userid="${userToEdit[0]}"><i class="fas fa-check"></i></button>`;
            
            setTimeout(() => {
                btnsReady = true;
            }, 200);
        });
    }
    else if(e.target.matches('#user-cancel')){
        editError();
        row = e.target.closest('tr');
        for(let i = 0; i < 4; i++){
            if(i == 3){ row.children[i].innerHTML = hidePassword(userToEdit[i].length) }
            else{row.children[i].innerHTML = userToEdit[i];}
        };
        row.children[4].innerHTML = `<button class="btn btn-info edit-btn" data-userid="${userToEdit[0]}"><i class="fas fa-user-edit"></i></button>`;
        userToEdit = [];
        row = undefined;
    }
    else if(e.target.matches('#user-save')){
        btnsReady = false;
        row = e.target.closest('tr');
        let newData = [];
        for(let i = 1; i < 4; i++){
            newData.push(row.children[i].children[0].value);
        }
        const newUser = {
            name: newData[0].toLowerCase(),
            mail: newData[1].toLowerCase() == userToEdit[2] ? false : newData[1].toLowerCase(),
            pass: newData[2]
        };
        editUser(userToEdit[0], newUser);
    }
    else return;
});

// 'Delete-User' Button
document.addEventListener('click', e => {
    if(!e.target.matches('.delete-btn')) return;

    const userID = parseInt(e.target.dataset.userid);
    deleteUser(userID);
});

// Clear Errors on Form Open
create.addEventListener('click', () => {
    formError();
    editError();
});

// Reset Edit-Mode on Table Open
users.addEventListener('click', () => {
    if(row != undefined){
        row.children[0].children[0].click();
        row = undefined;
    };
});

// User-Search Form
searchForm.addEventListener('submit', e => {
    e.preventDefault();
    if(!searchReady) return;
    const query = searchForm.search.value.toLowerCase();
    if(query == '') return;
    const tableNames = Array.from(document.querySelectorAll('[data-name]'));
    const tableMails = Array.from(document.querySelectorAll('[data-mail]'));
    const tableIds = Array.from(document.querySelectorAll('[data-id]'));
    const tableData = tableNames.concat(tableMails,tableIds);
    const found = tableData.find( td => {
        if (td.innerText.toLowerCase().indexOf(query) > -1) {
            return td;
        };
    });
    if(found != undefined){
        markFoundUser(found);
    };
});
clearSearch.addEventListener('click', () => {
    searchForm.reset();
});

// User-Sorting Form
sortForm.addEventListener('submit', e => {
    e.preventDefault();
    sortType = sortForm.sortType.value;
    sortBy = sortForm.sortBy.value;
    setSortPref(sortBy, sortType);
    getUsers(sortBy, sortType);
});

// GET / render Users
function getUsers(sortVal = sortBy, sortMethod = sortType){
    $.ajax({
        url: '/user?by='+sortVal+'&sort='+sortMethod,
        method: 'GET'
    }).done(res => {
        const users = JSON.parse(res);
        renderUsers(users);
        setTimeout(() => {
            btnsReady = true;
        }, 200);
    });
};

// GET / single User
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
                // setTimeout(() => {
                //     scroll({top:document.body.scrollHeight,behavior:"smooth"});
                // }, 300);
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
                btnsReady = true;
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
            <td data-id>${user[0]}</td>
            <td data-name>${user[1]}</td>
            <td data-mail>${user[2]}</td>
            <td>${hidePassword(user[3].length)}</td>
            <td><button class="btn btn-info edit-btn" data-userid="${user[0]}"><i class="fas fa-user-edit"></i></button></td>
            <td><button class="btn btn-danger delete-btn" data-userid="${user[0]}"><i class="far fa-trash-alt"></i></button></td>
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

// Edit Error Messages
function editError(msgArray = ['','','']){
    editErrBox.innerHTML = '';
    for(let i = 0; msgArray.length > i; i++){
        if(msgArray[i] == '') continue;
        editErrBox.innerHTML += `<span>${msgArray[i]}</span>`;
    }
    if(msgArray[0]+msgArray[1]+msgArray[2] == ''){
        editErrBox.style.top = '-50px';
        return; 
    }
    editErrBox.style.top = '0';
};

// Hide Password w/ Bullet Points
function hidePassword(length){
    let bulletPoints = '';
    for(let i = 0; i < length; i++){
        bulletPoints += '&bull;';
    };
    return bulletPoints;
};

// Get User-Sorting Pref. localStorage
function getSortPref(){
    sortBy = localStorage.getItem('usermanager-sortBy');
    sortType = localStorage.getItem('usermanager-sortType');
    if(sortBy == null || sortType == null){
        setSortPref('id','asc');
    };
};

// Set User-Sorting in localStorage
function setSortPref(sortBy, sortType){
    localStorage.setItem('usermanager-sortBy', sortBy);
    localStorage.setItem('usermanager-sortType', sortType);
    getSortPref();
};

// Set Sort-Select inputs depending on preference
function setSortInputs(){
    let options1 = Array.from(document.querySelector('#sort-by').querySelectorAll('option'));
    let options2 = Array.from(document.querySelector('#sort-type').querySelectorAll('option'));
    let sortInputs = options1.concat(options2);
    sortInputs.forEach( field => {
        if(field.value == sortBy || field.value == sortType){
            field.setAttribute('selected','true');
        };
    });
};

// Mark user after Search
function markFoundUser(found){
    found.scrollIntoView({behavior:'smooth', block: 'start'});
    found.closest('tr').classList.toggle('user-found');
    searchReady = false;
    setTimeout(() => {
        found.closest('tr').classList.toggle('user-found');
        searchReady = true;
    }, 1200);
};