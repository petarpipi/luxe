import { createRoot, hydrateRoot } from 'react-dom/client'
import Root from './Root'
import './styles.css'

const container = document.getElementById('root')!
// Production HTML is prerendered (scripts/prerender.mjs); the dev server starts empty.
if (container.hasChildNodes()) hydrateRoot(container, <Root />)
else createRoot(container).render(<Root />)
