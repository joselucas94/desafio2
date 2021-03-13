const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).json({error: "User does not exist"});
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  const { name, username} = request.body;

  const userAlreadyExistis = users.some( (user) => user.username === username);

  if (userAlreadyExistis) {
    return response.status(400).json({error: "user already exists"})
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,    
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);


});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  var todos = user.todos.map(todo => {
    
    return {title: todo.title, done: todo.done, deadline: todo.deadline};
  });

  return response.json(user.todos);
    
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const { title, deadline } = request.body;

  const newToDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(newToDo);

  return response.status(201).json(newToDo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const newDeadline = new Date(deadline);

  const todo = user.todos.forEach(todo => {

    if (todo.id === id) {
      todo. title = title;
      todo.deadline = newDeadline;

      return response.status(201).json(todo);
    } 
       
  });

  return response.status(404).json({error:"id não encontrado"});

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const { id } = request.params;

  const todo = user.todos.forEach(todo => {

    if (todo.id === id) {
      todo.done = true;

      return response.status(201).json(todo);
    }
    
  });

  return response.status(404).json({error:"id não encontrado"});

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => { 
  const {user} = request;
  const { id } = request.params;

  const delToDo = user.todos.filter(todo => todo.id !== id);

  
  if (user.todos.length === delToDo.length) {
    return response.status(404).json({error: "Todo does not exists"});
  }

  user.todos = delToDo;

  return response.status(204).send();

});

module.exports = app;
