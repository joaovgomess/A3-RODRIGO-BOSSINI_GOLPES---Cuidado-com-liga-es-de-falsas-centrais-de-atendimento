const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1. Configuração inicial do MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root' 
};

// 2. Conectando ao servidor para garantir que o banco existe
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL. O servidor está rodando?', err.message);
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

    // Remove a tabela antiga se ela existir para aplicar a nova estrutura de colunas
    db.query("DROP TABLE IF EXISTS numeros_oficiais", (err) => {
        if (err) throw err;

        const criarTabelaSQL = `
            CREATE TABLE IF NOT EXISTS numeros_oficiais (
                id INT AUTO_INCREMENT PRIMARY KEY,
                banco VARCHAR(255) NOT NULL,
                telefone VARCHAR(255) UNIQUE NOT NULL
            )
        `;

        db.query(criarTabelaSQL, (err) => {
            if (err) throw err;
            console.log("Nova tabela 'numeros_oficiais' criada com sucesso.");

            const inserirDadosSQL = `
                INSERT IGNORE INTO numeros_oficiais (nome, tipo_contato, telefone) VALUES 
                ('Itau', 'WhatsApp Oficial (Correntistas/Exterior)', '40044828'),
                ('Itau', 'WhatsApp Oficial (Renegociacao)', '40041144'),
                ('Itau (iti)', 'SAC', '08007203670'),
                ('Itau', 'SAC', '08007280728'),
                ('Bradesco', 'WhatsApp Oficial (BIA)', '33350237'),
                ('Bradesco', 'Alo Bradesco (SAC)', '08007048383'),
                ('Banco do Brasil', 'WhatsApp Oficial e Central', '40040001'),
                ('Banco do Brasil', 'SAC', '08007290001'),
                ('Caixa Economica', 'WhatsApp Oficial', '08001040104'),
                ('Caixa Economica', 'SAC CAIXA', '08007260101'),
                ('Nubank', 'Central de Atendimento', '40200185'),
                ('Nubank', 'Central de Atendimento', '08005912117'),
                ('Nubank', 'Ouvidoria', '08008870463'),
                ('Banco Inter', 'WhatsApp Oficial', '30034070'),
                ('Banco Inter', 'SAC', '08009409999'),
                ('C6 Bank', 'WhatsApp Oficial', '28326088'),
                ('C6 Bank', 'WhatsApp (Consignado)', '28326266'),
                ('C6 Bank', 'SAC', '08006600060'),
                ('Banco PAN', 'WhatsApp Oficial / Central', '40030101'),
                ('Banco PAN', 'Central (Consignado)', '40021687'),
                ('Banco Safra', 'WhatsApp (Pessoa Fisica)', '26509974'),
                ('Sicredi', 'WhatsApp Oficial', '33584770'),
                ('Sicredi', 'Sicredi Fone (SAC)', '08007244770'),
                ('Sicoob', 'WhatsApp Oficial (Alice)', '40001111'),
                ('Sicoob', 'SAC 24h', '08007244420'),
                ('PagBank', 'WhatsApp Oficial', '30033030'),
                ('PagBank', 'SAC', '08007282027'),
                ('Santander', 'Central PF', '40049090'),
                ('Santander', 'Central PF', '08007229090'),
                ('Santander', 'Central Select / Private', '40043535'),
                ('Santander', 'Central Select / Private', '30037750'),
                ('BTG Pactual', 'Central de Atendimento', '40072511'),
                ('BTG Pactual', 'Central de Atendimento', '08000012511'),
                ('BTG Pactual', 'SAC', '08007722827'),
                ('Banco BV', 'WhatsApp Oficial', '30031616'),
                ('Banco BV', 'Atendimento Atacado', '08007778086'),
                ('Banrisul', 'WhatsApp Oficial (Bah)', '32151800'),
                ('Banrisul', 'Comunicacao Ativa', '32152600'),
                ('Banrisul', 'Comunicacao Ativa', '32151900'),
                ('Neon', 'WhatsApp (Cobranca)', '46324366'),
                ('Neon', 'WhatsApp (Suporte)', '48619354'),
                ('XP Investimentos', 'WhatsApp Oficial', '49352720'),
                ('XP Investimentos', 'SAC', '08007720202'),
                ('PicPay', 'WhatsApp Oficial (Assistente)', '991700674'),
                ('PicPay', 'SAC e Relacionamento', '08000258000'),
                ('Banco Bmg', 'WhatsApp Oficial e Central', '40027007'),
                ('Banco Bmg', 'SAC', '08009799099')
            `;
            
            db.query(inserirDadosSQL, (err) => {
                if (err) throw err;
                console.log("Todos os novos dados de teste foram populados!");
            });
        });
    });
}

// 4. Rota HTTP POST para verificação do número
app.post('/api/verificar', (req, res) => {
    const { telefone } = req.body;

    if (!telefone) {
        return res.status(400).json({ erro: "Número de telefone não fornecido." });
    }

    const query = `SELECT banco FROM numeros_oficiais WHERE telefone = ?`;
    
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
    console.log(`Servidor rodando na porta ${PORT}`);
});