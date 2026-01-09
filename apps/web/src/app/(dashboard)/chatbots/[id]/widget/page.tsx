"use client";

import { useState } from "react";
import { Copy, Check, Code, Paintbrush } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ChatbotWidgetPage() {
    const [copied, setCopied] = useState(false);
    const [config, setConfig] = useState({
        color: "#3B82F6",
        position: "bottom-right",
        buttonText: "Chat with us",
    });

    const widgetCode = `<!-- ChatBot AI Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['ChatBotAI']=o;w[o]=w[o]||function(){
    (w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','cba','https://widget.chatbotai.com/loader.js'));
  cba('init', {
    chatbotId: 'pub_support123',
    color: '${config.color}',
    position: '${config.position}',
    buttonText: '${config.buttonText}'
  });
</script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(widgetCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const colors = [
        "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#000000"
    ];

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Code Section */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Installation</CardTitle>
                        <CardDescription>
                            Add this code to your website before the closing &lt;/body&gt; tag
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                <code>{widgetCode}</code>
                            </pre>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-2 right-2"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 mr-1" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-1" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customize</CardTitle>
                        <CardDescription>Adjust the widget appearance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex gap-2">
                                {colors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setConfig({ ...config, color: c })}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform ${config.color === c ? "border-gray-900 scale-110" : "border-transparent"
                                            }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Position</Label>
                            <Select
                                value={config.position}
                                onValueChange={(v) => setConfig({ ...config, position: v })}
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
                            <Label>Button Text</Label>
                            <Input
                                value={config.buttonText}
                                onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Section */}
            <div>
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>Live preview of your widget</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative bg-gray-100 rounded-lg h-[400px] overflow-hidden">
                            {/* Mock website */}
                            <div className="absolute inset-0 p-4">
                                <div className="h-4 w-32 bg-gray-300 rounded mb-4" />
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-gray-200 rounded" />
                                    <div className="h-3 w-3/4 bg-gray-200 rounded" />
                                    <div className="h-3 w-5/6 bg-gray-200 rounded" />
                                </div>
                            </div>

                            {/* Widget button */}
                            <div
                                className={`absolute bottom-4 ${config.position === "bottom-right" ? "right-4" : "left-4"
                                    }`}
                            >
                                <button
                                    className="px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: config.color }}
                                >
                                    {config.buttonText}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-1">Integration Tips</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Place the code just before &lt;/body&gt;</li>
                                <li>• Works with any website or CMS</li>
                                <li>• No jQuery or other dependencies needed</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
