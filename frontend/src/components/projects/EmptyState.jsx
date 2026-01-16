import React from 'react';
import { FolderPlus, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ onCreateProject }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-white/10 flex items-center justify-center">
                    <Rocket className="w-12 h-12 text-violet-400" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Comece sua jornada
            </h2>
            <p className="text-gray-400 text-center max-w-md mb-8">
                Crie seu primeiro projeto e organize suas metas com objetivos e etapas claras.
            </p>

            <Button
                onClick={onCreateProject}
                className="bg-violet-600 hover:bg-violet-500 text-white gap-2 px-6 py-6 text-base rounded-xl"
            >
                <FolderPlus className="w-5 h-5" />
                Criar primeiro projeto
            </Button>
        </div>
    );
}