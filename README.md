# Portfolio

My personal portfolio website. React + Vite frontend that fetches real-time data from [portfolio-api](https://github.com/THatch26/portfolio-api).

## Quick Start

```bash
# Clone both repos side by side
git clone https://github.com/THatch26/portfolio-api.git
git clone https://github.com/THatch26/portfolio.git

# Start everything with Docker
cd portfolio-api
cp .env.example .env
make up
```

Open `http://localhost:3000`

## Sections

| Section           | Description                                            |
|-------------------|--------------------------------------------------------|
| **Hero**          | Name, role, typewriter tagline, live GitHub stat pills |
| **Skills**        | Interactive SVG node graph with category colors        |
| **Projects**      | 4 project cards with live GitHub stats and README drawer |
| **API Explorer**  | Live backend testing panel with collapsible JSON tree  |
| **Timeline**      | Scroll-triggered fade+slide vertical timeline          |
| **Contact**       | Form with validation, character counter, Discord webhook |

## Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React 18, Vite, CSS Modules  |
| Charts   | Plain SVG (sin/cos math)      |
| API      | Fetch via /src/lib/api.js     |
| Backend  | portfolio-api (Fastify)       |
| Deploy   | Docker, nginx:alpine          |

## Dev Mode

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## License

MIT
