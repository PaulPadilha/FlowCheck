const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const crypto = require('crypto');
const multer = require('multer'); // Adicionado
const path = require('path');     // Adicionado
const fs = require('fs');         // Adicionado

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÃO DE UPLOAD ---

// Garante que a pasta 'uploads' exista para não dar erro ao salvar
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configura como e onde os arquivos serão salvos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Gera um nome único: timestamp + extensão original
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// Torna a pasta 'uploads' pública para que o link gerado funcione no <img> do front-end
app.use('/uploads', express.static('uploads'));

// Rota de Upload de Imagem
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    // Gera a URL completa para o front-end
    const file_url = `http://localhost:3000/uploads/${req.file.filename}`;

    // Retorna exatamente o que o CreateProject.jsx espera: { file_url }
    res.json({ file_url });
});

// --- FIM DA CONFIGURAÇÃO DE UPLOAD ---

// Conectar ao Banco de Dados (cria o arquivo se não existir)
const db = new sqlite3.Database('./database.sqlite');

// Criar as tabelas se não existirem
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT,
        cover_image TEXT,
        what_is TEXT,
        how_to_do TEXT,
        what_to_expect TEXT,
        status TEXT,
        total_steps INTEGER,
        completed_steps INTEGER,
        progress INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS objectives (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        title TEXT,
        "order" INTEGER,
        total_steps INTEGER,
        completed_steps INTEGER,
        progress INTEGER,
        FOREIGN KEY(project_id) REFERENCES projects(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS steps (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        objective_id TEXT,
        title TEXT,
        "order" INTEGER,
        is_completed BOOLEAN,
        completion_note TEXT,
        completed_at TEXT,
        FOREIGN KEY(objective_id) REFERENCES objectives(id)
    )`);
});

// --- ROTAS DE PROJETOS ---
app.get('/projects', (req, res) => {
    const { id } = req.query;
    if (id) {
        db.all('SELECT * FROM projects WHERE id = ?', [id], (err, rows) => res.json(rows));
    } else {
        db.all('SELECT * FROM projects', [], (err, rows) => res.json(rows));
    }
});

app.post('/projects', (req, res) => {
    const p = req.body;
    const id = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
    db.run(`INSERT INTO projects (id, name, cover_image, what_is, how_to_do, what_to_expect, status, total_steps, completed_steps, progress) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, p.name, p.cover_image, p.what_is, p.how_to_do, p.what_to_expect, p.status, p.total_steps, p.completed_steps, p.progress],
        function(err) { res.json({ id }); });
});

app.delete('/projects/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM projects WHERE id = ?', id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deleted: this.changes });
    });
});

// --- ROTAS DE OBJETIVOS E STEPS ---
app.get('/objectives', (req, res) => {
    db.all('SELECT * FROM objectives WHERE project_id = ? ORDER BY "order"', [req.query.project_id], (err, rows) => res.json(rows));
});

app.post('/objectives', (req, res) => {
    const obj = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    db.run('INSERT INTO objectives (id, project_id, title, "order", total_steps, completed_steps, progress) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, obj.project_id, obj.title, obj.order, obj.total_steps, obj.completed_steps, obj.progress], () => res.json({ id }));
});

app.delete('/objectives/:id', (req, res) => {
    db.run('DELETE FROM objectives WHERE id = ?', req.params.id, () => res.json({ success: true }));
});

app.get('/steps', (req, res) => {
    db.all('SELECT * FROM steps WHERE project_id = ? ORDER BY "order"', [req.query.project_id], (err, rows) => res.json(rows));
});

app.post('/steps/bulk', (req, res) => {
    const steps = req.body;
    const stmt = db.prepare('INSERT INTO steps (id, project_id, objective_id, title, "order", is_completed) VALUES (?, ?, ?, ?, ?, ?)');
    steps.forEach(s => stmt.run(Math.random().toString(36).substring(2, 15), s.project_id, s.objective_id, s.title, s.order, s.is_completed));
    stmt.finalize(() => res.json({ success: true }));
});

app.delete('/steps/:id', (req, res) => {
    db.run('DELETE FROM steps WHERE id = ?', req.params.id, () => res.json({ success: true }));
});

// Correção: Você tinha duas rotas PATCH /projects/:id duplicadas, unifiquei aqui
app.patch('/projects/:id', (req, res) => {
    const fields = req.body;
    const params = [];
    const sets = Object.keys(fields).map(key => {
        params.push(fields[key]);
        return `${key} = ?`;
    });
    params.push(req.params.id);

    db.run(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.patch('/steps/:id', (req, res) => {
    const { id } = req.params;
    const fields = req.body;

    const sets = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fields), id];

    db.run(`UPDATE steps SET ${sets} WHERE id = ?`, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, updated: this.changes });
    });
});

app.patch('/objectives/:id', (req, res) => {
    const { id } = req.params;
    const fields = req.body;

    const sets = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fields), id];

    db.run(`UPDATE objectives SET ${sets} WHERE id = ?`, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log('🚀 Backend rodando em http://localhost:3000'));