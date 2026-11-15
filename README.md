# Your-Energy

🔗 [Visit the App](https://menixx.github.io/Your-Energy/)

A web application for searching and organizing fitness exercises, providing detailed information about each exercise.

## 📋 Description

**Your-Energy** is an interactive platform that allows users to:

- Browse a catalog of fitness exercises with category filtering
- Read detailed information about each exercise (description, difficulty level, calorie consumption)
- Save favorite exercises to their personal collection
- Leave reviews and ratings for exercises
- Browse popular motivational quotes

## 🎨 Main Features

- **Exercise Catalog** — a comprehensive database of fitness exercises
- **Detailed Information** — extended descriptions, calculated metrics, and difficulty levels
- **Favorites** — save exercises for quick access
- **Ratings and Reviews** — a user rating system
- **Responsive Design** — full support for mobile devices
- **Motivational Quotes** — inspiring quotes to keep users motivated

## 🛠️ Technology Stack

- **Vite** — a fast build tool for frontend projects
- **HTML5 / CSS3** — structure and styling
- **JavaScript (Vanilla)** — application logic without frameworks
- **Responsive Design** — adaptation to all screen sizes
- **PostCSS** — CSS processing with media query sorting

## 📁 Project Structure

```text
Your-Energy/
├── src/
│   ├── index.html              # Main page
│   ├── favorites.html           # Favorite exercises page
│   ├── page-2.html              # Page 2
│   ├── page-3.html              # Page 3
│   ├── main.js                  # Main JavaScript file
│   ├── css/                     # Stylesheets
│   │   ├── styles.css           # Main styles
│   │   ├── header.css            # Header styles
│   │   ├── hero.css              # Hero section styles
│   │   ├── footer.css            # Footer styles
│   │   ├── exercises.css         # Exercise styles
│   │   ├── favorites.css         # Favorites styles
│   │   ├── pop-up.css            # Modal window styles
│   │   └── ...                   # Other stylesheet files
│   ├── img/                     # Images and icons
│   └── partials/                # Reusable HTML components
├── package.json                 # Project configuration
├── vite.config.js               # Vite configuration
└── README.md                    # This file
```

## 🚀 How to Run Locally

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd Your-Energy
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Start the Development Server:**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`.

4. **Build for Production:**

   ```bash
   npm run build
   ```

5. **Preview the Production Build:**

   ```bash
   npm run preview
   ```

## 📱 Breakpoints

The project is optimized for three main screen sizes:

- **Mobile** — by default (< 768px)
- **Tablets** — from 768px
- **Desktops** — from 1440px

## 🎯 Components

The project includes reusable components to ensure modularity:

- `header.html` — navigation bar
- `hero.html` — hero section
- `exercises.html` — exercise list
- `favorites-hero.html` — favorites page hero section
- `pop-up.html` — modal window with detailed information
- `footer.html` — page footer
- `socials.html` — social media links
