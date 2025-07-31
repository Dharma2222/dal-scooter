// src/pages/LandingPage.jsx

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Zap, 
  Shield, 
  Clock, 
  MapPin, 
  Smartphone,
  Users,
  Award,
  ArrowRight,
  Play,
  CheckCircle,
  Globe,
  Battery,
  Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchFeedbackSummary } from '../api/gatewayClient'; 

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    avgRating: 0,
    positivePercent: 0,
    negativePercent: 0,
  });

  useEffect(() => {
    fetchFeedbackSummary().then(setStats).catch(err => console.error('summary error', err));
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Instant Access",
      description: "Unlock any scooter with a simple scan. No waiting, no hassle - just hop on and go."
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Premium safety features and 24/7 support ensure your ride is always protected."
    },
    {
      icon: MapPin,
      title: "City-Wide Coverage",
      description: "Find scooters everywhere you need them across the city with our extensive network."
    }
  ];

  const benefits = [
    "No subscription fees",
    "Pay per ride",
    "24/7 availability",
    "GPS tracking",
    "Mobile app control",
    "Eco-friendly transport"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="text-blue-600" size={32} />
              <span className="text-2xl font-bold text-gray-900">DALScooter</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#reviews" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
              <a href="/auth/login" className="text-gray-600 hover:text-gray-900 transition-colors">Sign In</a>
              <a href="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div className="mb-12 lg:mb-0">
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <Zap size={14} className="mr-1" />
                  Now Available in Halifax
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                The Future of
                <span className="block text-blue-600">Urban Mobility</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Experience seamless scooter sharing powered by cutting-edge serverless technology. 
                Rent, ride, and return with just a few taps.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a 
                  href="/auth/register" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Start Riding Today
                  <ArrowRight size={16} className="ml-2" />
                </a>
                <a 
                  href="/auth/login" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Play size={16} className="mr-2" />
                  Book a Ride
                </a>
              </div>

              <div className="flex items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Instant unlock</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-blue-50 rounded-2xl p-8">
                <img 
                  src="/hero-scooter.png" 
                  alt="DALScooter Electric Scooter" 
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
                
                {/* Floating Stats Cards */}
                <div className="absolute -top-4 -left-4 bg-white p-4 rounded-lg shadow-lg border">
                  <div className="flex items-center gap-2">
                    <Battery className="text-green-500" size={20} />
                    <div>
                      <div className="text-sm font-semibold">85% Battery</div>
                      <div className="text-xs text-gray-500">25km range</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg border">
                  <div className="flex items-center gap-2">
                    <Navigation className="text-blue-500" size={20} />
                    <div>
                      <div className="text-sm font-semibold">GPS Enabled</div>
                      <div className="text-xs text-gray-500">Real-time tracking</div>
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
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose DALScooter?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with advanced technology and designed for the modern commuter. 
              Experience the difference of our premium scooter sharing platform.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Benefits Grid */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Everything You Need</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
            <p className="text-xl text-gray-600">
              See what our community of riders has to say about their DALScooter experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Average Rating Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={28}
                      fill={i < Math.round(stats.avgRating) ? '#f59e0b' : 'none'}
                      stroke="#f59e0b"
                      className="mx-1"
                    />
                  ))}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats.avgRating.toFixed(1)} / 5.0
                </div>
                <div className="text-gray-600 font-medium">Average Rating</div>
                <div className="text-sm text-gray-500 mt-2">Based on customer feedback</div>
              </div>
            </div>

            {/* Sentiment Analysis Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="text-center">
                <div className="flex justify-center items-center gap-8 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <ThumbsUp size={24} className="text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.positivePercent}%</div>
                      <div className="text-sm text-gray-500">Positive</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <ThumbsDown size={24} className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{stats.negativePercent}%</div>
                      <div className="text-sm text-gray-500">Negative</div>
                    </div>
                  </div>
                </div>
                <div className="text-gray-600 font-medium">Customer Sentiment</div>
                <div className="text-sm text-gray-500 mt-2">Real-time feedback analysis</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/feedback')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Users size={20} />
              View All Customer Reviews
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Award className="mx-auto mb-6 text-white" size={48} />
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Commute?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied riders who have discovered the convenience, 
            sustainability, and joy of DALScooter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/auth/register" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <Smartphone size={20} className="mr-2" />
              Download App & Start
            </a>
            <a 
              href="/auth/login" 
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors border-2 border-blue-500"
            >
              Sign In to Ride
              <ArrowRight size={16} className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-blue-500" size={32} />
                <span className="text-2xl font-bold text-white">DALScooter</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Revolutionizing urban transportation with smart, sustainable, and accessible scooter sharing solutions.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Globe size={16} className="text-blue-500" />
                <span>Available in Halifax, Nova Scotia</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 DALScooter. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Clock size={16} className="text-gray-500" />
              <span className="text-sm text-gray-400">24/7 Customer Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}