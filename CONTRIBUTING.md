# Contributing to Blanc

Thank you for your interest in contributing to Blanc! We welcome contributions from developers who share our vision of truly private email.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Setup Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/puiusabin/blanc.git
   cd blanc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your DATABASE_URL and other required config
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## How to Contribute

### Areas We Need Help With

- 🔐 **Security Review**: Cryptographic implementations, key management
- 🧪 **Testing**: Unit tests, integration tests, E2E testing
- 📱 **UI/UX**: Mobile responsiveness, accessibility improvements
- 📚 **Documentation**: Code comments, user guides, technical docs
- 🌍 **Internationalization**: Multi-language support
- 🐛 **Bug Fixes**: Issues tagged as `good first issue`

### Contribution Process

1. **Check existing issues** or create a new one to discuss your idea
2. **Fork the repository** and create a feature branch
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Submit a pull request** with a clear description

### Coding Standards

- Use TypeScript for all new code
- Follow existing code formatting (we use ESLint)
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed

### Security Guidelines

⚠️ **Important Security Requirements:**

- Never commit secrets, API keys, or private keys
- All cryptographic code must be reviewed by multiple contributors
- Use established crypto libraries (TweetNaCl, etc.) - no custom crypto
- Follow secure coding practices for authentication and data handling

### Pull Request Guidelines

- Keep PRs focused and reasonably sized
- Include tests for new functionality
- Update relevant documentation
- Ensure all tests pass (`npm run lint`, `npm run build`)
- Reference related issues in your PR description

### Commit Message Format

```
type: brief description

Longer description if needed

Fixes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Code of Conduct

- Be respectful and inclusive
- Focus on technical merit in discussions
- Help maintain a welcoming environment for all contributors
- Privacy and security are our top priorities

## Questions?

- Open an issue for technical questions
- Join our Discord for real-time discussion
- Email: contribute@blanc.email

## License

By contributing to Blanc, you agree that your contributions will be licensed under the GPL-3.0 License.

---

**Thank you for helping build the future of private email!** 🔐