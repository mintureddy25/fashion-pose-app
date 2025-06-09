# Rubik App

🚀 **Live Demo**: [rubik.saiteja.online](https://rubik.saiteja.online)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fashion-pose-app
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment setup**
   - Copy `.env.example` to `.env`
   - Configure your environment variables

4. **Start development server**
   ```bash
   yarn run dev
   ```
   The app will be available at `http://localhost:5173`

## Features

### Single Upload
- Process images directly in the browser
- Generate multiple views/variations
- Upload processed images to server

### Batch Upload
- Upload multiple images simultaneously
- Generate S3 URLs for efficient processing
- Send batch requests to server
- Server adds jobs to RabbitMQ queue
- Background processing script handles queued items
- Real-time status updates

## Architecture

The application uses a queue-based processing system:
1. Images are uploaded and queued via RabbitMQ
2. Background workers process items from the queue
3. Status updates are provided in real-time
4. Processed results are stored and made available

## Built With

- **React** - Modern JavaScript library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Vite** - Fast build tool and development server

---

*Built with modern web technologies for efficient image processing and handling.*
