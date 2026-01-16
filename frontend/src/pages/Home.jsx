import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/basefc';
import { useQuery } from '@tanstack/react-query';
import { Plus, Sparkles, TrendingUp, CheckCircle, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectCard from '@/components/projects/ProjectCard';
import EmptyState from '@/components/projects/EmptyState';
import { motion } from 'framer-motion';

export default function Home() {
    const navigate = useNavigate();

    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list(), // Removi o '-created_date' para evitar erro no seu backend simples
    });

    const stats = React.useMemo(() => {
        const total = projects.length;
        const completed = projects.filter(p => p.status === 'completed').length;
        const inProgress = projects.filter(p => p.status === 'in_progress').length;
        const avgProgress = total > 0
            ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / total)
            : 0;
        return { total, completed, inProgress, avgProgress };
    }, [projects]);

    const handleCreateProject = () => {
        navigate(createPageUrl('CreateProject'));
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Meus Projetos</h1>
                                <p className="text-sm text-gray-500">Gerencie seus objetivos</p>
                            </div>
                        </div>

                        {projects.length > 0 && (
                            <Button
                                onClick={handleCreateProject}
                                className="bg-violet-600 hover:bg-violet-500 text-white gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Novo Projeto</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                {/* Stats */}
                {projects.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
                    >
                        <StatCard
                            icon={FolderOpen}
                            label="Total"
                            value={stats.total}
                            color="text-violet-400"
                            bgColor="bg-violet-500/10"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Em andamento"
                            value={stats.inProgress}
                            color="text-amber-400"
                            bgColor="bg-amber-500/10"
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Concluídos"
                            value={stats.completed}
                            color="text-emerald-400"
                            bgColor="bg-emerald-500/10"
                        />
                        <StatCard
                            icon={Sparkles}
                            label="Progresso médio"
                            value={`${stats.avgProgress}%`}
                            color="text-fuchsia-400"
                            bgColor="bg-fuchsia-500/10"
                        />
                    </motion.div>
                )}

                {/* Content */}
                {isLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-[200px] rounded-2xl bg-white/5" />
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <EmptyState onCreateProject={handleCreateProject} />
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ProjectCard project={project} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, bgColor }) {
    return (
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
            <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );
}