# Knowledge Base
A full-stack knowledge management application inspired by Zettelkasten principles.
Users can create notes, organize them with tags, link related ideas together, and track writing activity over time.

Built with modern web technologies and deployed to production.

## 🚀 Features

- 📝 Create, edit, and delete notes

- 🏷 Create and assign multiple tags per note

- 🔗 Link notes together with automatic backlinks

- 🔍 Search notes by title

- 🎯 Filter notes by tag

- 📊 Insights dashboard (7-day / 30-day activity stats)

- 🌙 Custom light and dark theme system

- 🔐 Lightweight per-user isolation using userKey

## 🧱 Tech Stack

### Frontend

- Next.js (App Router)

- React

- Tailwind CSS

- shadcn/ui

### Backend

- Next.js Route Handlers

- Prisma ORM

- PostgreSQL

### Database

- Docker (local development)

- Neon (production)

### Deployment

- Vercel

## 🧠 What This Project Demonstrates

This project demonstrates:

- Designing relational database schemas (many-to-many & self-referencing relations)

- Implementing join tables (NoteTag) and directed graph relations (NoteLink)

- Transaction handling with Prisma

- Secure per-user data isolation without full auth complexity

- Building RESTful API routes in Next.js

- Query filtering (search + tag filtering)

- Managing client/server boundaries in App Router

- Production deployment with environment configuration

- Using Docker for consistent local development

## 🗄 Data Modeling Highlights

- Many-to-many tagging system

- Self-referencing note links (outgoing + backlinks)

- Composite primary keys for join tables

- Indexed queries for user-scoped filtering

## 📈 Insights System
- The insights dashboard calculates:

- Notes created in a time range

- Notes updated in a time range

## 🔮 Future Improvements

- Real authentication (NextAuth)

- Markdown support

- Graph visualization of note links

- Full tag management UI

- Collaborative/shared notes

- Export / import functionality

- Mobile-first UI refinement

- Most frequently used tags

Demonstrates aggregate queries and server-side computation.
