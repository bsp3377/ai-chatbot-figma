import Link from "next/link";
import {
  Bot,
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  Globe,
  ArrowRight,
  Check,
  Star,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Responses",
    description: "Train your chatbot on your content and let AI handle customer questions 24/7.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Go live in minutes. Just add your website URL and we'll train your chatbot automatically.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Automatically detect and respond in your visitor's language.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data stays yours. Enterprise-grade security and GDPR compliant.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Understand what your customers are asking and improve your content.",
  },
  {
    icon: MessageSquare,
    title: "Human Handoff",
    description: "Seamlessly escalate complex questions to your support team.",
  },
];

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for trying out",
    features: ["1 Chatbot", "50 messages/month", "Basic analytics"],
  },
  {
    name: "Starter",
    price: 29,
    description: "For small businesses",
    features: ["3 Chatbots", "2,000 messages/month", "Advanced analytics", "Email support"],
  },
  {
    name: "Pro",
    price: 99,
    popular: true,
    description: "For growing companies",
    features: ["10 Chatbots", "10,000 messages/month", "Priority support", "API access", "Custom branding"],
  },
  {
    name: "Business",
    price: 299,
    description: "Enterprise features",
    features: ["Unlimited Chatbots", "50,000 messages/month", "24/7 support", "SSO & SAML", "Dedicated manager"],
  },
];

const testimonials = [
  {
    quote: "ChatBot AI reduced our support tickets by 60%. It's like having a 24/7 support team.",
    author: "Sarah Chen",
    role: "Head of Support, TechCorp",
    avatar: "SC",
  },
  {
    quote: "Setup took literally 5 minutes. Our customers love getting instant answers.",
    author: "Mike Johnson",
    role: "Founder, StartupXYZ",
    avatar: "MJ",
  },
  {
    quote: "The analytics helped us understand what customers really want. Game changer.",
    author: "Emily Brown",
    role: "Product Manager, SaaSCo",
    avatar: "EB",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ChatBot AI</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#testimonials" className="text-sm text-gray-600 hover:text-gray-900">Testimonials</a>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            🎉 Now with GPT-4 support
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight">
            AI Chatbots That
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Actually Work</span>
          </h1>

          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Train an AI chatbot on your website content in minutes.
            Answer customer questions 24/7 with zero code required.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="text-lg px-8 h-14">
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 h-14">
              <Link href="#demo">
                Watch Demo
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            No credit card required · Free forever plan available
          </p>
        </div>

        {/* Hero Image/Demo */}
        <div className="mt-16 max-w-5xl mx-auto relative">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-1">
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-gray-400 text-sm">chatbotai.com/dashboard</span>
              </div>
              <div className="p-8 text-center">
                <div className="bg-gray-700/50 rounded-xl p-8 max-w-md mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Support Bot</p>
                      <p className="text-gray-400 text-sm">Online</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-bl-none px-4 py-2 text-left max-w-[80%]">
                      Hi! How can I help you today?
                    </div>
                    <div className="bg-gray-600 text-white rounded-2xl rounded-br-none px-4 py-2 text-right ml-auto max-w-[80%]">
                      What are your pricing plans?
                    </div>
                    <div className="bg-blue-600 text-white rounded-2xl rounded-bl-none px-4 py-2 text-left max-w-[80%]">
                      We offer 4 plans starting from free! Our Starter plan is $29/month with 2,000 messages...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything you need for AI support
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Powerful features to automate your customer support
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Start free and scale as you grow
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? 'border-blue-500 border-2 shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/mo</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Loved by teams worldwide
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              See what our customers are saying
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Ready to transform your support?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join thousands of companies using ChatBot AI to deliver instant, accurate support.
          </p>
          <div className="mt-10">
            <Button size="lg" asChild className="text-lg px-8 h-14">
              <Link href="/signup">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ChatBot AI</span>
              </div>
              <p className="text-sm">
                AI-powered customer support that actually works.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © {new Date().getFullYear()} ChatBot AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
