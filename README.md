# 🇮🇹 Italian Quiz App

A Progressive Web App I built to help **me** learn Italian vocabulary with interactive flashcards, quizzes, and progress tracking. Built with Vue 3, TypeScript, and Vite.

---

## ⚠️ Warning: Hardcore Developer Bullshit Ahead

Listen up. This app:

* Was built **fast**, just to help me **learn Italian**. Not to win awards, not to impress anyone, not to follow any “best practices.”
* **Contains massive amounts of bullshit code**. Some parts are ugly, smelly, hacky, and will make you question your life choices. You’ve been warned.
* No ads, no subscriptions, no useless crap—just pure language learning.
* The goal was simple: **get it working ASAP**. It’s not perfect, it’s not clean, it just **does what I need**.
* I’ll keep updating it when I need more stuff, but for now, it has everything I personally need to study Italian.

Enjoy the chaos. Cry a little if you must.

---

## 🌐 Live Demo

**[Try it now at itali-quiz.netlify.app](https://itali-quiz.netlify.app/)**

> ⚠️ The app is mainly designed as a **PWA on iOS**. It works fine on other devices, I guess, but your mileage may vary.

---

## ✨ Features

### 📚 Vocabulary Management

* Add, edit, and organize Italian words by categories
* Basic word details with Italian word and English translation
* **Bulk import**: Import multiple words at once from text
* **Find duplicates**: Clean up duplicate words with smart matching
* **Backup & restore**: Export/import your data for backup
* Simple search across words and translations
* Organize words into groups/categories
* **Translation toggle**: Hide/show translations in word lists

### 📝 Notes

* Create and organize personal notes for Italian learning
* Color-coded categories
* Basic text formatting

### 🎯 Simple Learning

* **Mark words as learned**: Basic toggle to track which words you know
* **Focus on what you need**: Hide learned words to study only new ones
* **Categories**: Group words by topics (food, travel, etc.)

### 🃏 Study Modes

* **Flashcards**: Basic flip-card sessions to test yourself
* **Quiz**: Multiple choice or typing practice with bidirectional translation
  * Choose Italian→English or English→Italian direction
  * Write answers or select from multiple choice
  * Custom word ranges for focused practice
  * Session stats with letter grades (A+ to F) and score summary
* **Group Study**: Focus on specific word categories
* **Basic Filtering**: Show/hide learned words

### 📱 PWA Experience

* **Works offline**: Study without internet once loaded
* **Mobile friendly**: Designed mainly for phone use
* **Install as app**: Add to home screen
* **Fast enough**: Loads quickly, does what it needs to do

### 🎨 Simple Interface

* **Multiple themes**: 8 different color themes (dark, light, ocean, etc.)
* **Clean design**: No fancy bullshit, just words and quizzes
* **Mobile-first**: Works best on phones

---

## 🖼️ Screenshots

### Mobile Views

<details>
  <summary>Show Main Page (Ocean Theme)</summary>
  <p align="center">
    <img src="https://github.com/Dmitry-Dem/Itali-quiz/blob/main/src/assets/screenshots/mobile-main.png" alt="Mobile Main Page">
  </p>
</details>

<details>
  <summary>Show Bulk Import (Midnight Theme)</summary>
  <p align="center">
    <img src="https://github.com/Dmitry-Dem/Itali-quiz/blob/main/src/assets/screenshots/mobile-bulk-import.png" alt="Mobile Bulk Import">
  </p>
</details>

<details>
  <summary>Show Backup & Restore (Forest Theme)</summary>
  <p align="center">
    <img src="https://github.com/Dmitry-Dem/Itali-quiz/blob/main/src/assets/screenshots/mobile-backup.png" alt="Mobile Backup">
  </p>
</details>

<details>
  <summary>Show Quiz/Flashcards (Ocean Theme)</summary>
  <p align="center">
    <img src="https://github.com/Dmitry-Dem/Itali-quiz/blob/main/src/assets/screenshots/mobile-quiz.png" alt="Mobile Quiz">
  </p>
</details>

### Desktop View

<details>
  <summary>Show Desktop Interface</summary>
  <p align="center">
    <img src="https://github.com/Dmitry-Dem/Itali-quiz/blob/main/src/assets/screenshots/desktop.png" alt="Desktop View">
  </p>
</details>

> Tip: The UI is mainly designed for mobile PWA use. Desktop works too, but some things may look a bit “meh.”

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+ and npm
* Modern web browser with PWA support

### Quick Start

```bash
# Clone the repo
git clone https://github.com/Dmitry-Dem/Itali-quiz.git
cd Itali-quiz

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see it in action.

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev      # Hot reload dev server
npm run build    # Build for production
npm run preview  # Preview production build

# Testing
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:ui    # Interactive test UI
npm run test:build # Run tests + production build
npm run ci         # Alias for test:build
```

### Project Structure

```
src/
├── components/   # Reusable Vue components
├── composables/  # Vue composition functions
├── router/       # Vue Router setup
├── services/     # API/data services
├── views/        # Page components
├── tests/        # Test files
└── assets/       # Images, icons, static files
```

### Architecture Highlights

* Vue 3 Composition API for reactive programming
* TypeScript for type safety and better DX
* Pinia for state management
* Vue Router with guards for navigation
* Vite for lightning-fast builds and dev server
* Vitest for unit testing
* PWA support for offline functionality

---

## 🧪 Testing

* **Unit Tests**: Components and functions
* **Integration Tests**: User workflows
* **Build Verification**: Check production builds
* **Type Safety**: TypeScript compilation

---

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

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:build`)
5. Commit using [my commit convention](#-commit-convention)
6. Push the branch
7. Open a Pull Request

### 📝 Commit Convention

```
type(scope): SHORT clear description
```

**Types**

* feat, fix, docs, style, refactor, test, chore

**Scopes**

* word-list, quiz, groups, ui, pwa, data, build

**Examples**

```bash
feat(word-list): add learned words filtering
fix(quiz): resolve question randomization bug
docs(readme): update installation instructions
style(ui): fix button alignment
refactor(data): optimize localStorage
test(quiz): add full quiz flow tests
chore(deps): update Vue to latest version
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

* Built with [Vue.js](https://vuejs.org/) and [TypeScript](https://www.typescriptlang.org/)
* Icons from [Lucide](https://lucide.dev/)
* Hosted on [Netlify](https://netlify.com/)
* Inspired by modern language-learning apps

---

**[Check the live app →](https://itali-quiz.netlify.app/)**