const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

/**
 * Middleware para verificar se o Usuário existe ou não.
 */
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);
  if (!user) {
    return response.status(404).send({ error: "User not found or exists." })
  }

  request.user = user;
  return next();
}

/**
 * Rota para criar um novo Usuário
 */
app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
    users.push(user);

    return response.status(200).send({ success: "User created successfully" })
});

/**
 * Rota para listar as tarefas de um usuário.
 */
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(201).send(user.todos);
});

/**
 * Rota para criar uma nova tarefa para o usuário.
 */
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);
  
  return response.status(201).send({ success: "Task created successfully"})
});

/**
 * Rota para alterar um Todo se existir.
 */
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: "Todo does not exists." })
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).send({ success: "Tudo has been updated successfully." })
});

/**
 * Rota para marcar um Todo como "feito" se existir.
 */
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: "Todo does not exists." })
  }

  todo.done = true;

  return response.status(200).send({ success: "Tudo has been updated successfully." })
});

/**
 * Rota para deletar um Todo se existir.
 */
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: "Todo does not exists." })
  }

  user.todos.splice(todo, 1);

  return response.status(200).send({ success: "Todo has been removed successfully." })
});

module.exports = app;