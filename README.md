# 🇮🇹 Italian Quiz App

A modern Progressive Web App for learning Italian vocabulary with interactive flashcards, quizzes, and intelligent progress tracking. Built with Vue 3, TypeScript, and Vite.

## 🌐 Live Demo

**[Try it now at itali-quiz.netlify.app](https://itali-quiz.netlify.app/)**

## ✨ Features

### 📚 Vocabulary Management
- Add, edit, and organize Italian words by custom categories
- Rich word details with pronunciation tips and examples
- Import/export functionality for backup and sharing
- Smart search across Italian words, English translations, and categories

### 🎯 Intelligent Learning System
- **Learned Words Tracking**: Mark words as mastered to focus on challenging vocabulary
- **Spaced Repetition**: Algorithm prioritizes words based on performance
- **Progress Analytics**: Track your learning journey with detailed statistics
- **Difficulty Levels**: Beginner, Intermediate, and Advanced classification

### 🃏 Interactive Study Modes
- **Flashcards**: Classic flip-card study sessions with customizable settings
- **Quizzes**: Multiple choice, typing, and matching exercises
- **Group Study**: Focus on specific categories or difficulty levels
- **Smart Filtering**: Hide learned words or study only challenging ones

### 📱 Modern PWA Experience
- **Offline Support**: Study anywhere, even without internet
- **Mobile Optimized**: Responsive design works perfectly on all devices
- **Install as App**: Add to home screen for native app experience
- **Fast Performance**: Optimized for quick loading and smooth interactions

### 🎨 Customizable Interface
- **Dark/Light Theme**: Switch between themes for comfortable studying
- **Intuitive Design**: Clean, distraction-free interface
- **Accessibility**: Built with screen readers and keyboard navigation in mind
- **Multiple Languages**: Interface supports localization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with PWA support

### Quick Start
```bash
# Clone the repository
git clone https://github.com/Dmitry-Dem/Itali-quiz.git
cd Itali-quiz

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run preview          # Preview production build locally

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:ui          # Run tests with interactive UI
npm run test:build       # Run tests + production build (CI/CD)
npm run ci               # Alias for test:build
```

### Project Structure
```
src/
├── components/          # Reusable Vue components
├── composables/         # Vue composition functions
├── router/              # Vue Router configuration
├── services/            # API and data services
├── views/               # Page components
├── tests/               # Test files
└── assets/              # Static assets
```

### Architecture Highlights
- **Vue 3 Composition API**: Modern reactive programming
- **TypeScript**: Full type safety and better DX
- **Pinia**: State management with intuitive API
- **Vue Router**: Client-side routing with guards
- **Vite**: Lightning-fast build tool and dev server
- **Vitest**: Fast unit testing framework
- **PWA**: Service worker for offline functionality

## 🧪 Testing

The app includes comprehensive test coverage:
- **Unit Tests**: Component and function testing
- **Integration Tests**: User workflow testing
- **Build Verification**: Production build validation
- **Type Safety**: TypeScript compilation checks

## 📦 Deployment

### Static Hosting (Netlify, Vercel, GitHub Pages)
```bash
npm run build
# Deploy the 'dist' folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:build`)
5. Commit your changes following our [commit convention](#-commit-convention)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### 📝 Commit Convention

We follow a structured commit message format to maintain clear project history:

```
type(scope): SHORT clear description
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependencies

#### Scopes
- **word-list**: Word management features
- **quiz**: Quiz functionality
- **groups**: Category management
- **ui**: User interface components
- **pwa**: Progressive Web App features
- **data**: Data services and storage
- **build**: Build system and dependencies

#### Examples
```bash
feat(word-list): add learned words filtering
fix(quiz): resolve question randomization bug
docs(readme): update installation instructions
style(ui): improve button alignment in word cards
refactor(data): optimize localStorage operations
test(quiz): add comprehensive quiz flow tests
chore(deps): update Vue to latest version
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vue.js](https://vuejs.org/) and [TypeScript](https://www.typescriptlang.org/)
- Icons from [Lucide](https://lucide.dev/)
- Hosted on [Netlify](https://netlify.com/)
- Inspired by modern language learning applications

---

**[Visit the live app →](https://itali-quiz.netlify.app/)**
