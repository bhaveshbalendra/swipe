# 🚀 AI-Powered Technical Interview Platform

A modern, full-stack web application that revolutionizes technical interviews using AI to generate personalized questions and provide real-time evaluation of candidate responses.

![Project Status](https://img.shields.io/badge/status-production%20ready-green)
![React](https://img.shields.io/badge/React-18.0+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![AI Powered](https://img.shields.io/badge/AI-Gemini%20API-orange)

## ✨ Features

### 🎯 **For Candidates**

- **Smart Resume Upload**: Upload PDF/Word resumes with AI-powered content extraction
- **Personalized Questions**: AI generates 6 unique questions based on your resume, skills, and experience
- **Real-time Interview**: Interactive chat interface with timers for each question
- **Instant Feedback**: Get immediate AI evaluation and scoring after each answer
- **Comprehensive Results**: Final score with detailed breakdown and summary

### 👨‍💼 **For Interviewers**

- **Candidate Dashboard**: View all candidates with real-time progress tracking
- **Detailed Analytics**: Question-by-question breakdown with AI feedback
- **Score Management**: Track performance across multiple candidates
- **Export Capabilities**: Generate interview reports for hiring decisions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 🤖 **AI-Powered Features**

- **Smart Question Generation**: Creates questions exclusively from candidate's resume and experience
- **Real-time Evaluation**: Instant scoring based on technical accuracy, completeness, and communication
- **Adaptive Difficulty**: Matches question complexity to candidate's experience level
- **Objective Assessment**: Consistent, bias-free evaluation across all candidates

## 🛠️ Tech Stack

### **Frontend**

- **React 18** with TypeScript for type-safe development
- **Ant Design** for modern, responsive UI components
- **Redux Toolkit** for efficient state management
- **React Hook Form** with Zod validation for robust form handling

### **AI Integration**

- **Google Gemini API** for question generation and answer evaluation
- **Resume Parser** for extracting skills and experience from uploaded files
- **Real-time Processing** for instant AI responses

### **Development Tools**

- **Vite** for fast development and optimized builds
- **ESLint & Prettier** for code quality and formatting
- **TypeScript** for type safety and better development experience

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd swipe
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API Key**

   - Get your Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add your API key to the application when prompted
   - Or set it in your environment variables

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Usage

### **For Candidates**

1. **Upload Resume**: Upload your PDF or Word resume
2. **Complete Profile**: Fill in any missing information
3. **Start Interview**: AI generates personalized questions
4. **Answer Questions**: Respond within the time limit for each question
5. **View Results**: Get your final score and detailed feedback

### **For Interviewers**

1. **Access Dashboard**: View all candidates and their status
2. **Monitor Progress**: Track real-time interview progress
3. **Review Results**: Analyze detailed scores and feedback
4. **Make Decisions**: Use comprehensive data for hiring decisions

## 🎨 Screenshots

### Candidate Interface

- **Resume Upload**: Drag-and-drop file upload with AI processing
- **Interview Process**: Real-time chat interface with timers
- **Results Summary**: Comprehensive score breakdown and feedback

### Interviewer Dashboard

- **Candidate List**: Overview of all candidates with status
- **Detailed Analytics**: Question-by-question performance analysis
- **Score Tracking**: Visual progress indicators and final scores

## 🔧 Configuration

### Environment Variables

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### API Configuration

The application supports multiple API key sources:

- Environment variables
- Local storage
- Configuration files

## 📊 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ReactHookForm/   # Form components with validation
│   ├── ResumeUpload.tsx # File upload component
│   └── ChatInterface.tsx # Interview chat interface
├── pages/              # Main application pages
│   ├── IntervieweePage.tsx # Candidate interview page
│   └── InterviewerPage.tsx # Interviewer dashboard
├── store/              # Redux store configuration
│   ├── api/            # API endpoints and queries
│   └── slices/         # Redux slices for state management
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **Google Gemini API** for powerful AI capabilities
- **Ant Design** for beautiful UI components
- **React Community** for excellent documentation and tools

## 📞 Support

For support, email bhaveshbalendra@gmail.com or create an issue in the repository.

---

**Built with ❤️ for modern technical interviews**
