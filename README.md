# Mermaid Chart Editor

A professional, feature-rich Mermaid diagram editor built with Next.js, React, and TypeScript. This project demonstrates modern web development practices including component architecture, real-time rendering, security implementation, and performance optimization.

> **Portfolio Reference**: This project is designed as a code reference showcasing architectural patterns and security considerations. See the [Implementation Notes](#implementation-notes) section for design decisions and [Security](#security) for defensive patterns.

## Features

### ✨ Live Preview
- Real-time diagram rendering as you type
- Debounced updates (300ms) for optimal performance
- Smooth loading states and transitions
- Error recovery without losing editor content

### 🎨 Syntax Highlighting
- Monaco Editor integration with custom Mermaid language support
- Custom color theme optimized for Mermaid syntax
- IntelliSense-ready editor with line numbers and code folding

### 📚 Templates Gallery
- 10 pre-built templates covering major diagram types:
  - **Flowcharts**: Basic and complex flow diagrams
  - **Sequence Diagrams**: Basic and advanced sequence flows
  - **ERD**: Entity Relationship Diagrams
  - **State Machines**: Basic and complex state diagrams
  - **Class Diagrams**: Object-oriented design diagrams
  - **Gantt Charts**: Project timeline visualization
  - **Pie Charts**: Simple data visualization
- Templates organized by category
- One-click template insertion
- Shareable URLs with base64-encoded diagrams

### 🔍 Error Panel
- Intelligent error parsing and display
- Line number and position information extraction
- Helpful troubleshooting tips
- Expandable full error details
- Visual error indicators in the preview panel

### 🔒 Security Features
- Rate limiting on exports (daily caps)
- Input validation for suspicious patterns
- URL encoding validation
- Nesting level protection against ReDoS attacks
- Mermaid security level set to 'strict'

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI**: Tailwind CSS for styling
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Diagram Engine**: Mermaid.js
- **Utilities**: use-debounce for performance optimization

## Project Structure

```
mermaid_editor/
├── page.tsx                    # Next.js page wrapper with Suspense boundary
├── client.tsx                  # Main client component with state management
├── components/
│   ├── MermaidEditor.tsx       # Monaco editor with Mermaid syntax highlighting
│   ├── MermaidPreview.tsx      # Live preview renderer with error handling
│   ├── TemplatesGallery.tsx    # Template selection UI with animations
│   ├── ErrorPanel.tsx          # Intelligent error display and parsing
│   └── ExportModal.tsx         # Export functionality with format options
└── lib/
    ├── security.ts            # Security utilities (validation, rate limiting)
    └── templates.ts           # Template definitions and type definitions
```

## Usage

1. **Start Editing**: The editor loads with a basic flowchart template
2. **Choose a Template**: Click the "Browse Templates" button to select from various diagram types
3. **Live Preview**: Watch your diagram update in real-time as you type
4. **Error Handling**: If there's a syntax error, check the error panel at the bottom for detailed information
5. **Export**: Use the Export button to download or copy your diagram

## Keyboard Shortcuts

All standard Monaco Editor shortcuts are available:
- `Ctrl+F` / `Cmd+F`: Find
- `Ctrl+H` / `Cmd+H`: Replace
- `Ctrl+Z` / `Cmd+Z`: Undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z`: Redo
- `Ctrl+/` / `Cmd+/`: Toggle line comment

## Supported Diagram Types

- Flowcharts (TD, LR, TB, BT, RL)
- Sequence Diagrams
- Class Diagrams
- State Diagrams (v2)
- Entity Relationship Diagrams
- Gantt Charts
- Pie Charts
- Git Graphs
- User Journey
- Requirement Diagrams

## Implementation Notes

### Architecture Decisions

#### Component Composition
- **Page Wrapper** (`page.tsx`): Server component with Suspense boundary for graceful loading
- **Client Root** (`client.tsx`): Main client component containing all state management and orchestration
- **Dynamic Imports**: MermaidEditor and MermaidPreview imported dynamically to prevent SSR issues with browser APIs

#### State Management
- **Centralized in `client.tsx`**: All state lives in the root client component, with props passed to children
- **URL Parameters**: Diagram can be shared via URL using base64 encoding (`?diagram=...`)
- **Template Integration**: Seamless template loading without page reload

#### Performance Optimizations
- **Debounced Input** (300ms): Prevents excessive re-renders during rapid typing
- **Dynamic Component Loading**: Monaco and Mermaid are browser-only, loaded after hydration
- **Suspense Boundaries**: Graceful loading states for code-split components
- **Error Isolation**: Errors in preview don't crash the entire application

### Design Patterns Used

1. **Error Boundary Pattern**: `MermaidPreview` catches rendering errors and displays user-friendly messages
2. **Compound Component Pattern**: Editor, Preview, and Templates work together while maintaining independence
3. **Progressive Enhancement**: Editor works with basic Mermaid syntax and gradually enhances with templates
4. **Controlled Component Pattern**: All diagram state flows through parent component

## Security

### Overview

This project demonstrates **defense-in-depth** security principles. While running client-side, it implements multiple layers of protection:

### Security Layers

1. **Input Validation** (`lib/security.ts`)
   - Validates for suspicious JavaScript patterns (javascript:, onclick handlers)
   - Checks for script tags and encoded payload attempts
   - Validates nesting levels to prevent ReDoS attacks
   - Size limits prevent processing of extremely large diagrams

2. **Mermaid Configuration**
   - Security level set to `'strict'` - prevents clickable elements and onclick handlers
   - `startOnLoad: false` - manual initialization prevents unexpected rendering
   - Error logging configured to 'error' level only to prevent information leakage

3. **URL Encoding**
   - Diagrams shared via URL are base64-encoded
   - URL length validated (2048 character max)
   - Encoding validated before decode attempts

4. **Rate Limiting**
   - Daily export limit: 50 per day
   - Hourly template loads: 100 per hour
   - Hourly diagram shares: 30 per hour
   - Limits stored in localStorage (client-side only)

### Important: Production Considerations

> ⚠️ **This implementation is client-side only and designed as a reference.** For production use:

- **Server-Side Validation**: Always validate inputs server-side; client-side validation can be bypassed
- **Content Security Policy**: Implement strict CSP headers to prevent XSS
- **HTTPS Only**: Use HTTPS in production; localStorage is only secure over HTTPS
- **Authentication**: Add user authentication for access control
- **Authorization**: Implement role-based access for different operations
- **Server-Side Rate Limiting**: Implement distributed rate limiting with session tracking
- **Secure Headers**: 
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` or `SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Backend Processing**: Move resource-intensive operations to backend
- **Logging & Monitoring**: Implement security event logging and monitoring

### Security Code Examples

Review these files to understand the security implementation:
- [`lib/security.ts`](lib/security.ts) - Core security utilities and validation logic
- [`components/MermaidPreview.tsx`](components/MermaidPreview.tsx#L20-L30) - Mermaid security configuration
- [`client.tsx`](client.tsx#L50-L60) - URL diagram validation on load

## Dependencies

```json
{
  "mermaid": "^10.0.0+",
  "@monaco-editor/react": "^4.5.0+",
  "use-debounce": "^10.0.0+",
  "next": "^14.0.0+",
  "react": "^18.0.0+",
  "typescript": "^5.0.0+"
}
```

### Performance Optimizations

- Debounced input (300ms delay) prevents excessive re-renders
- Monaco Editor configured with minimal minimap and optimized settings
- Mermaid initialization done once on component mount
- Error boundaries prevent crashes from invalid diagrams
- Dynamic imports prevent loading editor code on server
- Suspense boundaries provide smooth loading transitions

## Resources

- [Mermaid Documentation](https://mermaid.js.org/)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/)
- [Next.js Documentation](https://nextjs.org/docs)
- [OWASP Security Best Practices](https://owasp.org/www-project-web-security-testing-guide/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## License

See [LICENSE](LICENSE) file for details.

