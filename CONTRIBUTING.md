# Contributing to Health RPG

Thank you for your interest in contributing to Health RPG! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** explaining why this enhancement would be useful
- **Possible implementation** if you have ideas
- **Examples** from other projects if applicable

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the existing code style**
3. **Write clear commit messages**
4. **Include tests** if applicable
5. **Update documentation** as needed
6. **Ensure builds pass** before submitting

#### Branch Naming Convention

- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation changes
- `refactor/description` - for code refactoring

#### Commit Message Guidelines

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests after the first line

Example:
```
Add GPS accuracy indicator to activity tracker

- Display accuracy radius on map
- Show warning for low accuracy readings
- Fixes #123
```

## Development Setup

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

### Quick Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Exercise_diet_rpg_game.git
cd Exercise_diet_rpg_game

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Running Tests

```bash
# Backend type checking
cd backend && npm run type-check

# Frontend build test
cd frontend && npm run build
```

## Project Structure

```
Exercise_diet_rpg_game/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── models/      # MongoDB models
│   │   ├── controllers/ # Route handlers
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   └── config/      # Configuration files
│   └── package.json
└── frontend/            # React + TypeScript UI
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── contexts/    # React contexts
    │   ├── services/    # API service layer
    │   └── types/       # TypeScript types
    └── package.json
```

## Coding Standards

### Backend (TypeScript + Node.js)

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for complex functions
- Use async/await instead of callbacks
- Handle errors appropriately
- Validate user input
- Use middleware for cross-cutting concerns

### Frontend (React + TypeScript)

- Use functional components with hooks
- Follow existing component structure
- Use TypeScript interfaces for props
- Keep components focused and reusable
- Use semantic HTML
- Follow Tailwind CSS conventions
- Ensure accessibility

## Important Considerations

### Ethical AI Usage

This project analyzes physical activity for **gameplay purposes only**. When contributing:

- **Never** provide medical advice or health recommendations
- **Always** include disclaimers about not providing medical advice
- Focus on **game mechanics** rather than health outcomes
- Keep AI analysis **simple and transparent**

### Security

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate and sanitize all user input
- Follow OWASP security best practices
- Use rate limiting on API endpoints
- Implement proper authentication and authorization

### Privacy

- Request only necessary permissions
- Make GPS tracking optional
- Be transparent about data usage
- Store minimal user data
- Follow privacy best practices

## Areas for Contribution

We welcome contributions in these areas:

### High Priority
- Mobile app version (React Native)
- Additional enemy types and encounters
- Quest system
- Achievement system
- Social features (friends, leaderboards)

### Medium Priority
- Equipment and inventory system
- More map biomes and regions
- Character customization
- Sound effects and music
- Improved AI analysis

### Documentation
- API documentation improvements
- Code comments
- Tutorial videos
- Translations

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an issue with the bug template
- **Feature Ideas**: Create an issue with the enhancement template

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- The project README
- Release notes for significant contributions
- GitHub contributors page

Thank you for contributing to Health RPG! 🎮💪
