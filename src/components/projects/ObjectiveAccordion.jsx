import React, { useState } from 'react';
import { ChevronDown, Target, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StepItem from './StepItem';

export default function ObjectiveAccordion({ objective, steps, onCompleteStep }) {
    const [isOpen, setIsOpen] = useState(true);

    const completedSteps = steps.filter(s => s.is_completed).length;
    const totalSteps = steps.length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    const isComplete = completedSteps === totalSteps && totalSteps > 0;

    return (
        <div className={`rounded-2xl border overflow-hidden transition-all ${
            isComplete
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-white/[0.03] border-white/10'
        }`}>
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
            >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isComplete ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                }`}>
                    {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                        <Target className="w-5 h-5 text-violet-400" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-lg ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                        {objective.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-500">
              {completedSteps} de {totalSteps} etapas
            </span>
                        <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-violet-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>

                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                </motion.div>
            </button>

            {/* Steps */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 space-y-3">
                            {steps.map((step) => (
                                <StepItem
                                    key={step.id}
                                    step={step}
                                    onComplete={onCompleteStep}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}