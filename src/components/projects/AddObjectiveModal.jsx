import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Target, Plus, X, AlertCircle, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Reutiliza a mesma regra de negócio: mínimo 3 etapas por objetivo
const MIN_STEPS_PER_OBJECTIVE = 3;

export default function AddObjectiveModal({
                                              isOpen,
                                              onClose,
                                              onSave,
                                              isSubmitting
                                          }) {
    const [objectiveTitle, setObjectiveTitle] = useState('');
    const [steps, setSteps] = useState([
        { id: 'step-1', title: '', order: 0 },
        { id: 'step-2', title: '', order: 1 },
        { id: 'step-3', title: '', order: 2 }
    ]);
    const [error, setError] = useState('');

    const resetForm = () => {
        setObjectiveTitle('');
        setSteps([
            { id: 'step-1', title: '', order: 0 },
            { id: 'step-2', title: '', order: 1 },
            { id: 'step-3', title: '', order: 2 }
        ]);
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const addStep = () => {
        setSteps([
            ...steps,
            {
                id: `step-${Date.now()}-${Math.random()}`,
                title: '',
                order: steps.length
            }
        ]);
    };

    const updateStepTitle = (index, title) => {
        const updated = [...steps];
        updated[index].title = title;
        setSteps(updated);
        if (error) setError('');
    };

    const removeStep = (index) => {
        // Mantém a regra: não pode ter menos de 3 etapas
        if (steps.length <= MIN_STEPS_PER_OBJECTIVE) {
            setError(`O objetivo deve ter no mínimo ${MIN_STEPS_PER_OBJECTIVE} etapas`);
            return;
        }
        const updated = steps.filter((_, i) => i !== index);
        setSteps(updated);
    };

    const validateAndSave = () => {
        // Validação do título do objetivo
        if (!objectiveTitle.trim()) {
            setError('Digite o nome do objetivo');
            return;
        }

        // Validação das etapas (mesma regra da criação de projeto)
        const validSteps = steps.filter(s => s.title.trim());

        if (validSteps.length < MIN_STEPS_PER_OBJECTIVE) {
            setError(`O objetivo precisa ter no mínimo ${MIN_STEPS_PER_OBJECTIVE} etapas preenchidas (atual: ${validSteps.length})`);
            return;
        }

        // Passa os dados validados
        onSave({
            title: objectiveTitle.trim(),
            steps: validSteps.map((s, index) => ({
                title: s.title.trim(),
                order: index
            }))
        });

        resetForm();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-violet-400" />
                        Adicionar novo objetivo
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Objective Title */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Nome do objetivo *</label>
                        <Input
                            value={objectiveTitle}
                            onChange={(e) => {
                                setObjectiveTitle(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Ex: Lançar versão beta"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12"
                        />
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-400">
                                Etapas * <span className="text-gray-600">(mínimo {MIN_STEPS_PER_OBJECTIVE})</span>
                            </label>
                            <span className="text-xs text-gray-500">
                {steps.filter(s => s.title.trim()).length} preenchida(s)
              </span>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-500 shrink-0">
                                        {index + 1}
                                    </div>
                                    <Input
                                        value={step.title}
                                        onChange={(e) => updateStepTitle(index, e.target.value)}
                                        placeholder={`Etapa ${index + 1}...`}
                                        className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeStep(index)}
                                        disabled={steps.length <= MIN_STEPS_PER_OBJECTIVE}
                                        className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 h-10 w-10 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <Button
                            variant="ghost"
                            onClick={addStep}
                            className="w-full border border-dashed border-white/10 text-gray-400 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/5 h-10"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar etapa
                        </Button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-gray-400"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={validateAndSave}
                        disabled={isSubmitting}
                        className="bg-violet-600 hover:bg-violet-500"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Adicionar objetivo
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}