import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Layers } from 'lucide-react';
import ProgressRing from '@/components/ui/ProgressRing';
import StatusBadge from '@/components/ui/StatusBadge';

export default function ProjectCard({ project }) {
    return (
        <Link
            to={createPageUrl(`ProjectView?id=${project.id}`)}
            className="group block"
        >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-5 transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5">
                {/* Cover Image */}
                {project.cover_image ? (
                    <div className="relative h-32 -mx-5 -mt-5 mb-4 overflow-hidden">
                        <img
                            src={project.cover_image}
                            alt={project.name}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
                    </div>
                ) : (
                    <div className="relative h-20 -mx-5 -mt-5 mb-4 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
                    </div>
                )}

                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate mb-2 group-hover:text-violet-300 transition-colors">
                            {project.name}
                        </h3>
                        <StatusBadge status={project.status} />
                    </div>
                    <ProgressRing progress={project.progress || 0} size={56} strokeWidth={5} />
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Layers className="w-4 h-4" />
                        <span>{project.completed_steps || 0} / {project.total_steps || 0} etapas</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </Link>
    );
}