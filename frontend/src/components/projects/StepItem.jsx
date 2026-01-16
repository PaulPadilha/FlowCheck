import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Alterado de onToggle para onComplete para bater com o ObjectiveAccordion
const StepItem = ({ step, onComplete }) => {
    return (
        <div className="flex items-center space-x-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
            <Checkbox
                id={step.id}
                checked={step.is_completed}
                onCheckedChange={() => onComplete(step.id, "Concluído")} // Enviando o ID e a nota
                className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
            />
            <label
                htmlFor={step.id}
                className={cn(
                    "text-sm font-medium leading-none cursor-pointer transition-all",
                    step.is_completed ? "line-through text-zinc-500" : "text-zinc-200"
                )}
            >
                {step.title}
            </label>
        </div>
    );
};

export default StepItem;