
# Text Authenticity Detector

**Elevator Pitch:** An AI-powered web application that analyzes text authenticity using advanced detection algorithms, featuring OCR capabilities for image-to-text conversion, customizable analysis modes, and comprehensive history tracking to help users identify potentially AI-generated content.

## Inspiration

The rise of AI-generated content has made it increasingly difficult to distinguish between human-written and machine-generated text. This project was inspired by the need for a reliable, user-friendly tool that can help educators, content creators, and professionals verify text authenticity in an era where AI writing tools are becoming ubiquitous.

## What it does

The Text Authenticity Detector provides:
- **Text Analysis**: Advanced AI detection algorithms that analyze text patterns to identify potentially AI-generated content
- **OCR Integration**: Upload images containing text and extract it automatically using Tesseract.js
- **Dual Analysis Modes**: Toggle between "Critical" mode (strict detection) and "Generous" mode (fair assessment)
- **History Tracking**: Local storage-based history system to review previous analyses
- **Responsive Design**: Modern, accessible interface built with shadcn/ui components

## How we built it

- **Frontend Framework**: React with TypeScript for type safety and component-based architecture
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, modern design
- **OCR Technology**: Tesseract.js for optical character recognition from uploaded images
- **State Management**: React hooks and local storage for data persistence
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Custom components built on Radix UI primitives for accessibility

## Challenges we ran into

- **OCR Accuracy**: Fine-tuning Tesseract.js settings to achieve reliable text extraction from various image qualities
- **Analysis Algorithm**: Balancing detection sensitivity between the critical and generous modes
- **Local Storage Management**: Implementing efficient history storage without overwhelming browser storage limits
- **Responsive Design**: Ensuring the interface works seamlessly across different screen sizes and devices

## Accomplishments that we're proud of

- Successfully integrated OCR functionality with seamless user experience
- Created a flexible analysis system with customizable detection modes
- Implemented a comprehensive history system using local storage
- Built a fully responsive, accessible interface following modern design principles
- Achieved smooth text processing workflow from input to analysis results

## What we learned

- Advanced integration of OCR libraries in web applications
- Effective state management patterns for complex user interactions
- Best practices for local storage implementation and data persistence
- Modern React development patterns with TypeScript
- Accessibility considerations in UI component design

## Project Documentation

### Technologies Used
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **OCR**: Tesseract.js
- **State Management**: React Hooks, Local Storage
- **Icons**: Lucide React
- **Build Tools**: Vite, TypeScript compiler

### Project Structure
```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── TextEvaluator.tsx   # Main application component
│   ├── AnalysisInput.tsx   # Text input and OCR interface
│   ├── AnalysisResults.tsx # Results display component
│   └── HistoryTab.tsx      # History management interface
├── utils/
│   ├── textAnalysis.ts     # Text analysis algorithms
│   └── ocrService.ts       # OCR processing utilities
└── pages/
    └── Index.tsx           # Main page component
```

### Features
1. **Text Input**: Manual text entry with scrollable textarea
2. **Image Upload**: OCR processing with loading states and error handling
3. **Analysis Modes**: Toggle between critical and generous detection
4. **Results Display**: Comprehensive analysis with confidence scores
5. **History System**: Local storage-based previous analysis tracking
6. **Responsive Design**: Mobile-first approach with desktop optimization

### Development

To run the project locally:

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Deployment

Deploy your application using Lovable's built-in deployment:
1. Open your [Lovable Project](https://lovable.dev/projects/8986cc29-cea3-4967-8065-192d107bbb05)
2. Click Share → Publish
3. Your app will be live with a custom URL

### Custom Domain Setup

To connect a custom domain:
1. Navigate to Project → Settings → Domains
2. Click "Connect Domain"
3. Follow the setup instructions

*Note: Custom domains require a paid Lovable plan.*

---

*Built with ❤️ using Lovable - The AI-powered web development platform*
