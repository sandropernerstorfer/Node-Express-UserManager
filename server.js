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

app.get('/getUsers', (req,res)=>{

    let rawUsers = fs.readFileSync('./data/user.json');
    let usersObject = JSON.parse(rawUsers);
    let usersArray = usersObject.users;
    res.end(JSON.stringify(usersArray));
});

app.post('/setUser', (req,res)=>{

    let rawUsers = fs.readFileSync('./data/user.json');
    let usersObject = JSON.parse(rawUsers);
    let usersArray = usersObject.users;

    let newId = 1;
    if(usersArray.length != 0){
        let lastUser = usersArray[usersArray.length-1];
        newId = lastUser[0]+1;
    }

    usersArray.push([newId, req.body.name, req.body.pass]);

    usersObject = {users : usersArray};

    fs.writeFile('./data/user.json', JSON.stringify(usersObject) , (err)=>{
        if(err) throw err;
    })
    res.status(200).end();
});

app.delete('/deleteUser', (req,res)=>{

    const userID = parseInt(req.body.id)
    
    let rawUsers = fs.readFileSync('./data/user.json');
    let usersObject = JSON.parse(rawUsers);
    let usersArray = usersObject.users;

    const newArray = usersArray.filter(user =>{
        return user[0] != userID;
    });

    usersObject = {users : newArray};

    fs.writeFile('./data/user.json', JSON.stringify(usersObject) , (err)=>{
        if(err) throw err;
    })
    res.status(200).end();
});

app.put('/editUser', (req,res)=>{

    const editData = req.body;

    let rawUsers = fs.readFileSync('./data/user.json');
    let usersObject = JSON.parse(rawUsers);
    let usersArray = usersObject.users;

    usersArray.forEach( user => {
        if(user[0] == editData.id){
            user[1] = editData.name;
            user[2] = editData.pass;
        }
    });

    usersObject = {users : usersArray};

    fs.writeFile('./data/user.json', JSON.stringify(usersObject) , (err)=>{
        if(err) throw err;
    })
    res.status(200).end(); 
});