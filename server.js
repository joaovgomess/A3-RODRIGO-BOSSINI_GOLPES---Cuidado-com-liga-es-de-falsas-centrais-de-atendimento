const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1. Configuração inicial do MySQL (Usuário 'root' sem senha é o padrão do XAMPP)
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '' 
};

// 2. Conectando ao servidor para garantir que o banco existe
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL. O XAMPP está rodando?', err.message);
        return;
    }
    console.log('Conectado ao servidor MySQL!');

    // Cria o banco de dados se não existir
    connection.query("CREATE DATABASE IF NOT EXISTS db_fraudes", (err) => {
        if (err) throw err;
        console.log("Banco de dados 'db_fraudes' pronto.");
        inicializarBanco();
    });
});

let db; // Variável global para a conexão com o banco específico

// 3. Função para conectar no banco 'db_fraudes' e criar as tabelas
function inicializarBanco() {
    db = mysql.createConnection({
        ...dbConfig,
        database: 'db_fraudes'
    });

    const criarTabelaSQL = `
        CREATE TABLE IF NOT EXISTS numeros_oficiais (
            id INT AUTO_INCREMENT PRIMARY KEY,
            banco VARCHAR(255) NOT NULL,
            telefone VARCHAR(255) UNIQUE NOT NULL
        )
    `;

    db.query(criarTabelaSQL, (err) => {
        if (err) throw err;
        console.log("Tabela 'numeros_oficiais' pronta.");

        // Insere dados de teste (IGNORE evita duplicar ao reiniciar o servidor)
        const inserirDadosSQL = `
            INSERT IGNORE INTO numeros_oficiais (banco, telefone) VALUES 
            ('Banco do Brasil', '40040001'),
            ('Caixa Econômica', '08001040104'),
            ('Itaú', '30033030')
        `;
        
        db.query(inserirDadosSQL, (err) => {
            if (err) throw err;
            console.log("Dados de teste inseridos com sucesso.");
        });
    });
}

// 4. Rota HTTP POST para verificação do número
app.post('/api/verificar', (req, res) => {
    const { telefone } = req.body;

    if (!telefone) {
        return res.status(400).json({ erro: "Número de telefone não fornecido." });
    }

    const query = SELECT banco FROM numeros_oficiais WHERE telefone = ?;
    
    db.query(query, [telefone], (err, results) => {
        if (err) {
            console.error('Erro na consulta:', err.message);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }

        // No mysql2, os resultados voltam como um array (lista)
        if (results.length > 0) {
            res.json({ oficial: true, banco: results[0].banco });
        } else {
            res.json({ oficial: false, banco: null });
        }
    });
});

app.listen(PORT, () => {
    console.log(Servidor rodando na porta ${PORT});
});