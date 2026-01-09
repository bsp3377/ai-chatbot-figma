"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Bot,
    Globe,
    Upload,
    FileText,
    Check,
    Loader2,
    Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const steps = [
    { id: 1, title: "Basics", description: "Name your chatbot" },
    { id: 2, title: "Personality", description: "Define behavior" },
    { id: 3, title: "Content", description: "Add knowledge sources" },
    { id: 4, title: "Customize", description: "Brand your widget" },
    { id: 5, title: "Launch", description: "Deploy your chatbot" },
];

export default function CreateChatbotPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        welcomeMessage: "Hi! How can I help you today?",
        personality: "friendly",
        language: "en",
        systemPrompt: "",
        websiteUrl: "",
        widgetColor: "#3B82F6",
        widgetPosition: "bottom-right",
        buttonText: "Chat with us",
    });

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            const { createChatbot } = await import("@/actions/chatbot-actions");
            const newBot = await createChatbot({ name: formData.name });
            router.push(`/chatbots/${newBot.id}`);
        } catch (error) {
            console.error("Failed to create chatbot:", error);
            setIsSubmitting(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.name.trim().length >= 2;
            case 2:
                return true;
            case 3:
                return true;
            case 4:
                return true;
            case 5:
                return true;
            default:
                return false;
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/chatbots"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Chatbots
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Create New Chatbot</h1>
                <p className="text-gray-500 mt-1">Set up your AI assistant in a few simple steps</p>
            </div>

            {/* Progress */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        Step {currentStep} of {steps.length}
                    </span>
                    <span className="text-sm text-gray-500">
                        {steps[currentStep - 1].title}
                    </span>
                </div>
                <Progress value={(currentStep / steps.length) * 100} className="h-2" />

                {/* Step indicators */}
                <div className="flex justify-between mt-3">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`flex items-center gap-1.5 text-xs ${step.id === currentStep
                                ? "text-blue-600 font-medium"
                                : step.id < currentStep
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${step.id === currentStep
                                    ? "bg-blue-600 text-white"
                                    : step.id < currentStep
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                            >
                                {step.id < currentStep ? <Check className="w-3 h-3" /> : step.id}
                            </div>
                            <span className="hidden sm:inline">{step.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    {currentStep === 1 && (
                        <StepBasics formData={formData} updateFormData={updateFormData} />
                    )}
                    {currentStep === 2 && (
                        <StepPersonality formData={formData} updateFormData={updateFormData} />
                    )}
                    {currentStep === 3 && (
                        <StepContent formData={formData} updateFormData={updateFormData} />
                    )}
                    {currentStep === 4 && (
                        <StepCustomize formData={formData} updateFormData={updateFormData} />
                    )}
                    {currentStep === 5 && (
                        <StepLaunch formData={formData} />
                    )}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                {currentStep === steps.length ? (
                    <Button onClick={handleCreate} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Create Chatbot
                            </>
                        )}
                    </Button>
                ) : (
                    <Button onClick={handleNext} disabled={!canProceed()}>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
}

function StepBasics({ formData, updateFormData }: { formData: any; updateFormData: (field: string, value: string) => void }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Bot className="w-8 h-8 text-blue-600" />
                <div>
                    <h3 className="font-medium text-gray-900">Let's name your chatbot</h3>
                    <p className="text-sm text-gray-600">Choose a name that represents your brand or purpose</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Chatbot Name *</Label>
                    <Input
                        id="name"
                        placeholder="e.g., Support Assistant, Sales Bot"
                        value={formData.name}
                        onChange={(e) => updateFormData("name", e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                        This name will be visible to your visitors
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="welcomeMessage">Welcome Message</Label>
                    <Textarea
                        id="welcomeMessage"
                        placeholder="Hi! How can I help you today?"
                        value={formData.welcomeMessage}
                        onChange={(e) => updateFormData("welcomeMessage", e.target.value)}
                        rows={3}
                    />
                    <p className="text-xs text-gray-500">
                        First message visitors see when they open the chat
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="language">Primary Language</Label>
                    <Select
                        value={formData.language}
                        onValueChange={(value) => updateFormData("language", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="auto">Auto-detect</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

function StepPersonality({ formData, updateFormData }: { formData: any; updateFormData: (field: string, value: string) => void }) {
    const personalities = [
        { id: "friendly", label: "Friendly", description: "Warm, helpful, and conversational" },
        { id: "formal", label: "Professional", description: "Formal, business-appropriate tone" },
        { id: "casual", label: "Casual", description: "Relaxed and approachable" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-medium text-gray-900 mb-1">Choose a personality</h3>
                <p className="text-sm text-gray-500">How should your chatbot communicate?</p>
            </div>

            <div className="grid gap-3">
                {personalities.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => updateFormData("personality", p.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${formData.personality === p.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <div className="font-medium text-gray-900">{p.label}</div>
                        <div className="text-sm text-gray-500">{p.description}</div>
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                <Label htmlFor="systemPrompt">Custom Instructions (Optional)</Label>
                <Textarea
                    id="systemPrompt"
                    placeholder="Add specific instructions for your chatbot..."
                    value={formData.systemPrompt}
                    onChange={(e) => updateFormData("systemPrompt", e.target.value)}
                    rows={4}
                />
                <p className="text-xs text-gray-500">
                    e.g., "Always recommend contacting support for billing issues"
                </p>
            </div>
        </div>
    );
}

function StepContent({ formData, updateFormData }: { formData: any; updateFormData: (field: string, value: string) => void }) {
    const sources = [
        { id: "website", icon: Globe, label: "Website", description: "Crawl and learn from your website" },
        { id: "files", icon: Upload, label: "Upload Files", description: "PDF, DOCX, TXT files" },
        { id: "text", icon: FileText, label: "Custom Text", description: "Paste FAQs or knowledge base" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-medium text-gray-900 mb-1">Add content sources</h3>
                <p className="text-sm text-gray-500">Your chatbot will learn from these sources (you can add more later)</p>
            </div>

            <div className="grid gap-3">
                {sources.map((source) => (
                    <div
                        key={source.id}
                        className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <source.icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{source.label}</div>
                                <div className="text-sm text-gray-500">{source.description}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL (Optional)</Label>
                <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://your-website.com"
                    value={formData.websiteUrl}
                    onChange={(e) => updateFormData("websiteUrl", e.target.value)}
                />
                <p className="text-xs text-gray-500">
                    We'll crawl up to 100 pages from this domain
                </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                    💡 <strong>Tip:</strong> You can skip this step and add content sources later from the chatbot settings.
                </p>
            </div>
        </div>
    );
}

function StepCustomize({ formData, updateFormData }: { formData: any; updateFormData: (field: string, value: string) => void }) {
    const colors = [
        "#3B82F6", // Blue
        "#10B981", // Green
        "#8B5CF6", // Purple
        "#F59E0B", // Amber
        "#EF4444", // Red
        "#EC4899", // Pink
        "#000000", // Black
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-medium text-gray-900 mb-1">Customize your widget</h3>
                <p className="text-sm text-gray-500">Match the chat widget to your brand</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Widget Color</Label>
                        <div className="flex gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => updateFormData("widgetColor", color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.widgetColor === color
                                        ? "border-gray-900 scale-110"
                                        : "border-transparent hover:scale-105"
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Position</Label>
                        <Select
                            value={formData.widgetPosition}
                            onValueChange={(value) => updateFormData("widgetPosition", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="buttonText">Button Text</Label>
                        <Input
                            id="buttonText"
                            value={formData.buttonText}
                            onChange={(e) => updateFormData("buttonText", e.target.value)}
                            placeholder="Chat with us"
                        />
                    </div>
                </div>

                {/* Preview */}
                <div className="relative bg-gray-100 rounded-lg p-4 min-h-[200px]">
                    <div className="absolute bottom-4 right-4">
                        <button
                            className="px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg"
                            style={{ backgroundColor: formData.widgetColor }}
                        >
                            {formData.buttonText || "Chat with us"}
                        </button>
                    </div>
                    <div className="text-center text-sm text-gray-400 mt-8">
                        Widget Preview
                    </div>
                </div>
            </div>
        </div>
    );
}

function StepLaunch({ formData }: { formData: any }) {
    return (
        <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-600" />
            </div>

            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to launch "{formData.name || "Your Chatbot"}"!
                </h3>
                <p className="text-gray-500">
                    Click the button below to create your chatbot. You'll be able to add more content and fine-tune settings afterwards.
                </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
                <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-gray-500">Name</dt>
                        <dd className="font-medium text-gray-900">{formData.name}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-500">Personality</dt>
                        <dd className="font-medium text-gray-900 capitalize">{formData.personality}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-500">Language</dt>
                        <dd className="font-medium text-gray-900">{formData.language === "en" ? "English" : formData.language}</dd>
                    </div>
                    {formData.websiteUrl && (
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Website</dt>
                            <dd className="font-medium text-gray-900 truncate max-w-[200px]">{formData.websiteUrl}</dd>
                        </div>
                    )}
                </dl>
            </div>
        </div>
    );
}
