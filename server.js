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

    let usersObject = JSON.parse(fs.readFileSync('./data/user.json'));
    let usersArray = usersObject.users;

    let newUser = [req.body.name,req.body.mail,req.body.pass];

    let errMsg = [];
    errMsg.push(newUser[0].length < 2 ? 'At least 2 characters' : '');
    errMsg.push(!newUser[1].includes('@')|| !newUser[1].includes('.') ? 'Enter a valid Email-Address' : '');
    errMsg.push(newUser[2].length < 8 ? 'At least 8 characters' : '');
    const calc = errMsg[0]+errMsg[1]+errMsg[2];

    if(calc == ''){
        let newId = 1;
        if(usersArray.length != 0){
            let lastUser = usersArray[usersArray.length-1];
            newId = lastUser[0]+1;
        }
        
        newUser.unshift(newId);
        usersArray.push(newUser);

        usersObject = {users : usersArray};

        fs.writeFile('./data/user.json', JSON.stringify(usersObject) , (err)=>{
            if(err) throw err;
        })
        res.status(200).end();
    }
    else{
        res.status(200).end(JSON.stringify(errMsg));
    }
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
            user[2] = editData.mail;
            user[3] = editData.pass;
        }
    });

    usersObject = {users : usersArray};

    fs.writeFile('./data/user.json', JSON.stringify(usersObject) , (err)=>{
        if(err) throw err;
    })
    res.status(200).end(); 
});