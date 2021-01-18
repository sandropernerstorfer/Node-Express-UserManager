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
    res.end(JSON.stringify(usersArray));
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

    usersArray.forEach( user => {
        if(user[0] == userID){
            user[1] = req.body.name;
            user[2] = req.body.mail;
            user[3] = req.body.pass;
        }
    });
    usersObject = {users : usersArray};

    fs.writeFile('./data/user.json', JSON.stringify(usersObject) , (err)=>{
        if(err) throw err;
    })
    res.status(200).end(); 
});

function validateData(newData){
    let errMsg = [];
    errMsg.push(newData[0].trim().length < 2 ? 'At least 2 characters' : '');
    errMsg.push(!newData[1].includes('@')|| !newData[1].includes('.') ? 'Enter a valid Email-Address' : '');
    errMsg.push(newData[2].trim().length < 8 ? 'At least 8 characters' : '');

    return errMsg[0]+errMsg[1]+errMsg[2] == '' ? false : errMsg;
}