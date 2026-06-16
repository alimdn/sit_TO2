#!/usr/bin/env python3
"""Generate a high-quality EduMentor course platform template HTML."""

template_html = '''<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>EduMentor — Online Course Platform</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<script>
tailwind.config = {
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { 50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#6366f1',600:'#4f46e5',700:'#4338ca',800:'#3730a3',900:'#312e81' },
        accent: { 400:'#fb923c',500:'#f97316',600:'#ea580c' },
        surface: { 50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617' }
      }
    }
  }
}
</script>
<style>
* { font-family: 'Inter', system-ui, sans-serif; }
html { scroll-behavior: smooth; }
.no-scroll { overflow: hidden; }
.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 70% { box-shadow: 0 0 0 12px rgba(99,102,241,0); } }
.animate-slide-up { animation: slideUp 0.5s ease-out; }
.pulse-glow { animation: pulse-glow 2s infinite; }
.tab-active { border-bottom: 2px solid #4f46e5; color: #4f46e5; font-weight: 600; }
.accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.35s ease-out; }
.accordion-content.open { max-height: 600px; }
.star-filled { color: #f59e0b; }
.star-empty { color: #d1d5db; }
.progress-ring { transition: stroke-dashoffset 0.6s ease; }
.quiz-option { transition: all 0.2s; cursor: pointer; }
.quiz-option:hover { border-color: #6366f1; background: #eef2ff; }
.quiz-option.selected { border-color: #4f46e5; background: #e0e7ff; }
.quiz-option.correct { border-color: #10b981; background: #ecfdf5; }
.quiz-option.wrong { border-color: #ef4444; background: #fef2f2; }
.video-overlay { background: linear-gradient(135deg, rgba(79,70,229,0.9), rgba(37,99,235,0.9)); }
.card-hover { transition: all 0.3s; }
.card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
.nav-link { position: relative; }
.nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:#4f46e5; transition: width 0.3s; }
.nav-link:hover::after, .nav-link.active::after { width: 100%; }
.toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; padding: 16px 24px; border-radius: 12px; color: white; font-weight: 500; box-shadow: 0 8px 32px rgba(0,0,0,0.2); animation: slideUp 0.3s ease-out; }
.toast-success { background: linear-gradient(135deg, #10b981, #059669); }
.toast-info { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.toast-warning { background: linear-gradient(135deg, #f97316, #ea580c); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal-content { background: white; border-radius: 16px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease-out; }
</style>
</head>
<body class="bg-white text-surface-900 antialiased">

<!-- Toast Container -->
<div id="toast-container"></div>

<!-- Navigation -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200/60">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
        </div>
        <span class="text-xl font-bold text-surface-900">Edu<span class="text-brand-600">Mentor</span></span>
      </div>
      <div class="hidden md:flex items-center gap-8">
        <a href="#courses" class="nav-link text-sm font-medium text-surface-700 hover:text-brand-600 transition-colors cursor-pointer">Courses</a>
        <a href="#features" class="nav-link text-sm font-medium text-surface-700 hover:text-brand-600 transition-colors cursor-pointer">Features</a>
        <a href="#instructors" class="nav-link text-sm font-medium text-surface-700 hover:text-brand-600 transition-colors cursor-pointer">Instructors</a>
        <a href="#pricing" class="nav-link text-sm font-medium text-surface-700 hover:text-brand-600 transition-colors cursor-pointer">Pricing</a>
        <a href="#testimonials" class="nav-link text-sm font-medium text-surface-700 hover:text-brand-600 transition-colors cursor-pointer">Reviews</a>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="showToast('Sign In feature coming soon!', 'info')" class="text-sm font-medium text-surface-700 hover:text-brand-600 transition-colors cursor-pointer">Sign In</button>
        <button onclick="showToast('Welcome! Registration coming soon.', 'success')" class="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 cursor-pointer">Get Started</button>
      </div>
    </div>
  </div>
</nav>

<!-- Hero Section -->
<section class="relative pt-16 overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-50/30"></div>
  <div class="absolute top-20 right-0 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl"></div>
  <div class="absolute bottom-0 left-0 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl"></div>
  
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <div class="animate-slide-up">
        <div class="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          #1 Online Learning Platform
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-surface-950 leading-tight mb-6">
          Master New Skills<br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">At Your Own Pace</span>
        </h1>
        <p class="text-lg text-surface-700 leading-relaxed mb-8 max-w-lg">
          Join over 50,000 learners worldwide. Access 2,000+ expert-led courses in development, design, business, and more. Start learning today.
        </p>
        <div class="flex flex-wrap gap-4 mb-10">
          <button onclick="showToast('Exploring courses...', 'info')" class="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:shadow-xl hover:shadow-brand-500/25 cursor-pointer flex items-center gap-2">
            Explore Courses
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </button>
          <button onclick="playHeroVideo()" class="flex items-center gap-3 text-surface-700 hover:text-brand-600 transition-colors cursor-pointer group">
            <div class="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow">
              <svg class="w-5 h-5 text-brand-600 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
            </div>
            <span class="font-semibold">Watch Demo</span>
          </button>
        </div>
        <div class="flex items-center gap-8 text-sm text-surface-600">
          <div class="flex items-center gap-2">
            <div class="flex -space-x-2">
              <div class="w-8 h-8 rounded-full bg-brand-200 border-2 border-white flex items-center justify-center text-xs font-bold text-brand-700">A</div>
              <div class="w-8 h-8 rounded-full bg-accent-200 border-2 border-white flex items-center justify-center text-xs font-bold text-accent-700">M</div>
              <div class="w-8 h-8 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-xs font-bold text-emerald-700">S</div>
              <div class="w-8 h-8 rounded-full bg-surface-200 border-2 border-white flex items-center justify-center text-xs font-bold text-surface-600">+</div>
            </div>
            <span><strong class="text-surface-900">50K+</strong> Students</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="star-filled text-lg">&#9733;</span>
            <span><strong class="text-surface-900">4.9</strong> Rating</span>
          </div>
          <div><strong class="text-surface-900">2K+</strong> Courses</div>
        </div>
      </div>
      
      <!-- Hero Visual -->
      <div class="relative animate-slide-up" style="animation-delay:0.2s">
        <div class="relative bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-1">
          <div class="bg-white rounded-xl overflow-hidden">
            <!-- Video Player Mockup -->
            <div id="hero-video" class="relative aspect-video bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center cursor-pointer" onclick="playHeroVideo()">
              <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJWMGgydjM0em0tNCAwSDE4VjBoMnYzNHptMTIgMEgzMFYwaDJ2MzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
              <div class="video-overlay absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto hover:bg-white/30 transition-all">
                    <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                  </div>
                  <p class="text-white/90 font-medium text-sm">Preview Course</p>
                </div>
              </div>
              <!-- Player Controls -->
              <div class="absolute bottom-0 left-0 right-0 bg-surface-900/80 backdrop-blur-sm px-4 py-2.5">
                <div class="flex items-center gap-3">
                  <div class="w-full bg-surface-700 rounded-full h-1.5">
                    <div class="bg-brand-400 h-1.5 rounded-full" style="width:35%"></div>
                  </div>
                  <span class="text-white/70 text-xs font-mono whitespace-nowrap">3:24 / 10:15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Floating Stats Cards -->
        <div class="absolute -left-4 top-8 bg-white rounded-xl shadow-xl p-3 animate-slide-up" style="animation-delay:0.5s">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
            <div>
              <p class="text-xs text-surface-500">Completion</p>
              <p class="text-sm font-bold text-surface-900">87%</p>
            </div>
          </div>
        </div>
        <div class="absolute -right-4 bottom-12 bg-white rounded-xl shadow-xl p-3 animate-slide-up" style="animation-delay:0.7s">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <div>
              <p class="text-xs text-surface-500">Active Courses</p>
              <p class="text-sm font-bold text-surface-900">12</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Trusted By -->
<section class="py-12 border-y border-surface-200/60 bg-surface-50/50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <p class="text-center text-sm text-surface-500 mb-8 font-medium">TRUSTED BY LEADING COMPANIES</p>
    <div class="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40">
      <span class="text-2xl font-bold text-surface-400">Google</span>
      <span class="text-2xl font-bold text-surface-400">Microsoft</span>
      <span class="text-2xl font-bold text-surface-400">Amazon</span>
      <span class="text-2xl font-bold text-surface-400">Meta</span>
      <span class="text-2xl font-bold text-surface-400">Apple</span>
      <span class="text-2xl font-bold text-surface-400">Netflix</span>
    </div>
  </div>
</section>

<!-- Featured Courses -->
<section id="courses" class="py-20 lg:py-28">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-14">
      <span class="inline-block bg-brand-100 text-brand-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">Popular Courses</span>
      <h2 class="text-3xl sm:text-4xl font-bold text-surface-950 mb-4">Expand Your Knowledge</h2>
      <p class="text-surface-600 max-w-2xl mx-auto">Choose from our most popular courses curated by industry experts. Learn at your own pace with lifetime access.</p>
    </div>
    
    <!-- Category Tabs -->
    <div class="flex flex-wrap justify-center gap-2 mb-10">
      <button onclick="filterCourses('all', this)" class="course-tab px-5 py-2 rounded-full text-sm font-medium bg-brand-600 text-white transition-all cursor-pointer">All</button>
      <button onclick="filterCourses('development', this)" class="course-tab px-5 py-2 rounded-full text-sm font-medium bg-surface-100 text-surface-600 hover:bg-surface-200 transition-all cursor-pointer">Development</button>
      <button onclick="filterCourses('design', this)" class="course-tab px-5 py-2 rounded-full text-sm font-medium bg-surface-100 text-surface-600 hover:bg-surface-200 transition-all cursor-pointer">Design</button>
      <button onclick="filterCourses('business', this)" class="course-tab px-5 py-2 rounded-full text-sm font-medium bg-surface-100 text-surface-600 hover:bg-surface-200 transition-all cursor-pointer">Business</button>
      <button onclick="filterCourses('marketing', this)" class="course-tab px-5 py-2 rounded-full text-sm font-medium bg-surface-100 text-surface-600 hover:bg-surface-200 transition-all cursor-pointer">Marketing</button>
    </div>
    
    <!-- Course Cards Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" id="courses-grid">
      
      <!-- Course 1 -->
      <div class="course-card card-hover bg-white rounded-2xl border border-surface-200/80 overflow-hidden cursor-pointer" data-category="development" onclick="openCourseModal('Full-Stack Web Development')">
        <div class="relative">
          <div class="aspect-video bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <svg class="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
          </div>
          <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-600 text-xs font-bold px-2.5 py-1 rounded-lg">Bestseller</div>
          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-surface-600 text-xs font-medium px-2.5 py-1 rounded-lg">$49.99</div>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">Development</span>
            <span class="text-xs text-surface-400">42 hours</span>
          </div>
          <h3 class="font-bold text-surface-900 mb-2">Full-Stack Web Development Bootcamp</h3>
          <p class="text-sm text-surface-600 mb-4 line-clamp-2">Master React, Node.js, MongoDB and more. Build real-world projects from scratch.</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <div class="w-6 h-6 rounded-full bg-brand-200 flex items-center justify-center text-xs font-bold text-brand-700">J</div>
              <span class="text-xs text-surface-500">James Wilson</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="star-filled text-sm">&#9733;</span>
              <span class="text-xs font-semibold text-surface-700">4.9</span>
              <span class="text-xs text-surface-400">(2.4k)</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Course 2 -->
      <div class="course-card card-hover bg-white rounded-2xl border border-surface-200/80 overflow-hidden cursor-pointer" data-category="design" onclick="openCourseModal('UI/UX Design Masterclass')">
        <div class="relative">
          <div class="aspect-video bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center">
            <svg class="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
          </div>
          <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-rose-600 text-xs font-bold px-2.5 py-1 rounded-lg">New</div>
          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-surface-600 text-xs font-medium px-2.5 py-1 rounded-lg">$39.99</div>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Design</span>
            <span class="text-xs text-surface-400">28 hours</span>
          </div>
          <h3 class="font-bold text-surface-900 mb-2">UI/UX Design Masterclass 2024</h3>
          <p class="text-sm text-surface-600 mb-4 line-clamp-2">Learn Figma, design systems, and user research. Create stunning interfaces.</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <div class="w-6 h-6 rounded-full bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-700">S</div>
              <span class="text-xs text-surface-500">Sarah Chen</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="star-filled text-sm">&#9733;</span>
              <span class="text-xs font-semibold text-surface-700">4.8</span>
              <span class="text-xs text-surface-400">(1.8k)</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Course 3 -->
      <div class="course-card card-hover bg-white rounded-2xl border border-surface-200/80 overflow-hidden cursor-pointer" data-category="business" onclick="openCourseModal('Digital Marketing Strategy')">
        <div class="relative">
          <div class="aspect-video bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
            <svg class="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          </div>
          <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-amber-600 text-xs font-bold px-2.5 py-1 rounded-lg">Trending</div>
          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-surface-600 text-xs font-medium px-2.5 py-1 rounded-lg">$34.99</div>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Business</span>
            <span class="text-xs text-surface-400">18 hours</span>
          </div>
          <h3 class="font-bold text-surface-900 mb-2">Digital Marketing Strategy A-Z</h3>
          <p class="text-sm text-surface-600 mb-4 line-clamp-2">SEO, social media, email marketing, and paid ads. Grow any business online.</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <div class="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-700">M</div>
              <span class="text-xs text-surface-500">Mike Roberts</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="star-filled text-sm">&#9733;</span>
              <span class="text-xs font-semibold text-surface-700">4.7</span>
              <span class="text-xs text-surface-400">(3.1k)</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Course 4 -->
      <div class="course-card card-hover bg-white rounded-2xl border border-surface-200/80 overflow-hidden cursor-pointer" data-category="development" onclick="openCourseModal('Python for Data Science')">
        <div class="relative">
          <div class="aspect-video bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <svg class="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-surface-600 text-xs font-medium px-2.5 py-1 rounded-lg">$44.99</div>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Data Science</span>
            <span class="text-xs text-surface-400">36 hours</span>
          </div>
          <h3 class="font-bold text-surface-900 mb-2">Python for Data Science & ML</h3>
          <p class="text-sm text-surface-600 mb-4 line-clamp-2">Python, Pandas, NumPy, Scikit-learn, and TensorFlow. From zero to hero.</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <div class="w-6 h-6 rounded-full bg-teal-200 flex items-center justify-center text-xs font-bold text-teal-700">A</div>
              <span class="text-xs text-surface-500">Ana Garcia</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="star-filled text-sm">&#9733;</span>
              <span class="text-xs font-semibold text-surface-700">4.9</span>
              <span class="text-xs text-surface-400">(5.2k)</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Course 5 -->
      <div class="course-card card-hover bg-white rounded-2xl border border-surface-200/80 overflow-hidden cursor-pointer" data-category="marketing" onclick="openCourseModal('Social Media Marketing')">
        <div class="relative">
          <div class="aspect-video bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
            <svg class="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>
          </div>
          <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-violet-600 text-xs font-bold px-2.5 py-1 rounded-lg">Hot</div>
          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-surface-600 text-xs font-medium px-2.5 py-1 rounded-lg">$29.99</div>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded">Marketing</span>
            <span class="text-xs text-surface-400">22 hours</span>
          </div>
          <h3 class="font-bold text-surface-900 mb-2">Social Media Marketing Complete</h3>
          <p class="text-sm text-surface-600 mb-4 line-clamp-2">Instagram, TikTok, YouTube, LinkedIn strategies that actually work.</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <div class="w-6 h-6 rounded-full bg-violet-200 flex items-center justify-center text-xs font-bold text-violet-700">L</div>
              <span class="text-xs text-surface-500">Lisa Park</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="star-filled text-sm">&#9733;</span>
              <span class="text-xs font-semibold text-surface-700">4.6</span>
              <span class="text-xs text-surface-400">(1.5k)</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Course 6 -->
      <div class="course-card card-hover bg-white rounded-2xl border border-surface-200/80 overflow-hidden cursor-pointer" data-category="design" onclick="openCourseModal('Motion Graphics & Animation')">
        <div class="relative">
          <div class="aspect-video bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <svg class="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-surface-600 text-xs font-medium px-2.5 py-1 rounded-lg">$54.99</div>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-medium text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">Animation</span>
            <span class="text-xs text-surface-400">32 hours</span>
          </div>
          <h3 class="font-bold text-surface-900 mb-2">Motion Graphics & After Effects</h3>
          <p class="text-sm text-surface-600 mb-4 line-clamp-2">Create stunning motion graphics, animations, and visual effects.</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <div class="w-6 h-6 rounded-full bg-cyan-200 flex items-center justify-center text-xs font-bold text-cyan-700">D</div>
              <span class="text-xs text-surface-500">David Kim</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="star-filled text-sm">&#9733;</span>
              <span class="text-xs font-semibold text-surface-700">4.8</span>
              <span class="text-xs text-surface-400">(980)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="text-center mt-10">
      <button onclick="showToast('Loading more courses...', 'info')" class="bg-surface-100 hover:bg-surface-200 text-surface-700 px-8 py-3 rounded-xl font-semibold transition-all cursor-pointer">
        View All Courses
        <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
      </button>
    </div>
  </div>
</section>

<!-- Interactive Course Detail (Collapsible Section) -->
<section class="py-16 bg-surface-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid lg:grid-cols-5 gap-8">
      <!-- Left: Course Content -->
      <div class="lg:col-span-3">
        <h2 class="text-2xl font-bold text-surface-950 mb-2">Full-Stack Web Development Bootcamp</h2>
        <p class="text-surface-600 mb-6">Master modern web development with hands-on projects and expert instruction.</p>
        
        <!-- Tabs -->
        <div class="flex border-b border-surface-200 mb-6">
          <button onclick="switchTab('curriculum', this)" class="tab-btn tab-active px-4 py-3 text-sm font-medium cursor-pointer">Curriculum</button>
          <button onclick="switchTab('overview', this)" class="tab-btn px-4 py-3 text-sm font-medium text-surface-500 cursor-pointer">Overview</button>
          <button onclick="switchTab('reviews', this)" class="tab-btn px-4 py-3 text-sm font-medium text-surface-500 cursor-pointer">Reviews</button>
        </div>
        
        <!-- Curriculum Tab -->
        <div id="tab-curriculum" class="tab-content">
          <div class="space-y-3">
            <!-- Module 1 -->
            <div class="border border-surface-200 rounded-xl overflow-hidden">
              <button onclick="toggleAccordion(this)" class="w-full flex items-center justify-between p-4 hover:bg-surface-50 transition-colors cursor-pointer">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center text-sm font-bold">1</div>
                  <div class="text-left">
                    <h4 class="font-semibold text-surface-900">HTML, CSS & JavaScript Foundations</h4>
                    <p class="text-xs text-surface-500">8 lessons &middot; 4h 30m</p>
                  </div>
                </div>
                <svg class="w-5 h-5 text-surface-400 accordion-icon transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <div class="accordion-content">
                <div class="px-4 pb-4 space-y-2">
                  <div class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 cursor-pointer" onclick="showToast('Playing: Welcome to the Course', 'info')">
                    <svg class="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                    <span class="text-sm text-surface-700">Welcome to the Course</span>
                    <span class="text-xs text-surface-400 ml-auto">5:30</span>
                  </div>
                  <div class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 cursor-pointer" onclick="showToast('Playing: HTML Structure & Semantics', 'info')">
                    <svg class="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                    <span class="text-sm text-surface-700">HTML Structure & Semantics</span>
                    <span class="text-xs text-surface-400 ml-auto">12:45</span>
                  </div>
                  <div class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 cursor-pointer" onclick="showToast('Playing: CSS Flexbox & Grid', 'info')">
                    <svg class="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                    <span class="text-sm text-surface-700">CSS Flexbox & Grid</span>
                    <span class="text-xs text-surface-400 ml-auto">18:20</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Module 2 -->
            <div class="border border-surface-200 rounded-xl overflow-hidden">
              <button onclick="toggleAccordion(this)" class="w-full flex items-center justify-between p-4 hover:bg-surface-50 transition-colors cursor-pointer">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center text-sm font-bold">2</div>
                  <div class="text-left">
                    <h4 class="font-semibold text-surface-900">React & Modern Frontend</h4>
                    <p class="text-xs text-surface-500">10 lessons &middot; 6h 15m</p>
                  </div>
                </div>
                <svg class="w-5 h-5 text-surface-400 accordion-icon transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <div class="accordion-content">
                <div class="px-4 pb-4 space-y-2">
                  <div class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 cursor-pointer" onclick="showToast('Playing: React Components & JSX', 'info')">
                    <svg class="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                    <span class="text-sm text-surface-700">React Components & JSX</span>
                    <span class="text-xs text-surface-400 ml-auto">15:00</span>
                  </div>
                  <div class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 cursor-pointer" onclick="showToast('Playing: State Management with Hooks', 'info')">
                    <svg class="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                    <span class="text-sm text-surface-700">State Management with Hooks</span>
                    <span class="text-xs text-surface-400 ml-auto">22:30</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Module 3 -->
            <div class="border border-surface-200 rounded-xl overflow-hidden">
              <button onclick="toggleAccordion(this)" class="w-full flex items-center justify-between p-4 hover:bg-surface-50 transition-colors cursor-pointer">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center text-sm font-bold">3</div>
                  <div class="text-left">
                    <h4 class="font-semibold text-surface-900">Node.js & Backend APIs</h4>
                    <p class="text-xs text-surface-500">12 lessons &middot; 8h 45m</p>
                  </div>
                </div>
                <svg class="w-5 h-5 text-surface-400 accordion-icon transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <div class="accordion-content">
                <div class="px-4 pb-4 space-y-2">
                  <div class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 cursor-pointer" onclick="showToast('Playing: Node.js Fundamentals', 'info')">
                    <svg class="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                    <span class="text-sm text-surface-700">Node.js Fundamentals</span>
                    <span class="text-xs text-surface-400 ml-auto">20:00</span>
                  </div>
                  <div class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 cursor-pointer" onclick="showToast('Playing: REST API Design', 'info')">
                    <svg class="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                    <span class="text-sm text-surface-700">REST API Design</span>
                    <span class="text-xs text-surface-400 ml-auto">25:15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Overview Tab (hidden by default) -->
        <div id="tab-overview" class="tab-content hidden">
          <div class="prose prose-surface max-w-none">
            <h4 class="text-lg font-semibold text-surface-900 mb-3">What you'll learn</h4>
            <div class="grid sm:grid-cols-2 gap-3 mb-6">
              <div class="flex items-start gap-2"><svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span class="text-sm text-surface-700">Build full-stack web applications from scratch</span></div>
              <div class="flex items-start gap-2"><svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span class="text-sm text-surface-700">Master React, Node.js, and MongoDB</span></div>
              <div class="flex items-start gap-2"><svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span class="text-sm text-surface-700">Implement authentication and authorization</span></div>
              <div class="flex items-start gap-2"><svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span class="text-sm text-surface-700">Deploy applications to cloud platforms</span></div>
              <div class="flex items-start gap-2"><svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span class="text-sm text-surface-700">Write clean, maintainable code</span></div>
              <div class="flex items-start gap-2"><svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span class="text-sm text-surface-700">Build responsive, mobile-first designs</span></div>
            </div>
            <h4 class="text-lg font-semibold text-surface-900 mb-3">Requirements</h4>
            <ul class="list-disc pl-5 space-y-1 text-sm text-surface-700 mb-6">
              <li>No prior programming experience needed</li>
              <li>A computer with internet access</li>
              <li>Willingness to learn and practice</li>
            </ul>
          </div>
        </div>
        
        <!-- Reviews Tab (hidden by default) -->
        <div id="tab-reviews" class="tab-content hidden">
          <div class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-white rounded-xl border border-surface-200">
              <div class="w-10 h-10 rounded-full bg-brand-200 flex items-center justify-center font-bold text-brand-700">E</div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-sm text-surface-900">Emily Johnson</span>
                  <div class="flex text-amber-400 text-xs">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                </div>
                <p class="text-sm text-surface-600">Best web development course I have ever taken. The projects are incredibly practical and the instructor explains everything clearly.</p>
              </div>
            </div>
            <div class="flex items-center gap-4 p-4 bg-white rounded-xl border border-surface-200">
              <div class="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center font-bold text-emerald-700">R</div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-sm text-surface-900">Raj Patel</span>
                  <div class="flex text-amber-400 text-xs">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                </div>
                <p class="text-sm text-surface-600">I went from zero coding knowledge to building my own full-stack app. This course changed my career trajectory completely.</p>
              </div>
            </div>
            <div class="flex items-center gap-4 p-4 bg-white rounded-xl border border-surface-200">
              <div class="w-10 h-10 rounded-full bg-accent-200 flex items-center justify-center font-bold text-accent-700">K</div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-sm text-surface-900">Kate Williams</span>
                  <div class="flex text-amber-400 text-xs">&#9733;&#9733;&#9733;&#9733;<span class="text-surface-300">&#9733;</span></div>
                </div>
                <p class="text-sm text-surface-600">Comprehensive and well-structured. The only reason for 4 stars is I wish there were more advanced topics covered.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Sidebar: Quiz & Progress -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Mini Quiz -->
        <div class="bg-white rounded-2xl border border-surface-200 p-6">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="font-bold text-surface-900">Quick Quiz</h3>
            <span class="text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full ml-auto">Module 1</span>
          </div>
          <p class="text-sm text-surface-700 mb-4">What does CSS stand for?</p>
          <div class="space-y-2" id="quiz-options">
            <div class="quiz-option border border-surface-200 rounded-lg p-3 text-sm text-surface-700" onclick="selectQuiz(this, true)">Creative Style Sheets</div>
            <div class="quiz-option border border-surface-200 rounded-lg p-3 text-sm text-surface-700" onclick="selectQuiz(this, false)">Computer Style Sheets</div>
            <div class="quiz-option border border-surface-200 rounded-lg p-3 text-sm text-surface-700" onclick="selectQuiz(this, false)">Cascading Style Sheets</div>
            <div class="quiz-option border border-surface-200 rounded-lg p-3 text-sm text-surface-700" onclick="selectQuiz(this, false)">Colorful Style Sheets</div>
          </div>
          <div id="quiz-result" class="mt-3 text-sm font-medium hidden"></div>
        </div>
        
        <!-- Progress Tracker -->
        <div class="bg-white rounded-2xl border border-surface-200 p-6">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
            <h3 class="font-bold text-surface-900">Your Progress</h3>
          </div>
          <div class="flex items-center justify-center mb-4">
            <svg class="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" stroke="#e2e8f0" stroke-width="8" fill="none"/>
              <circle cx="60" cy="60" r="52" stroke="#6366f1" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="326.73" stroke-dashoffset="42.47" class="progress-ring"/>
            </svg>
            <div class="absolute text-center">
              <span class="text-3xl font-bold text-surface-900">87%</span>
              <p class="text-xs text-surface-500">Complete</p>
            </div>
          </div>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-xs mb-1"><span class="text-surface-600">HTML & CSS</span><span class="font-medium text-surface-900">100%</span></div>
              <div class="w-full bg-surface-200 rounded-full h-2"><div class="bg-emerald-500 h-2 rounded-full" style="width:100%"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1"><span class="text-surface-600">JavaScript</span><span class="font-medium text-surface-900">85%</span></div>
              <div class="w-full bg-surface-200 rounded-full h-2"><div class="bg-brand-500 h-2 rounded-full" style="width:85%"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1"><span class="text-surface-600">React</span><span class="font-medium text-surface-900">72%</span></div>
              <div class="w-full bg-surface-200 rounded-full h-2"><div class="bg-brand-400 h-2 rounded-full" style="width:72%"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1"><span class="text-surface-600">Node.js</span><span class="font-medium text-surface-900">45%</span></div>
              <div class="w-full bg-surface-200 rounded-full h-2"><div class="bg-amber-500 h-2 rounded-full" style="width:45%"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Features Section -->
<section id="features" class="py-20 lg:py-28">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-14">
      <span class="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">Why EduMentor</span>
      <h2 class="text-3xl sm:text-4xl font-bold text-surface-950 mb-4">Everything You Need to Succeed</h2>
      <p class="text-surface-600 max-w-2xl mx-auto">Our platform provides all the tools and resources you need for an effective learning experience.</p>
    </div>
    
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="card-hover bg-white rounded-2xl border border-surface-200/80 p-6 cursor-pointer" onclick="showToast('Video lessons with HD quality streaming', 'info')">
        <div class="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h3 class="font-bold text-surface-900 mb-2">HD Video Lessons</h3>
        <p class="text-sm text-surface-600">Crystal clear video quality with adjustable playback speed. Watch on any device, anytime.</p>
      </div>
      
      <div class="card-hover bg-white rounded-2xl border border-surface-200/80 p-6 cursor-pointer" onclick="showToast('Interactive coding exercises and challenges', 'info')">
        <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
        </div>
        <h3 class="font-bold text-surface-900 mb-2">Hands-On Projects</h3>
        <p class="text-sm text-surface-600">Build real-world projects with step-by-step guidance. Add them to your portfolio.</p>
      </div>
      
      <div class="card-hover bg-white rounded-2xl border border-surface-200/80 p-6 cursor-pointer" onclick="showToast('Earn certificates upon course completion', 'success')">
        <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
        </div>
        <h3 class="font-bold text-surface-900 mb-2">Certificates</h3>
        <p class="text-sm text-surface-600">Earn verified certificates upon completion. Share them on LinkedIn and your resume.</p>
      </div>
      
      <div class="card-hover bg-white rounded-2xl border border-surface-200/80 p-6 cursor-pointer" onclick="showToast('Join our active learning community', 'info')">
        <div class="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </div>
        <h3 class="font-bold text-surface-900 mb-2">Community Access</h3>
        <p class="text-sm text-surface-600">Connect with fellow learners and mentors. Get your questions answered quickly.</p>
      </div>
      
      <div class="card-hover bg-white rounded-2xl border border-surface-200/80 p-6 cursor-pointer" onclick="showToast('Access courses on mobile, tablet, and desktop', 'info')">
        <div class="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
        </div>
        <h3 class="font-bold text-surface-900 mb-2">Mobile Learning</h3>
        <p class="text-sm text-surface-600">Download courses for offline viewing. Learn on the go with our mobile app.</p>
      </div>
      
      <div class="card-hover bg-white rounded-2xl border border-surface-200/80 p-6 cursor-pointer" onclick="showToast('Lifetime access to all purchased courses', 'success')">
        <div class="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h3 class="font-bold text-surface-900 mb-2">Lifetime Access</h3>
        <p class="text-sm text-surface-600">Pay once, learn forever. All course updates are included at no extra cost.</p>
      </div>
    </div>
  </div>
</section>

<!-- Instructors -->
<section id="instructors" class="py-20 bg-surface-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-14">
      <span class="inline-block bg-violet-100 text-violet-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">Expert Instructors</span>
      <h2 class="text-3xl sm:text-4xl font-bold text-surface-950 mb-4">Learn From The Best</h2>
      <p class="text-surface-600 max-w-2xl mx-auto">Our instructors are industry professionals with years of real-world experience.</p>
    </div>
    
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card-hover bg-white rounded-2xl border border-surface-200/80 p-6 text-center cursor-pointer" onclick="showToast('Viewing James Wilson profile', 'info')">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold">JW</div>
        <h4 class="font-bold text-surface-900">James Wilson</h4>
        <p class="text-sm text-surface-500 mb-2">Senior Full-Stack Dev</p>
        <div class="flex items-center justify-center gap-1 mb-2">
          <span class="star-filled text-sm">&#9733;</span>
          <span class="text-sm font-semibold text-surface-700">4.9</span>
        </div>
        <p class="text-xs text-surface-400">12 Courses &middot; 45K Students</p>
      </div>
      <div class="card-hover bg-white rounded-2xl border border-surface-200/80 p-6 text-center cursor-pointer" onclick="showToast('Viewing Sarah Chen profile', 'info')">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-2xl font-bold">SC</div>
        <h4 class="font-bold text-surface-900">Sarah Chen</h4>
        <p class="text-sm text-surface-500 mb-2">Lead UX Designer</p>
        <div class="flex items-center justify-center gap-1 mb-2">
          <span class="star-filled text-sm">&#9733;</span>
          <span class="text-sm font-semibold text-surface-700">4.8</span>
        </div>
        <p class="text-xs text-surface-400">8 Courses &middot; 32K Students</p>
      </div>
      <div class="card-hover bg-white rounded-2xl border border-surface-200/80 p-6 text-center cursor-pointer" onclick="showToast('Viewing Ana Garcia profile', 'info')">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">AG</div>
        <h4 class="font-bold text-surface-900">Ana Garcia</h4>
        <p class="text-sm text-surface-500 mb-2">Data Scientist</p>
        <div class="flex items-center justify-center gap-1 mb-2">
          <span class="star-filled text-sm">&#9733;</span>
          <span class="text-sm font-semibold text-surface-700">4.9</span>
        </div>
        <p class="text-xs text-surface-400">6 Courses &middot; 28K Students</p>
      </div>
      <div class="card-hover bg-white rounded-2xl border border-surface-200/80 p-6 text-center cursor-pointer" onclick="showToast('Viewing David Kim profile', 'info')">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">DK</div>
        <h4 class="font-bold text-surface-900">David Kim</h4>
        <p class="text-sm text-surface-500 mb-2">Motion Designer</p>
        <div class="flex items-center justify-center gap-1 mb-2">
          <span class="star-filled text-sm">&#9733;</span>
          <span class="text-sm font-semibold text-surface-700">4.8</span>
        </div>
        <p class="text-xs text-surface-400">5 Courses &middot; 18K Students</p>
      </div>
    </div>
  </div>
</section>

<!-- Pricing -->
<section id="pricing" class="py-20 lg:py-28">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-14">
      <span class="inline-block bg-accent-100 text-accent-600 text-sm font-semibold px-4 py-1 rounded-full mb-4">Simple Pricing</span>
      <h2 class="text-3xl sm:text-4xl font-bold text-surface-950 mb-4">Choose Your Plan</h2>
      <p class="text-surface-600 max-w-2xl mx-auto">Invest in your future. All plans include lifetime access and a 30-day money-back guarantee.</p>
    </div>
    
    <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      <!-- Free -->
      <div class="card-hover bg-white rounded-2xl border border-surface-200 p-8 cursor-pointer" onclick="showToast('Starting with Free plan!', 'info')">
        <h3 class="text-lg font-bold text-surface-900 mb-1">Starter</h3>
        <p class="text-sm text-surface-500 mb-6">Perfect to get started</p>
        <div class="flex items-baseline gap-1 mb-6">
          <span class="text-4xl font-black text-surface-900">$0</span>
          <span class="text-surface-500">/month</span>
        </div>
        <ul class="space-y-3 mb-8">
          <li class="flex items-center gap-2 text-sm text-surface-700"><svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>5 Free Courses</li>
          <li class="flex items-center gap-2 text-sm text-surface-700"><svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Basic Quizzes</li>
          <li class="flex items-center gap-2 text-sm text-surface-700"><svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Community Access</li>
          <li class="flex items-center gap-2 text-sm text-surface-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>Certificates</li>
          <li class="flex items-center gap-2 text-sm text-surface-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>Offline Access</li>
        </ul>
        <button class="w-full py-3 rounded-xl border-2 border-surface-200 text-surface-700 font-semibold hover:border-brand-300 hover:text-brand-600 transition-all cursor-pointer">Get Started Free</button>
      </div>
      
      <!-- Pro -->
      <div class="card-hover bg-gradient-to-b from-brand-600 to-brand-700 rounded-2xl p-8 text-white relative cursor-pointer" onclick="showToast('Upgrading to Pro plan!', 'success')">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
        <h3 class="text-lg font-bold mb-1">Professional</h3>
        <p class="text-sm text-brand-200 mb-6">For serious learners</p>
        <div class="flex items-baseline gap-1 mb-6">
          <span class="text-4xl font-black">$29</span>
          <span class="text-brand-200">/month</span>
        </div>
        <ul class="space-y-3 mb-8">
          <li class="flex items-center gap-2 text-sm"><svg class="w-5 h-5 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>All 2,000+ Courses</li>
          <li class="flex items-center gap-2 text-sm"><svg class="w-5 h-5 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Advanced Quizzes & Projects</li>
          <li class="flex items-center gap-2 text-sm"><svg class="w-5 h-5 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Verified Certificates</li>
          <li class="flex items-center gap-2 text-sm"><svg class="w-5 h-5 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Priority Support</li>
          <li class="flex items-center gap-2 text-sm"><svg class="w-5 h-5 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Offline Downloads</li>
        </ul>
        <button class="w-full py-3 rounded-xl bg-white text-brand-700 font-bold hover:bg-brand-50 transition-all cursor-pointer pulse-glow">Start 7-Day Trial</button>
      </div>
      
      <!-- Enterprise -->
      <div class="card-hover bg-white rounded-2xl border border-surface-200 p-8 cursor-pointer" onclick="showToast('Contact for Enterprise plan!', 'info')">
        <h3 class="text-lg font-bold text-surface-900 mb-1">Enterprise</h3>
        <p class="text-sm text-surface-500 mb-6">For teams & organizations</p>
        <div class="flex items-baseline gap-1 mb-6">
          <span class="text-4xl font-black text-surface-900">$99</span>
          <span class="text-surface-500">/month</span>
        </div>
        <ul class="space-y-3 mb-8">
          <li class="flex items-center gap-2 text-sm text-surface-700"><svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Everything in Professional</li>
          <li class="flex items-center gap-2 text-sm text-surface-700"><svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Team Management Dashboard</li>
          <li class="flex items-center gap-2 text-sm text-surface-700"><svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Custom Learning Paths</li>
          <li class="flex items-center gap-2 text-sm text-surface-700"><svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Analytics & Reports</li>
          <li class="flex items-center gap-2 text-sm text-surface-700"><svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Dedicated Account Manager</li>
        </ul>
        <button class="w-full py-3 rounded-xl border-2 border-surface-200 text-surface-700 font-semibold hover:border-brand-300 hover:text-brand-600 transition-all cursor-pointer">Contact Sales</button>
      </div>
    </div>
  </div>
</section>

<!-- Testimonials -->
<section id="testimonials" class="py-20 bg-surface-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-14">
      <span class="inline-block bg-rose-100 text-rose-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">Testimonials</span>
      <h2 class="text-3xl sm:text-4xl font-bold text-surface-950 mb-4">What Our Students Say</h2>
      <p class="text-surface-600 max-w-2xl mx-auto">Thousands of students have transformed their careers with EduMentor.</p>
    </div>
    
    <div class="grid md:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl border border-surface-200/80 p-6 card-hover cursor-pointer" onclick="showToast('Reading full testimonial...', 'info')">
        <div class="flex text-amber-400 mb-4">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p class="text-surface-700 text-sm mb-4 leading-relaxed">"EduMentor completely changed my career. I went from a marketing coordinator to a UX designer in just 6 months. The project-based learning approach made all the difference."</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-brand-200 flex items-center justify-center font-bold text-brand-700">A</div>
          <div>
            <p class="font-semibold text-sm text-surface-900">Alex Thompson</p>
            <p class="text-xs text-surface-500">UX Designer at Spotify</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-surface-200/80 p-6 card-hover cursor-pointer" onclick="showToast('Reading full testimonial...', 'info')">
        <div class="flex text-amber-400 mb-4">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p class="text-surface-700 text-sm mb-4 leading-relaxed">"The Python data science course was exactly what I needed. The instructor made complex concepts easy to understand. I landed my dream job within weeks of completing it."</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center font-bold text-emerald-700">M</div>
          <div>
            <p class="font-semibold text-sm text-surface-900">Maria Santos</p>
            <p class="text-xs text-surface-500">Data Analyst at Google</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-surface-200/80 p-6 card-hover cursor-pointer" onclick="showToast('Reading full testimonial...', 'info')">
        <div class="flex text-amber-400 mb-4">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p class="text-surface-700 text-sm mb-4 leading-relaxed">"Best investment I made in myself. The community alone is worth the subscription. Getting feedback from peers and mentors accelerated my learning tremendously."</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-accent-200 flex items-center justify-center font-bold text-accent-700">J</div>
          <div>
            <p class="font-semibold text-sm text-surface-900">Jake Morrison</p>
            <p class="text-xs text-surface-500">Freelance Developer</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="py-20">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJWMGgydjM0em0tNCAwSDE4VjBoMnYzNHptMTIgMEgzMFYwaDJ2MzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      <div class="relative">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4">Start Learning Today</h2>
        <p class="text-brand-200 text-lg mb-8 max-w-xl mx-auto">Join 50,000+ students already transforming their careers. Your first 7 days are free.</p>
        <div class="flex flex-wrap justify-center gap-4">
          <button onclick="showToast('Starting your free trial!', 'success')" class="bg-white text-brand-700 px-8 py-3.5 rounded-xl font-bold hover:bg-brand-50 transition-all cursor-pointer shadow-lg">Start Free Trial</button>
          <button onclick="showToast('Viewing all plans...', 'info')" class="bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all cursor-pointer">View Plans</button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="bg-surface-900 text-white py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      <div>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <span class="text-xl font-bold">EduMentor</span>
        </div>
        <p class="text-surface-400 text-sm leading-relaxed">Empowering learners worldwide with high-quality, accessible education since 2020.</p>
      </div>
      <div>
        <h4 class="font-semibold mb-4">Platform</h4>
        <ul class="space-y-2 text-sm text-surface-400">
          <li><a href="#courses" class="hover:text-white transition-colors cursor-pointer">Browse Courses</a></li>
          <li><a href="#pricing" class="hover:text-white transition-colors cursor-pointer">Pricing</a></li>
          <li><a href="#instructors" class="hover:text-white transition-colors cursor-pointer">Become Instructor</a></li>
          <li><a class="hover:text-white transition-colors cursor-pointer" onclick="showToast('Affiliate program coming soon!', 'info')">Affiliate Program</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-4">Resources</h4>
        <ul class="space-y-2 text-sm text-surface-400">
          <li><a class="hover:text-white transition-colors cursor-pointer" onclick="showToast('Opening Help Center...', 'info')">Help Center</a></li>
          <li><a class="hover:text-white transition-colors cursor-pointer" onclick="showToast('Opening Blog...', 'info')">Blog</a></li>
          <li><a class="hover:text-white transition-colors cursor-pointer" onclick="showToast('Opening Community...', 'info')">Community</a></li>
          <li><a class="hover:text-white transition-colors cursor-pointer" onclick="showToast('Opening Webinars...', 'info')">Webinars</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-4">Legal</h4>
        <ul class="space-y-2 text-sm text-surface-400">
          <li><a class="hover:text-white transition-colors cursor-pointer" onclick="showToast('Privacy Policy page', 'info')">Privacy Policy</a></li>
          <li><a class="hover:text-white transition-colors cursor-pointer" onclick="showToast('Terms of Service page', 'info')">Terms of Service</a></li>
          <li><a class="hover:text-white transition-colors cursor-pointer" onclick="showToast('Cookie Policy page', 'info')">Cookie Policy</a></li>
          <li><a class="hover:text-white transition-colors cursor-pointer" onclick="showToast('Accessibility page', 'info')">Accessibility</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-surface-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-sm text-surface-500">&copy; 2024 EduMentor. All rights reserved.</p>
      <div class="flex items-center gap-4">
        <a class="w-9 h-9 rounded-full bg-surface-800 flex items-center justify-center hover:bg-brand-600 transition-colors cursor-pointer" onclick="showToast('Opening Twitter...', 'info')">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
        </a>
        <a class="w-9 h-9 rounded-full bg-surface-800 flex items-center justify-center hover:bg-brand-600 transition-colors cursor-pointer" onclick="showToast('Opening LinkedIn...', 'info')">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <a class="w-9 h-9 rounded-full bg-surface-800 flex items-center justify-center hover:bg-brand-600 transition-colors cursor-pointer" onclick="showToast('Opening YouTube...', 'info')">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        </a>
      </div>
    </div>
  </div>
</footer>

<!-- Course Detail Modal -->
<div id="course-modal" class="modal-overlay hidden" onclick="closeCourseModal(event)">
  <div class="modal-content" onclick="event.stopPropagation()">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 id="modal-title" class="text-xl font-bold text-surface-900"></h3>
        <button onclick="closeCourseModal()" class="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center cursor-pointer">
          <svg class="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="aspect-video bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl mb-4 flex items-center justify-center">
        <svg class="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <div class="flex items-center gap-4 mb-4">
        <div class="flex items-center gap-1">
          <span class="star-filled">&#9733;</span>
          <span class="font-semibold text-sm">4.9</span>
          <span class="text-xs text-surface-400">(2,400 reviews)</span>
        </div>
        <span class="text-xs text-surface-400">|</span>
        <span class="text-sm text-surface-600">42 hours of content</span>
        <span class="text-xs text-surface-400">|</span>
        <span class="text-sm text-surface-600">All levels</span>
      </div>
      <p class="text-sm text-surface-600 mb-4 leading-relaxed">This comprehensive course takes you from beginner to professional. You will learn through hands-on projects, real-world applications, and expert guidance every step of the way.</p>
      <div class="flex items-center justify-between p-4 bg-surface-50 rounded-xl mb-4">
        <div>
          <span class="text-2xl font-bold text-brand-600">$49.99</span>
          <span class="text-sm text-surface-400 line-through ml-2">$99.99</span>
        </div>
        <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">50% OFF</span>
      </div>
      <div class="flex gap-3">
        <button onclick="showToast('Course added to cart!', 'success'); closeCourseModal();" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold transition-all cursor-pointer">Add to Cart</button>
        <button onclick="showToast('Added to wishlist!', 'info')" class="w-12 h-12 border border-surface-200 rounded-xl flex items-center justify-center hover:bg-surface-50 cursor-pointer">
          <svg class="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </button>
      </div>
    </div>
  </div>
</div>

<script>
// Toast notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)'; toast.style.transition = 'all 0.3s'; setTimeout(() => toast.remove(), 300); }, 2500);
}

// Accordion toggle
function toggleAccordion(btn) {
  const content = btn.nextElementSibling;
  const icon = btn.querySelector('.accordion-icon');
  const isOpen = content.classList.contains('open');
  // Close all others
  document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));
  document.querySelectorAll('.accordion-icon').forEach(i => i.style.transform = '');
  if (!isOpen) {
    content.classList.add('open');
    icon.style.transform = 'rotate(180deg)';
  }
}

// Tab switching
function switchTab(tabName, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('tab-active'); b.classList.add('text-surface-500'); });
  document.getElementById('tab-' + tabName).classList.remove('hidden');
  btn.classList.add('tab-active');
  btn.classList.remove('text-surface-500');
}

// Course filtering
function filterCourses(category, btn) {
  document.querySelectorAll('.course-tab').forEach(t => { t.className = 'course-tab px-5 py-2 rounded-full text-sm font-medium bg-surface-100 text-surface-600 hover:bg-surface-200 transition-all cursor-pointer'; });
  btn.className = 'course-tab px-5 py-2 rounded-full text-sm font-medium bg-brand-600 text-white transition-all cursor-pointer';
  document.querySelectorAll('.course-card').forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = '';
      card.classList.add('fade-in');
    } else {
      card.style.display = 'none';
    }
  });
}

// Quiz
function selectQuiz(option, isCorrect) {
  const options = document.querySelectorAll('.quiz-option');
  const result = document.getElementById('quiz-result');
  options.forEach(o => { o.onclick = null; o.classList.add('selected'); });
  if (isCorrect) {
    option.classList.remove('selected');
    option.classList.add('correct');
    result.textContent = 'Correct! CSS stands for Cascading Style Sheets.';
    result.className = 'mt-3 text-sm font-medium text-emerald-600';
  } else {
    option.classList.remove('selected');
    option.classList.add('wrong');
    // Highlight correct answer (3rd option)
    options[2].classList.remove('selected');
    options[2].classList.add('correct');
    result.textContent = 'Not quite! CSS stands for Cascading Style Sheets.';
    result.className = 'mt-3 text-sm font-medium text-red-600';
  }
  result.classList.remove('hidden');
}

// Course Modal
function openCourseModal(title) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('course-modal').classList.remove('hidden');
  document.body.classList.add('no-scroll');
}

function closeCourseModal(e) {
  if (e && e.target !== e.currentTarget && !e.currentTarget.id) return;
  document.getElementById('course-modal').classList.add('hidden');
  document.body.classList.remove('no-scroll');
}

// Hero video
function playHeroVideo() {
  showToast('Video player opening...', 'info');
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
</script>

</body>
</html>'''

# Write the template HTML file
output_path = '/home/z/my-project/public/templates/edumentor-course-platform.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(template_html)

print(f"Template written to {output_path}")
print(f"Size: {len(template_html)} bytes")
