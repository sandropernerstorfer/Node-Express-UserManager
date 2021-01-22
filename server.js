const express = require('express');
const app = express();
const fs = require('fs');
const PORT = 5002;

app.listen(PORT, () => {
    console.log(`Express Server listening on Port ${PORT}`);
});

app.use(express.static('assets'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.get('/user', (req,res)=>{
    let usersObject = JSON.parse(fs.readFileSync('./data/user.json'));
    let usersArray = usersObject.users;

    usersArray = sortUsers(usersArray,req.query.by,req.query.sort);

    res.end(JSON.stringify(usersArray));
});

app.get('/singleUser', (req,res) => {
    let usersObject = JSON.parse(fs.readFileSync('./data/user.json'));
    let usersArray = usersObject.users;

    const singleUser = usersArray.find( user => {
        return user[0] == req.query.id;
    });
    res.status(200).end(JSON.stringify(singleUser));
});

app.post('/user', (req,res)=>{

    let usersObject = JSON.parse(fs.readFileSync('./data/user.json'));
    let usersArray = usersObject.users;

    const errorArray = validateData([req.body.name,req.body.mail,req.body.pass]);

    if(!errorArray){
        let newId = 1;
        if(usersArray.length != 0){
            let lastUser = usersArray[usersArray.length-1];
            newId = lastUser[0]+1;
        }
        const newUser = [newId,req.body.name,req.body.mail,req.body.pass];
        usersArray.push(newUser);
        usersObject = {users : usersArray};

        fs.writeFile('./data/user.json', JSON.stringify(usersObject) , (err)=>{
            if(err) throw err;
        })
        res.status(200).end();
    }
    else{
        res.status(200).end(JSON.stringify(errorArray));
    }
});

app.delete('/user/:uid', (req,res)=>{

    let usersObject = JSON.parse(fs.readFileSync('./data/user.json'));
    let usersArray = usersObject.users;

    const userID = parseInt(req.params.uid);
    const newArray = usersArray.filter(user =>{
        return user[0] != userID;
    });
    usersObject = {users : newArray};

    fs.writeFile('./data/user.json', JSON.stringify(usersObject) , (err)=>{
        if(err) throw err;
    })
    res.status(200).end();
});

app.put('/user/:uid', (req,res)=>{

    let usersObject = JSON.parse(fs.readFileSync('./data/user.json'));
    let usersArray = usersObject.users;
    const userID = parseInt(req.params.uid);

    const errorArray = validateData([req.body.name,req.body.mail,req.body.pass]);
    
    if(!errorArray){
    usersArray.forEach( user => {
        if(user[0] == userID){
            user[1] = req.body.name;
            user[2] = req.body.mail == false ? user[2] : req.body.mail;
            user[3] = req.body.pass;
        }
    });
    usersObject = {users : usersArray};

    fs.writeFile('./data/user.json', JSON.stringify(usersObject) , (err)=>{
        if(err) throw err;
    })
    res.status(200).end();
    }
    else{
        res.status(200).end(JSON.stringify(errorArray));
    };
});

function validateData(newData){
    let errMsg = [];
    errMsg.push(newData[0].trim().length < 2 ? 'Name: at least 2 characters' : '');
    if(newData[1] !== false){
        errMsg.push(!newData[1].includes('@') || !newData[1].includes('.') ? 'Enter a valid Email-Address' : '');   
    }
    else{ errMsg.push('')};
    
    errMsg.push(newData[2].trim().length < 8 ? 'Password: at least 8 characters' : '');

    let usersObject = JSON.parse(fs.readFileSync('./data/user.json'));
    let usersArray = usersObject.users;

    if(newData[1] !== false){
        const searchMail = usersArray.filter(user => {
            return user[2] == newData[1];
        });

        if(searchMail.length > 0){
            errMsg[1] = 'Mail already in use';
        };
    };
    return errMsg[0]+errMsg[1]+errMsg[2] == '' ? false : errMsg;
};

function sortUsers(array, sortBy, sortMethod){
    switch(sortBy){
        case 'id':
            sortBy = 0;break;
        case 'name':
            sortBy = 1;break;
        case 'mail':
            sortBy = 2;break;
        default:
            sortBy = 0;break;
    };
    array.sort((a,b) => {
        if(a[sortBy] < b[sortBy]) return -1;
        if(a[sortBy] > b[sortBy]) return 1;
        return 0;
    });
    if(sortMethod == 'desc') return array.reverse()
    return array;
};