# Zebra Work Log (Frontend)

Frontend for the [Zebra Work Log](https://github.com/pacerclub/zebra) project.

## Features
- **Timer & Work Tracking**: Start/pause timers to record work sessions.
- **Multiple Input Methods**: Supports GitHub commit linking, voice input, media uploads, and text notes.
- **AI-Powered Organization**: Automatically generates summaries, technical highlights, and structured logs.
- **Documentation & Export**: Outputs logs in Markdown/PDF formats.
- **Community & Motivation (Optional)**: Public log sharing, productivity tracking, and hackathon rewards.

## Tech Stack
- **Frontend**: Next.js (React, TypeScript, Tailwind CSS)
- **API Integration**: Fetches data from the Zebra backend (Go + PostgreSQL)
- **Auth & GitHub Integration**: OAuth login, commit data extraction

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/pacerclub/zebra-frontend.git
   cd zebra-frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables (`.env.local`):
   ```env
   NEXT_PUBLIC_API_BASE_URL=<backend_api_url>
   NEXT_PUBLIC_GITHUB_CLIENT_ID=<your_github_client_id>
   ```

4. Run the development server:
   ```sh
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## Contributing
We're welcome to contributions. Feel free to open issues or PRs.

## License
This project is licensed under the [AGPL 3.0 License](LICENSE).

## Contact
For any inquiries, contact [July Wu](https://github.com/JLW-7) or [Zigao Wang](https://github.com/ZigaoWang)
