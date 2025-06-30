const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database.js');
require("dotenv").config();

const routes = express();

function generateToken(user) {
  const token = jwt.sign(
    { id: user.id_user, username: user.username, adm: user.adm },
    process.env.SECRET_KEY,
    { expiresIn: '1h' }
  );
  return token;
}

// Login
routes.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Nome de usuário e senha obrigatórios' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    const user = result.rows[0];

    if (user.password_user !== password) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    const token = generateToken(user);
    res.json({ token, adm: user.adm });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Cadastro
routes.post('/cadastro', async (req, res) => {
  const { username, password, password_confirm } = req.body;

  if (!username || !password || !password_confirm) {
    return res.status(400).json({ error: 'Preencha todos os dados para prosseguir' });
  }

  try {
    if (password_confirm !== password) {
      return res.status(401).json({ error: 'Senhas não coincidem' });
    }

    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length > 0) {
      return res.status(409).json({ error: 'Usuário já existe' });
    }

    await db.query(
      'INSERT INTO users (username, password_user) VALUES ($1, $2)',
      [username, password]
    );

    return res.status(200).json({ mensagem: 'Cadastro realizado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});


//Horarios

routes.get('/horarios', async(req,res) => {
  const {data} = req.query

  if(!data){
    return res.status(400).json({error: 'Data não selecionada'})
  }

try {
  const result = await db.query(
    'SELECT * FROM horarios WHERE data = $1 and disponivel = TRUE ORDER BY hora',
    [data]
  );

  const horarios = result.rows.map(row => ({
    id: row.id,
    dia: row.data.toLocaleDateString('pt-BR'),      
    hora: row.hora.slice(0, 5), 
  }));

  return res.json(horarios);
} catch (error) {
  console.error('Erro capturado no catch:', error);
  return res.status(500).json({ error: 'Erro interno no servidor' });
}
});


routes.post('/horarios-criar', async(req,res) => {
  const {date, hora} = req.body

  if(!date || !hora){
    return res.status(400).json({error:'Preencha os campos para prosseguir'})
  }

  try{

    const result = await db.query(
      'SELECT * FROM horarios WHERE data = $1 AND hora = $2',
      [date,hora]
    )

    if(result.rows.length > 0){
      return res.status(409).json({error:'Já existe um registro com essa mesma data e hora'})
    }

    await db.query(
      'INSERT INTO horarios(data,hora) VALUES ($1,$2)',
      [date,hora]
    )

    return res.status(200).json({mensagem: 'Horario criado com sucesso!' });
  }catch(error){
    console.error(error)
    return res.status(500).json({messagem: 'Erro interno no servidor'})
  }
})

routes.delete('/horarios-deletar', async(req,res) => {
  const {id} = req.body

  if(!id || typeof id !== 'number' || !Number.isInteger(id)){
    return res.status(400).json({error:'Id não preenchido ou não é um número'})
  }

  try{
    const result = await db.query(
      'SELECT * FROM horarios WHERE id = $1',
      [id]
    )

    if(result.rows.length == 0){
      return res.status(409).json({error:'Id não encontrado no banco de dados'})
    }

    await db.query(
      'DELETE FROM horarios WHERE id = $1',
      [id]
    )
    return res.status(200).json({messagem:'Horario deletado com sucesso'})
  }catch(error){
    console.error(error)
    return res.status(500).json({error:'Erro interno no servidor'})
  }
})

routes.put('/horarios-editar', async(req,res) => {
  const {id, date,hora} = req.body

  if(!id || !date || !hora){
    return res.status(400).json({error:'Campos não preenchidos'})
  }

  try{
    const result = await db.query(
      'SELECT * FROM horarios WHERE id = $1',
      [id]
    )

    if(result.rows.length == 0){
      return res.status(409).json({error: 'Horário não registrado no banco de dados'})
    }

    await db.query(
      'UPDATE horarios SET data = $1, hora = $2 WHERE id = $3',
      [date,hora,id]
    )

    return res.status(200).json({messagem:'Horário editado com sucesso!'})

  }catch(error){
    console.log(error)
    return res.status(500).json({error:'Erro interno no servidor'})
  }
})

//Agenda
routes.get('/agenda', async(req,res) => {
  try {
  const result = await db.query(
    'SELECT * FROM horarios order by data'
  );

  const horarios = result.rows

  return res.json(horarios)
} catch (error) {
  console.error('Erro capturado no catch:', error);
  return res.status(500).json({ error: 'Erro interno no servidor' });
}
});


module.exports = routes
