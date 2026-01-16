import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target, Plus, X, GripVertical, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ObjectiveBuilder({ objectives, onChange, errors }) {
    const [newObjectiveTitle, setNewObjectiveTitle] = useState('');

    const addObjective = () => {
        if (!newObjectiveTitle.trim()) return;

        const newObjective = {
            id: `temp-${Date.now()}`,
            title: newObjectiveTitle.trim(),
            steps: []
        };

        onChange([...objectives, newObjective]);
        setNewObjectiveTitle('');
    };

    const addStep = (objectiveIndex) => {
        const updated = [...objectives];
        updated[objectiveIndex].steps.push({
            id: `temp-step-${Date.now()}-${Math.random()}`,
            title: '',
            order: updated[objectiveIndex].steps.length
        });
        onChange(updated);
    };

    const updateStepTitle = (objectiveIndex, stepIndex, title) => {
        const updated = [...objectives];
        updated[objectiveIndex].steps[stepIndex].title = title;
        onChange(updated);
    };

    const removeStep = (objectiveIndex, stepIndex) => {
        const updated = [...objectives];
        updated[objectiveIndex].steps.splice(stepIndex, 1);
        onChange(updated);
    };

    const objectiveHasError = (index) => {
        return errors?.some(e => e.objectiveIndex === index);
    };

    const getObjectiveError = (index) => {
        const error = errors?.find(e => e.objectiveIndex === index);
        return error?.message;
    };

    return (
        <div className="space-y-6">
            {/* Add New Objective */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                        value={newObjectiveTitle}
                        onChange={(e) => setNewObjectiveTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addObjective()}
                        placeholder="Digite o nome do objetivo..."
                        className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
                    />
                </div>
                <Button
                    onClick={addObjective}
                    disabled={!newObjectiveTitle.trim()}
                    className="bg-violet-600 hover:bg-violet-500 h-12 px-5"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar
                </Button>
            </div>

            {/* Objectives List */}
            <AnimatePresence mode="popLayout">
                {objectives.map((objective, objIndex) => (
                    <motion.div
                        key={objective.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`rounded-xl border ${objectiveHasError(objIndex) ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/[0.03]'} overflow-hidden`}
                    >
                        {/* Objective Header */}
                        <div className="flex items-center gap-3 p-4 bg-white/[0.02] border-b border-white/5">
                            <GripVertical className="w-5 h-5 text-gray-600 cursor-grab" />
                            <Target className="w-5 h-5 text-violet-400" />
                            <span className="font-medium text-white flex-1">{objective.title}</span>
                            <span className="text-sm text-gray-500">
                {objective.steps.length} etapa{objective.steps.length !== 1 ? 's' : ''}
              </span>
                        </div>

                        {/* Error Message */}
                        {objectiveHasError(objIndex) && (
                            <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {getObjectiveError(objIndex)}
                            </div>
                        )}

                        {/* Steps */}
                        <div className="p-4 space-y-3">
                            {objective.steps.map((step, stepIndex) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-500">
                                        {stepIndex + 1}
                                    </div>
                                    <Input
                                        value={step.title}
                                        onChange={(e) => updateStepTitle(objIndex, stepIndex, e.target.value)}
                                        placeholder={`Etapa ${stepIndex + 1}...`}
                                        className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeStep(objIndex, stepIndex)}
                                        className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 h-10 w-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            ))}

                            <Button
                                variant="ghost"
                                onClick={() => addStep(objIndex)}
                                className="w-full border border-dashed border-white/10 text-gray-400 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/5 h-10"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar etapa
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {objectives.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Adicione objetivos para organizar seu projeto</p>
                </div>
            )}
        </div>
    );
}