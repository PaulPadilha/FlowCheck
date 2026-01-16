import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 1. Listar projetos (Home)
app.get('/projects', async (req, res) => {
    const projects = await prisma.project.findMany({
        include: { objectives: { include: { steps: true } } },
        orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
});

// 2. Detalhes do Projeto (ProjectView)
app.get('/projects/:id', async (req, res) => {
    const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: { objectives: { include: { steps: true }, orderBy: { order: 'asc' } } }
    });
    res.json(project);
});

// 3. Criar Projeto
app.post('/projects', async (req, res) => {
    const project = await prisma.project.create({ data: req.body });
    res.status(201).json(project);
});

// 4. Criar Objetivo
app.post('/objectives', async (req, res) => {
    const objective = await prisma.objective.create({ data: req.body });
    res.status(201).json(objective);
});

// 5. Criar Steps em Lote (bulkCreate usado no front)
app.post('/steps/bulk', async (req, res) => {
    const steps = await prisma.step.createMany({ data: req.body });
    res.status(201).json(steps);
});

// 6. Atualizar Step (Check/Uncheck)
app.put('/steps/:id', async (req, res) => {
    const { is_completed } = req.body;
    const step = await prisma.step.update({
        where: { id: req.params.id },
        data: {
            is_completed,
            completed_at: is_completed ? new Date() : null
        }
    });
    res.json(step);
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));