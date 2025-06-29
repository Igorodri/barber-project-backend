const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database.js');
require("dotenv").config();


const routes = express();

// Gerar Token
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '1h' });
}

// Verificar Autenticação
function verificarAutenticacao(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    req.userId = decoded.userId;
    next();
  });
}

// Login
routes.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Nome de usuário e senha obrigatórios" });
  }

  const client = await db();
  try {
    const { rows } = await client.query(
      'SELECT * FROM USERS WHERE USERNAME = $1 AND password_user = $2',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const token = generateToken(rows[0].id);
    return res.status(200).json({ mensagem: "Login bem-sucedido!", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  } finally {
    await client.end();
  }
});

// EVENTOS
routes.post('/eventos', async (req, res) => {
  const { imagem_eventos, titulo_eventos, descricao_eventos } = req.body;

  if (!imagem_eventos || !titulo_eventos || !descricao_eventos) {
    return res.status(400).json({ error: "Preencha todos os campos para prosseguir" });
  }

  const client = await db();
  try {
    await client.query(
      'INSERT INTO EVENTOS (imagem_eventos, titulo_eventos, descricao_eventos) VALUES ($1, $2, $3)',
      [imagem_eventos, titulo_eventos, descricao_eventos]
    );

    return res.status(200).json({ mensagem: "Informações armazenadas com sucesso!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  } finally {
    await client.end();
  }
});

routes.get('/eventos_exibir', async (req, res) => {
  const client = await db();
  try {
    const { rows } = await client.query('SELECT * FROM EVENTOS');
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar eventos" });
  } finally {
    await client.end();
  }
});



routes.delete('/eventos_deletar', async (req, res) => {
  const { id_evento_deletar } = req.body;

  if (!id_evento_deletar) {
    return res.status(400).json({ error: "Preencha o id" });
  }

  const client = await db();
  try {
    const buscaImagem = await client.query(
      'SELECT imagem_eventos FROM EVENTOS WHERE ID_EVENTOS = $1',
      [id_evento_deletar]
    );

    if (buscaImagem.rowCount === 0) {
      return res.status(400).json({ error: "Id não encontrado" });
    }

    const imagem_url = buscaImagem.rows[0].imagem_eventos;

    const publicId = imagem_url.split('/').pop().split('.')[0];

    await deletarImagemCloudinary(publicId);

    const resultado = await client.query(
      'DELETE FROM EVENTOS WHERE ID_EVENTOS = $1',
      [id_evento_deletar]
    );

    return res.status(200).json({ mensagem: "Registro deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar evento" });
  } finally {
    await client.end();
  }
});



routes.put('/eventos_editar', async (req, res) => {
  const { id_evento_editar, imagem_eventos_editar, titulo_eventos_editar, descricao_eventos_editar } = req.body;

  if (!id_evento_editar || !imagem_eventos_editar || !titulo_eventos_editar || !descricao_eventos_editar) {
    return res.status(400).json({ error: "Preencha todos os campos para prosseguir" });
  }

  const client = await db();
  try {
    const resultado = await client.query(
      'UPDATE EVENTOS SET imagem_eventos = $1, titulo_eventos = $2, descricao_eventos = $3 WHERE id_eventos = $4',
      [imagem_eventos_editar, titulo_eventos_editar, descricao_eventos_editar, id_evento_editar]
    );

    if (resultado.rowCount === 0) {
      return res.status(400).json({ error: "Registro não encontrado" });
    }

    return res.status(200).json({ mensagem: "Informações editadas com sucesso!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  } finally {
    await client.end();
  }
});

module.exports = routes;
