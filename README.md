# AI-Powered Interview Assistant

A modern React application that simulates AI-powered interviews.
Candidates can take timed interviews via chat, while interviewers can monitor progress through a dashboard, all with local data persistence.

## 🚀 Features
Interviewee (Chat)

📄 Upload resume (PDF required, DOCX optional)

📝 Auto-extract Name, Email, Phone; chatbot prompts for missing fields

⏱️ Timed interview flow (6 AI-generated questions):

2 Easy → 20s each

2 Medium → 60s each

2 Hard → 120s each

✅ Auto-submit answers when time expires

📊 AI generates final score and short summary

Interviewer (Dashboard)

📋 View all candidates with final scores and summaries

## 🔍 Search and sort candidates

## 🖱️ Click a candidate to see:

Full chat history

Profile details

AI-generated evaluation summary

Persistence

💾 Local data storage via Redux + Redux-Persist or IndexedDB

🔄 Resume paused interviews with “Welcome Back” modal

## 🛠️ Tech Stack

React

Redux + Redux-Persist (state & persistence)

TypeScript

TailwindCSS + shadcn-ui (UI components)

pdf-parse (PDF resume parsing)

docx (DOCX resume parsing)

react-timer-hook (timers per question)

## 🔗 Demo Link

[Live Preview](https://ai-powered-interview-assistant-opal.vercel.app/)

## 🎥 Demo Video
[Watch the video](https://drive.google.com/file/d/1JpdCOsMsWP-3wFsvR1gseYIoQf9bE4nQ/view?usp=sharing)

