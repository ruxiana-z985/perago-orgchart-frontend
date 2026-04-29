# Perago Org Chart Frontend

> React-based UI for managing an organizational position hierarchy

![React](https://img.shields.io/badge/React-19-blue)
![Mantine](https://img.shields.io/badge/Mantine-9.x-teal) ![Redux
Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.x-purple)
![Vite](https://img.shields.io/badge/Vite-5.x-yellow)

## Overview

A modern React frontend for the Perago Org Chart API. Provides an
interactive org chart view, a searchable positions table, and direct
CRUD operations through modal dialogs.

### Key Features

-   🌳 Interactive Org Chart
-   📋 Positions Table
-   ✏️ Direct CRUD
-   🔍 Global Search
-   📱 Responsive
-   🎨 Modern UI

------------------------------------------------------------------------

## Quick Start

### Prerequisites

-   Node.js 20.x
-   npm

### Installation

``` bash
git clone <repository-url>
cd perago-orgchart
npm install
npm run dev
```

------------------------------------------------------------------------

## Pages

### Org Chart (/chart)

Interactive tree view of the organization hierarchy.

### Positions Table (/positions)

Paginated, sortable table of all active positions.

### Position Detail (/positions/:id)

Full detail view of a single position.

------------------------------------------------------------------------

## CRUD Operations

Create, edit, and delete positions via modal dialogs.

------------------------------------------------------------------------

## API Configuration

Set your API base URL in `src/api/axios.js`:

``` js
const API_BASE_URL = "http://localhost:3001"
```

For production, use environment variables.
