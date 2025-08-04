import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { playHoverSound, playClickSound } from '../utils/soundSystem';
import {
  TreePine,
  Target,
  Award,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Play,
  CheckCircle2,
  Star,
  Brain,
  Rocket,
  Globe,
  Heart,
  Code,
  Palette,
  BarChart3,
  Lightbulb,
  Github,
  Twitter,
  Mail,
  ExternalLink
} from 'lucide-react';

const AboutPage = () => {
  const { soundEnabled, isAuthenticated } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Skill Trees',
      description: 'Our advanced AI analyzes career requirements and creates personalized learning paths with optimal skill progression.',
      color: 'text-purple-400'
    },
    {
      icon: Target,
      title: 'Goal-Oriented Learning',
      description: 'Every skill tree is designed with clear objectives, dependencies, and milestones to guide your learning journey.',
      color: 'text-blue-400'
    },
    {
      icon: Award,
      title: 'Gamified Experience',
      description: 'Unlock achievements, track streaks, and level up as you complete skills and reach new milestones.',
      color: 'text-yellow-400'
    },
    {
      icon: Users,
      title: 'Portfolio Integration',
      description: 'Showcase your completed skills and learning progress with shareable portfolios and certificates.',
      color: 'text-green-400'
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Detailed insights into your learning patterns, time investment, and skill development over time.',
      color: 'text-orange-400'
    },
    {
      icon: Globe,
      title: 'Community Driven',
      description: 'Connect with other learners, share resources, and contribute to the growing knowledge base.',
      color: 'text-cyan-400'
    }
  ];

  const teamMembers = [
    {
      name: 'Alex Chen',
      role: 'AI Engineer',
      avatar: '👨‍💻',
      description: 'Specializes in machine learning and skill tree generation algorithms.'
    },
    {
      name: 'Sarah Johnson',
      role: 'UX Designer',
      avatar: '👩‍🎨',
      description: 'Creates intuitive and engaging user experiences for complex learning systems.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Full-Stack Developer',
      avatar: '👨‍🔧',
      description: 'Builds scalable backend systems and responsive frontend interfaces.'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Learning Scientist',
      avatar: '👩‍🔬',
      description: 'Researches effective learning methodologies and skill acquisition patterns.'
    }
  ];

  const stats = [
    { label: 'Active Learners', value: '10,000+', icon: Users },
    { label: 'Skill Trees Created', value: '500+', icon: TreePine },
    { label: 'Skills Completed', value: '50,000+', icon: CheckCircle2 },
    { label: 'Success Rate', value: '95%', icon: Star }
  ];

  const faqs = [
    {
      question: 'How does the AI generate skill trees?',
      answer: 'Our AI analyzes job market data, industry requirements, and learning patterns to create optimized skill progression paths. It considers prerequisites, difficulty levels, and time commitments to build comprehensive learning roadmaps.'
    },
    {
      question: 'Can I customize my skill tree?',
      answer: 'Yes! While our AI creates the initial structure, you can modify priorities, add custom skills, and adjust timelines to match your specific goals and learning preferences.'
    },
    {
      question: 'How do you track skill completion?',
      answer: 'Skills can be marked as complete through various methods: self-assessment, project submissions, quiz completion, or integration with external learning platforms and certification providers.'
    },
    {
      question: 'Is Project Odysseus free to use?',
      answer: 'We offer a free tier with basic skill tree generation and progress tracking. Premium features include advanced analytics, portfolio tools, and priority support.'
    },
    {
      question: 'Can I share my progress with others?',
      answer: 'Absolutely! You can share your skill trees, progress, and achievements publicly or with specific individuals. This is great for showcasing your learning journey to employers or mentors.'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-12">
            {/* Mission Statement */}
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-light mb-6 font-orbitron">
                Our <span className="text-primary">Mission</span>
              </h2>
              <p className="text-xl text-light/80 leading-relaxed">
                To democratize skill development by making career progression as engaging and 
                structured as your favorite RPG. We believe everyone deserves a clear path to 
                mastery, regardless of their starting point or background.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="glass-card p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:transform hover:scale-105"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                >
                  <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                  <h3 className="text-xl font-semibold text-light mb-3">{feature.title}</h3>
                  <p className="text-light/70">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="glass-card p-6 border border-primary/20 hover:border-primary/40 transition-colors">
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-light mb-2">{stat.value}</div>
                    <div className="text-light/60">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-light mb-6 font-orbitron">
                Meet the <span className="text-primary">Team</span>
              </h2>
              <p className="text-xl text-light/80 max-w-3xl mx-auto">
                A diverse group of passionate individuals dedicated to revolutionizing 
                how people learn and grow in their careers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="glass-card p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:transform hover:scale-105 text-center"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                >
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <h3 className="text-xl font-semibold text-light mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-light/70 text-sm">{member.description}</p>
                </div>
              ))}
            </div>

            {/* Join Team CTA */}
            <div className="text-center">
              <div className="glass-card p-8 border border-primary/20 max-w-2xl mx-auto">
                <Heart className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-light mb-4">
                  Want to Join Our Mission?
                </h3>
                <p className="text-light/80 mb-6">
                  We're always looking for talented individuals who share our passion 
                  for education and technology.
                </p>
                <a
                  href="mailto:careers@projectodysseus.com"
                  className="btn-primary inline-flex items-center space-x-2"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                  onClick={() => soundEnabled && playClickSound()}
                >
                  <Mail className="w-5 h-5" />
                  <span>Get in Touch</span>
                </a>
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-light mb-6 font-orbitron">
                Frequently Asked <span className="text-primary">Questions</span>
              </h2>
              <p className="text-xl text-light/80 max-w-3xl mx-auto">
                Everything you need to know about Project Odysseus and how it works.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="glass-card border border-primary/20 hover:border-primary/40 transition-colors"
                >
                  <details className="group">
                    <summary className="p-6 cursor-pointer list-none flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-light group-open:text-primary transition-colors">
                        {faq.question}
                      </h3>
                      <div className="text-primary transform group-open:rotate-180 transition-transform">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-light/80 leading-relaxed">{faq.answer}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <TreePine className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold text-light font-orbitron">
              Project <span className="text-primary">Odysseus</span>
            </h1>
          </div>
          
          <p className="text-2xl text-light/80 max-w-4xl mx-auto leading-relaxed mb-8">
            Transforming career development through AI-powered skill trees, 
            gamified learning, and community-driven growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <Link
                to="/auth"
                className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
                onMouseEnter={() => soundEnabled && playHoverSound()}
                onClick={() => soundEnabled && playClickSound()}
              >
                <Shield className="w-5 h-5" />
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
                onMouseEnter={() => soundEnabled && playHoverSound()}
                onClick={() => soundEnabled && playClickSound()}
              >
                <TreePine className="w-5 h-5" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            
            <a
              href="#demo"
              className="btn-secondary text-lg px-8 py-3 flex items-center justify-center space-x-2"
              onMouseEnter={() => soundEnabled && playHoverSound()}
              onClick={() => soundEnabled && playClickSound()}
            >
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="glass-card p-2 border border-primary/20">
            <div className="flex space-x-2">
              {[
                { id: 'overview', label: 'Overview', icon: Lightbulb },
                { id: 'team', label: 'Team', icon: Users },
                { id: 'faq', label: 'FAQ', icon: Target }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (soundEnabled) playClickSound();
                  }}
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-primary text-dark font-semibold'
                      : 'text-light/70 hover:text-light hover:bg-primary/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Technology Stack */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-light mb-8 font-orbitron">
            Built with <span className="text-primary">Modern Tech</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'React', icon: '⚛️' },
              { name: 'Python', icon: '🐍' },
              { name: 'Firebase', icon: '🔥' },
              { name: 'FastAPI', icon: '⚡' },
              { name: 'Tailwind', icon: '🎨' },
              { name: 'OpenAI', icon: '🤖' }
            ].map((tech, index) => (
              <div 
                key={index}
                className="glass-card p-4 border border-primary/20 hover:border-primary/40 transition-colors text-center"
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                <div className="text-3xl mb-2">{tech.icon}</div>
                <div className="text-sm text-light/70">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Social */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-light mb-8 font-orbitron">
            Connect with <span className="text-primary">Us</span>
          </h2>
          
          <div className="flex justify-center space-x-6">
            <a
              href="https://github.com/projectodysseus"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-4 border border-primary/20 hover:border-primary/40 transition-colors"
              onMouseEnter={() => soundEnabled && playHoverSound()}
            >
              <Github className="w-6 h-6 text-light" />
            </a>
            
            <a
              href="https://twitter.com/projectodysseus"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-4 border border-primary/20 hover:border-primary/40 transition-colors"
              onMouseEnter={() => soundEnabled && playHoverSound()}
            >
              <Twitter className="w-6 h-6 text-light" />
            </a>
            
            <a
              href="mailto:hello@projectodysseus.com"
              className="glass-card p-4 border border-primary/20 hover:border-primary/40 transition-colors"
              onMouseEnter={() => soundEnabled && playHoverSound()}
            >
              <Mail className="w-6 h-6 text-light" />
            </a>
          </div>
          
          <p className="text-light/60 mt-6">
            Have questions or feedback? We'd love to hear from you!
          </p>
        </div>

        {/* Final CTA */}
        <div className="mt-20">
          <div className="glass-card p-12 border border-primary/20 text-center">
            <Rocket className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-light mb-4 font-orbitron">
              Ready to Level Up Your Career?
            </h2>
            <p className="text-xl text-light/80 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who have transformed their professional 
              journey with Project Odysseus.
            </p>
            
            {!isAuthenticated ? (
              <Link
                to="/auth"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
                onMouseEnter={() => soundEnabled && playHoverSound()}
                onClick={() => soundEnabled && playClickSound()}
              >
                <Shield className="w-5 h-5" />
                <span>Begin Your Odyssey</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
                onMouseEnter={() => soundEnabled && playHoverSound()}
                onClick={() => soundEnabled && playClickSound()}
              >
                <TreePine className="w-5 h-5" />
                <span>Continue Your Journey</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;