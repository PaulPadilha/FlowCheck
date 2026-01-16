import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/basefc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Upload, X, AlertCircle, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ObjectiveBuilder from '@/components/projects/ObjectiveBuilder';

export default function CreateProject() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [objectiveErrors, setObjectiveErrors] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        cover_image: '',
        what_is: '',
        how_to_do: '',
        what_to_expect: ''
    });

    const [objectives, setObjectives] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            // Agora o base44.files.upload existe e aponta para o seu axios
            const response = await base44.files.upload(file);

            // O seu backend deve retornar um objeto com a URL, ex: { file_url: "..." }
            if (response && response.file_url) {
                setFormData(prev => ({
                    ...prev,
                    cover_image: response.file_url
                }));
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            alert("Erro ao subir imagem para o servidor local.");
        } finally {
            setUploadingImage(false);
            e.target.value = null;
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'O nome do projeto é obrigatório';
        if (!formData.what_is.trim()) newErrors.what_is = 'Descreva o que é o projeto';
        if (!formData.how_to_do.trim()) newErrors.how_to_do = 'Descreva como fazer o projeto';
        if (!formData.what_to_expect.trim()) newErrors.what_to_expect = 'Descreva o que esperar do projeto';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newObjectiveErrors = [];

        if (objectives.length === 0) {
            setErrors({ objectives: 'Adicione pelo menos um objetivo ao projeto' });
            return false;
        }

        objectives.forEach((obj, index) => {
            const validSteps = obj.steps.filter(s => s.title.trim());
            if (validSteps.length < 3) {
                newObjectiveErrors.push({
                    objectiveIndex: index,
                    message: `O objetivo precisa ter no mínimo 3 etapas (atual: ${validSteps.length})`
                });
            }
        });

        setObjectiveErrors(newObjectiveErrors);
        setErrors({});
        return newObjectiveErrors.length === 0;
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSaveProject = async () => {
        if (!validateStep2()) return;

        setIsSubmitting(true);
        try {
            // Calculate total steps
            const totalSteps = objectives.reduce((acc, obj) =>
                acc + obj.steps.filter(s => s.title.trim()).length, 0
            );

            // Create project
            const project = await base44.entities.Project.create({
                ...formData,
                status: 'not_started',
                total_steps: totalSteps,
                completed_steps: 0,
                progress: 0
            });

            // Create objectives and steps
            for (let i = 0; i < objectives.length; i++) {
                const obj = objectives[i];
                const validSteps = obj.steps.filter(s => s.title.trim());

                const objective = await base44.entities.Objective.create({
                    project_id: project.id,
                    title: obj.title,
                    order: i,
                    total_steps: validSteps.length,
                    completed_steps: 0,
                    progress: 0
                });

                // Create steps
                const stepsData = validSteps.map((step, stepIndex) => ({
                    project_id: project.id,
                    objective_id: objective.id,
                    title: step.title,
                    order: stepIndex,
                    is_completed: false
                }));

                await base44.entities.Step.bulkCreate(stepsData);
            }

            navigate(createPageUrl(`ProjectView?id=${project.id}`));
        } catch (error) {
            console.error('Error creating project:', error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => step === 1 ? navigate(createPageUrl('Home')) : setStep(1)}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>{step === 1 ? 'Voltar' : 'Informações'}</span>
                        </button>

                        {/* Step Indicator */}
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                step >= 1 ? 'bg-violet-600 text-white' : 'bg-white/10 text-gray-500'
                            }`}>
                                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                            </div>
                            <div className="w-8 h-0.5 bg-white/10">
                                <div className={`h-full bg-violet-600 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                step >= 2 ? 'bg-violet-600 text-white' : 'bg-white/10 text-gray-500'
                            }`}>
                                2
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Informações do Projeto</h2>
                                <p className="text-gray-400">Preencha os detalhes básicos do seu novo projeto</p>
                            </div>

                            {/* Cover Image */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Capa do projeto (opcional)</label>
                                {formData.cover_image ? (
                                    <div className="relative h-40 rounded-xl overflow-hidden">
                                        <img
                                            src={formData.cover_image}
                                            alt="Cover"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-white/10 cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all">
                                        {uploadingImage ? (
                                            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-gray-500 mb-2" />
                                                <span className="text-sm text-gray-500">Clique para fazer upload</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Project Name */}
                            <FormField
                                label="Nome do projeto *"
                                error={errors.name}
                            >
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Lançamento do novo produto"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12"
                                />
                            </FormField>

                            {/* What is */}
                            <FormField
                                label="O que é? *"
                                description="Descreva brevemente o projeto"
                                error={errors.what_is}
                            >
                                <Textarea
                                    value={formData.what_is}
                                    onChange={(e) => setFormData(prev => ({ ...prev, what_is: e.target.value }))}
                                    placeholder="Descreva o propósito e escopo do projeto..."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 min-h-[100px]"
                                />
                            </FormField>

                            {/* How to do */}
                            <FormField
                                label="Como fazer? *"
                                description="Qual a estratégia ou abordagem"
                                error={errors.how_to_do}
                            >
                                <Textarea
                                    value={formData.how_to_do}
                                    onChange={(e) => setFormData(prev => ({ ...prev, how_to_do: e.target.value }))}
                                    placeholder="Descreva como você pretende executar o projeto..."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 min-h-[100px]"
                                />
                            </FormField>

                            {/* What to expect */}
                            <FormField
                                label="O que esperar? *"
                                description="Resultados e entregas esperadas"
                                error={errors.what_to_expect}
                            >
                                <Textarea
                                    value={formData.what_to_expect}
                                    onChange={(e) => setFormData(prev => ({ ...prev, what_to_expect: e.target.value }))}
                                    placeholder="Descreva os resultados esperados ao final do projeto..."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 min-h-[100px]"
                                />
                            </FormField>

                            <div className="pt-4">
                                <Button
                                    onClick={handleNextStep}
                                    className="w-full bg-violet-600 hover:bg-violet-500 h-12 text-base"
                                >
                                    Próximo: Definir Objetivos
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Objetivos e Etapas</h2>
                                <p className="text-gray-400">Defina os objetivos e etapas do projeto "{formData.name}"</p>
                            </div>

                            {/* Project Summary */}
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                                <h3 className="font-medium text-white">{formData.name}</h3>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-gray-500 shrink-0">O que é:</span>
                                        <span className="text-gray-300">{formData.what_is}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-gray-500 shrink-0">Como fazer:</span>
                                        <span className="text-gray-300">{formData.how_to_do}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-gray-500 shrink-0">O que esperar:</span>
                                        <span className="text-gray-300">{formData.what_to_expect}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Global Error */}
                            {errors.objectives && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {errors.objectives}
                                </div>
                            )}

                            {/* Objectives Builder */}
                            <ObjectiveBuilder
                                objectives={objectives}
                                onChange={setObjectives}
                                errors={objectiveErrors}
                            />

                            <div className="pt-4 flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 h-12"
                                >
                                    Voltar
                                </Button>
                                <Button
                                    onClick={handleSaveProject}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-violet-600 hover:bg-violet-500 h-12 text-base"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5 mr-2" />
                                            Criar Projeto
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function FormField({ label, description, error, children }) {
    return (
        <div className="space-y-2">
            <label className="block">
                <span className="text-sm text-gray-300">{label}</span>
                {description && (
                    <span className="text-xs text-gray-500 ml-2">{description}</span>
                )}
            </label>
            {children}
            {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
}