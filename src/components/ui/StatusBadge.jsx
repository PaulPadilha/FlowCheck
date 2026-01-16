import React from 'react';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

const statusConfig = {
    not_started: {
        label: 'Não iniciado',
        icon: Circle,
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    },
    in_progress: {
        label: 'Em andamento',
        icon: Clock,
        className: 'bg-violet-500/20 text-violet-400 border-violet-500/30'
    },
    completed: {
        label: 'Concluído',
        icon: CheckCircle2,
        className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    }
};

export default function StatusBadge({ status }) {
    const config = statusConfig[status] || statusConfig.not_started;
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
            <Icon className="w-3 h-3" />
            {config.label}
        </div>
    );
}