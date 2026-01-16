import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    MoreVertical,
    Trash2,
    FileText,
    Target,
    Loader2,
    AlertCircle,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ProgressRing from '@/components/ui/ProgressRing';
import StatusBadge from '@/components/ui/StatusBadge';
import ObjectiveAccordion from '@/components/projects/ObjectiveAccordion';
import AddObjectiveModal from '@/components/projects/AddObjectiveModal';
import { motion } from 'framer-motion';

export default function ProjectView() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAddObjectiveModal, setShowAddObjectiveModal] = useState(false);
    const [isAddingObjective, setIsAddingObjective] = useState(false);

    const { data: project, isLoading: loadingProject } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => base44.entities.Project.filter({ id: projectId }),
        select: (data) => data[0],
        enabled: !!projectId
    });

    const { data: objectives = [], isLoading: loadingObjectives } = useQuery({
        queryKey: ['objectives', projectId],
        queryFn: () => base44.entities.Objective.filter({ project_id: projectId }, 'order'),
        enabled: !!projectId
    });

    const { data: steps = [], isLoading: loadingSteps } = useQuery({
        queryKey: ['steps', projectId],
        queryFn: () => base44.entities.Step.filter({ project_id: projectId }, 'order'),
        enabled: !!projectId
    });

    const completeStepMutation = useMutation({
        mutationFn: async ({ stepId, completionNote }) => {
            // Update step
            await base44.entities.Step.update(stepId, {
                is_completed: true,
                completion_note: completionNote,
                completed_at: new Date().toISOString()
            });

            // Get the step to find its objective
            const step = steps.find(s => s.id === stepId);
            const objectiveSteps = steps.filter(s => s.objective_id === step.objective_id);
            const completedObjectiveSteps = objectiveSteps.filter(s => s.is_completed || s.id === stepId).length;

            // Update objective progress
            const objectiveProgress = Math.round((completedObjectiveSteps / objectiveSteps.length) * 100);
            await base44.entities.Objective.update(step.objective_id, {
                completed_steps: completedObjectiveSteps,
                progress: objectiveProgress
            });

            // Update project progress
            const allCompletedSteps = steps.filter(s => s.is_completed || s.id === stepId).length;
            const projectProgress = Math.round((allCompletedSteps / steps.length) * 100);
            const newStatus = projectProgress === 100 ? 'completed' : projectProgress > 0 ? 'in_progress' : 'not_started';

            await base44.entities.Project.update(projectId, {
                completed_steps: allCompletedSteps,
                progress: projectProgress,
                status: newStatus
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['project', projectId]);
            queryClient.invalidateQueries(['objectives', projectId]);
            queryClient.invalidateQueries(['steps', projectId]);
        }
    });

    const handleCompleteStep = async (stepId, completionNote) => {
        await completeStepMutation.mutateAsync({ stepId, completionNote });
    };

    const handleDeleteProject = async () => {
        setIsDeleting(true);
        try {
            // Delete all steps
            for (const step of steps) {
                await base44.entities.Step.delete(step.id);
            }
            // Delete all objectives
            for (const objective of objectives) {
                await base44.entities.Objective.delete(objective.id);
            }
            // Delete project
            await base44.entities.Project.delete(projectId);

            navigate(createPageUrl('Home'));
        } catch (error) {
            console.error('Error deleting project:', error);
        }
        setIsDeleting(false);
    };

    const handleGenerateReport = () => {
        navigate(createPageUrl(`ProjectReport?id=${projectId}`));
    };

    // Função para adicionar novo objetivo a projeto existente
    // Reutiliza a mesma lógica de validação e cálculo de progresso
    const handleAddObjective = async (objectiveData) => {
        setIsAddingObjective(true);
        try {
            // Criar o novo objetivo
            const newObjective = await base44.entities.Objective.create({
                project_id: projectId,
                title: objectiveData.title,
                order: objectives.length,
                total_steps: objectiveData.steps.length,
                completed_steps: 0,
                progress: 0
            });

            // Criar as etapas do objetivo
            const stepsData = objectiveData.steps.map((step, index) => ({
                project_id: projectId,
                objective_id: newObjective.id,
                title: step.title,
                order: index,
                is_completed: false
            }));

            await base44.entities.Step.bulkCreate(stepsData);

            // Recalcular progresso do projeto
            // Total de etapas = etapas atuais + novas etapas
            const newTotalSteps = (project.total_steps || 0) + objectiveData.steps.length;
            const currentCompletedSteps = project.completed_steps || 0;
            const newProgress = newTotalSteps > 0
                ? Math.round((currentCompletedSteps / newTotalSteps) * 100)
                : 0;

            // Determinar novo status (não pode ser completed se há etapas pendentes)
            const newStatus = newProgress === 100 ? 'completed' : currentCompletedSteps > 0 ? 'in_progress' : 'not_started';

            await base44.entities.Project.update(projectId, {
                total_steps: newTotalSteps,
                progress: newProgress,
                status: newStatus
            });

            // Atualizar cache
            queryClient.invalidateQueries(['project', projectId]);
            queryClient.invalidateQueries(['objectives', projectId]);
            queryClient.invalidateQueries(['steps', projectId]);

            setShowAddObjectiveModal(false);
        } catch (error) {
            console.error('Error adding objective:', error);
        }
        setIsAddingObjective(false);
    };

    const isLoading = loadingProject || loadingObjectives || loadingSteps;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-48 bg-white/5" />
                    <Skeleton className="h-40 w-full rounded-2xl bg-white/5" />
                    <Skeleton className="h-64 w-full rounded-2xl bg-white/5" />
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Projeto não encontrado</h2>
                    <Button onClick={() => navigate(createPageUrl('Home'))} variant="ghost" className="text-gray-400">
                        Voltar para Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(createPageUrl('Home'))}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Projetos</span>
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
                                <DropdownMenuItem
                                    onClick={handleGenerateReport}
                                    className="text-gray-300 focus:bg-white/5 focus:text-white cursor-pointer"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Gerar Relatório
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir Projeto
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Project Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10"
                >
                    {project.cover_image && (
                        <div className="h-48 relative">
                            <img
                                src={project.cover_image}
                                alt={project.name}
                                className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
                        </div>
                    )}

                    <div className={`p-6 ${project.cover_image ? '-mt-16 relative' : ''}`}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <StatusBadge status={project.status} />
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3">{project.name}</h1>
                            </div>
                            <ProgressRing progress={project.progress || 0} size={80} strokeWidth={7} />
                        </div>

                        <div className="grid gap-4 text-sm">
                            <InfoRow label="O que é" value={project.what_is} />
                            <InfoRow label="Como fazer" value={project.how_to_do} />
                            <InfoRow label="O que esperar" value={project.what_to_expect} />
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-6 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                <span>{objectives.length} objetivo{objectives.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div>
                                {project.completed_steps || 0} de {project.total_steps || 0} etapas concluídas
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Objectives */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Objetivos</h2>
                        <Button
                            onClick={() => setShowAddObjectiveModal(true)}
                            variant="outline"
                            size="sm"
                            className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar objetivo
                        </Button>
                    </div>

                    {objectives.map((objective, index) => (
                        <motion.div
                            key={objective.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ObjectiveAccordion
                                objective={objective}
                                steps={steps.filter(s => s.objective_id === objective.id)}
                                onCompleteStep={handleCompleteStep}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Add Objective Modal */}
            <AddObjectiveModal
                isOpen={showAddObjectiveModal}
                onClose={() => setShowAddObjectiveModal(false)}
                onSave={handleAddObjective}
                isSubmitting={isAddingObjective}
            />

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Esta ação não pode ser desfeita. O projeto "{project.name}" e todos os seus objetivos e etapas serão permanentemente excluídos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProject}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-500 text-white"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Excluindo...
                                </>
                            ) : (
                                'Excluir projeto'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex gap-3">
            <span className="text-gray-500 shrink-0 w-24">{label}:</span>
            <span className="text-gray-300">{value}</span>
        </div>
    );
}