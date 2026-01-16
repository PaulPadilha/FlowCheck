import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    ArrowLeft,
    Download,
    Target,
    CheckCircle2,
    Circle,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProgressRing from '@/components/ui/ProgressRing';
import StatusBadge from '@/components/ui/StatusBadge';

export default function ProjectReport() {
    const navigate = useNavigate();
    const reportRef = useRef(null);
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

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

    const handlePrint = () => {
        window.print();
    };

    const isLoading = loadingProject || loadingObjectives || loadingSteps;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-48 bg-white/5" />
                    <Skeleton className="h-64 w-full rounded-2xl bg-white/5" />
                </div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    const completedStepsCount = steps.filter(s => s.is_completed).length;
    const pendingStepsCount = steps.length - completedStepsCount;

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header - Hidden on print */}
            <div className="print:hidden sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(createPageUrl(`ProjectView?id=${projectId}`))}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Voltar ao projeto</span>
                        </button>

                        <Button onClick={handlePrint} className="bg-violet-600 hover:bg-violet-500 gap-2">
                            <Download className="w-4 h-4" />
                            Exportar PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div ref={reportRef} className="max-w-4xl mx-auto px-4 sm:px-6 py-8 print:px-8 print:py-0">
                {/* Report Header */}
                <div className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-8 mb-8 print:bg-white print:border-gray-200">
                    <div className="flex items-start justify-between gap-6 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-2 print:text-gray-600">RELATÓRIO DE PROJETO</p>
                            <h1 className="text-3xl font-bold text-white print:text-gray-900">{project.name}</h1>
                            <div className="flex items-center gap-4 mt-3">
                                <StatusBadge status={project.status} />
                                <span className="text-sm text-gray-500 print:text-gray-600">
                  Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
                            </div>
                        </div>
                        <ProgressRing progress={project.progress || 0} size={100} strokeWidth={8} />
                    </div>

                    {/* Project Info */}
                    <div className="grid gap-4 text-sm border-t border-white/5 pt-6 print:border-gray-200">
                        <div>
                            <span className="text-gray-500 print:text-gray-600">O que é:</span>
                            <p className="text-white mt-1 print:text-gray-900">{project.what_is}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 print:text-gray-600">Como fazer:</span>
                            <p className="text-white mt-1 print:text-gray-900">{project.how_to_do}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 print:text-gray-600">O que esperar:</span>
                            <p className="text-white mt-1 print:text-gray-900">{project.what_to_expect}</p>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <StatBox
                        icon={Target}
                        label="Objetivos"
                        value={objectives.length}
                        color="violet"
                    />
                    <StatBox
                        icon={CheckCircle2}
                        label="Etapas Concluídas"
                        value={completedStepsCount}
                        color="emerald"
                    />
                    <StatBox
                        icon={Circle}
                        label="Etapas Pendentes"
                        value={pendingStepsCount}
                        color="amber"
                    />
                </div>

                {/* Objectives Detail */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white print:text-gray-900">Detalhamento por Objetivo</h2>

                    {objectives.map((objective) => {
                        const objectiveSteps = steps.filter(s => s.objective_id === objective.id);
                        const completedObjectiveSteps = objectiveSteps.filter(s => s.is_completed);
                        const progress = objectiveSteps.length > 0
                            ? Math.round((completedObjectiveSteps.length / objectiveSteps.length) * 100)
                            : 0;

                        return (
                            <div
                                key={objective.id}
                                className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden print:bg-white print:border-gray-200 print:break-inside-avoid"
                            >
                                {/* Objective Header */}
                                <div className="p-5 border-b border-white/5 flex items-center justify-between print:border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            progress === 100 ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                                        } print:bg-violet-100`}>
                                            <Target className={`w-5 h-5 ${
                                                progress === 100 ? 'text-emerald-400' : 'text-violet-400'
                                            } print:text-violet-600`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white print:text-gray-900">{objective.title}</h3>
                                            <p className="text-sm text-gray-500 print:text-gray-600">
                                                {completedObjectiveSteps.length} de {objectiveSteps.length} etapas
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                    <span className={`text-2xl font-bold ${
                        progress === 100 ? 'text-emerald-400' : 'text-white'
                    } print:text-violet-600`}>
                      {progress}%
                    </span>
                                    </div>
                                </div>

                                {/* Steps */}
                                <div className="p-5 space-y-3">
                                    {objectiveSteps.map((step) => (
                                        <div
                                            key={step.id}
                                            className={`p-4 rounded-lg ${
                                                step.is_completed
                                                    ? 'bg-emerald-500/5 border border-emerald-500/20'
                                                    : 'bg-white/[0.02] border border-white/5'
                                            } print:bg-gray-50 print:border-gray-200`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                                                    step.is_completed
                                                        ? 'bg-emerald-500 border-emerald-500'
                                                        : 'border-gray-600 print:border-gray-400'
                                                }`}>
                                                    {step.is_completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-medium ${
                                                        step.is_completed ? 'text-gray-400 print:text-gray-500' : 'text-white print:text-gray-900'
                                                    }`}>
                                                        {step.title}
                                                    </p>

                                                    {step.is_completed && step.completion_note && (
                                                        <div className="mt-2 p-3 rounded-lg bg-white/[0.03] border border-white/5 print:bg-gray-100 print:border-gray-200">
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                                                <MessageSquare className="w-3 h-3" />
                                                                <span>Observação</span>
                                                                {step.completed_at && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <Calendar className="w-3 h-3" />
                                                                        <span>{format(new Date(step.completed_at), "dd/MM/yyyy HH:mm")}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-400 print:text-gray-600">{step.completion_note}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-white/5 text-center text-sm text-gray-500 print:border-gray-200">
                    Relatório gerado automaticamente pelo sistema de gestão de projetos
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .bg-\\[\\#0a0a0a\\] {
            background: white !important;
          }
          * {
            color-adjust: exact !important;
          }
        }
      `}</style>
        </div>
    );
}

function StatBox({ icon: Icon, label, value, color }) {
    const colorClasses = {
        violet: 'bg-violet-500/10 text-violet-400 print:bg-violet-100 print:text-violet-600',
        emerald: 'bg-emerald-500/10 text-emerald-400 print:bg-emerald-100 print:text-emerald-600',
        amber: 'bg-amber-500/10 text-amber-400 print:bg-amber-100 print:text-amber-600'
    };

    return (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 print:bg-white print:border-gray-200">
            <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-white print:text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 print:text-gray-600">{label}</p>
        </div>
    );
}